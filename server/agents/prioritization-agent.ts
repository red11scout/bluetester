import Anthropic from "@anthropic-ai/sdk";
import type { Agent, WorkshopContext, PrioritizationOutput } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const PRIORITIZATION_PROMPT = `You are an AI Prioritization Agent. You score each use case on two axes to place them in a 2x2 matrix:

**Impact (Value) Score** — Y-axis, 0-10:
- Total annual value (weighted 30%)
- Strategic theme alignment (20%)
- Scope of improvement — employees/processes affected (20%)
- Revenue vs cost vs risk benefit mix (15%)
- 3-year NPV (15%)

**Feasibility (Readiness) Score** — X-axis, 0-10:
- Survey dimension scores mapped to use case requirements (40%)
  - If use case needs strong data → weight Data Readiness dimension heavily
  - If use case needs governance → weight Governance dimension
- Data readiness score from ResearchApp (20%)
- Implementation complexity / effort score (20%)
- Change management difficulty (10%)
- Existing infrastructure alignment (10%)

**Quadrants**:
- **Quick Wins** (top-right): Impact >= 6, Feasibility >= 6 — Implement immediately
- **Strategic Bets** (top-left): Impact >= 6, Feasibility < 6 — Plan and invest
- **Fill-Ins** (bottom-right): Impact < 6, Feasibility >= 6 — Easy but low value
- **Deprioritize** (bottom-left): Impact < 6, Feasibility < 6 — Revisit later

OUTPUT FORMAT (strict JSON):
{
  "priorities": [
    {
      "useCaseId": "UC-001",
      "useCaseTitle": "...",
      "impactScore": 7.5,
      "feasibilityScore": 8.2,
      "quadrant": "quick_win",
      "impactBreakdown": {
        "annualValueWeight": 2.4,
        "strategicAlignmentWeight": 1.6,
        "scopeWeight": 1.5,
        "benefitMixWeight": 1.0,
        "npvWeight": 1.0
      },
      "feasibilityBreakdown": {
        "surveyScoreWeight": 3.2,
        "dataReadinessWeight": 1.8,
        "complexityWeight": 1.6,
        "changeManagementWeight": 0.8,
        "infraAlignmentWeight": 0.8
      }
    }
  ],
  "quickWinCount": 0,
  "strategicCount": 0,
  "summary": "Brief prioritization analysis"
}`;

export const prioritizationAgent: Agent = {
  name: "Prioritization Agent",
  role: "Strategic Decision Analyst",
  goal: "Score each use case on Impact and Feasibility axes for 2x2 matrix placement",

  async execute(context: WorkshopContext): Promise<PrioritizationOutput> {
    const startTime = Date.now();

    const useCases = context.reconciledUseCases || [];
    const surveyScores = context.surveyDimensionScores;
    const challengeData = context.previousAgentOutputs["Assumption Challenge Agent"];
    const validationData = context.previousAgentOutputs["Benefit Validation Agent"];

    const userPrompt = `Score these AI use cases for ${context.companyName} (${context.industry}) on Impact (0-10) and Feasibility (0-10):

USE CASES:
${JSON.stringify(useCases.map(uc => ({
  id: uc.id,
  title: uc.title,
  businessFunction: uc.businessFunction,
  totalAnnualValue: uc.totalAnnualValue,
  threeYearNPV: uc.threeYearNPV,
  dataReadiness: uc.dataReadiness,
  effortScore: uc.effortScore,
  timeToValue: uc.timeToValue,
  horizon: uc.horizon,
  agenticPattern: uc.agenticPattern,
  aiPrimitives: uc.aiPrimitives,
  strategicTheme: uc.strategicTheme,
  revenueBenefit: uc.revenueBenefit,
  costBenefit: uc.costBenefit,
  riskBenefit: uc.riskBenefit,
  implementationRisk: uc.implementationRisk,
  legacyAnnualCost: uc.legacyAnnualCost,
})), null, 2)}

SURVEY READINESS SCORES:
${surveyScores ? JSON.stringify(surveyScores, null, 2) : "Not available — use conservative feasibility estimates."}

${validationData ? `VALIDATION INSIGHTS:\n${JSON.stringify(validationData.insights, null, 2)}` : ""}
${challengeData ? `CHALLENGE INSIGHTS:\n${JSON.stringify(challengeData.insights, null, 2)}` : ""}

Apply the weighted scoring model. Map survey dimensions to each use case's specific requirements.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 6144,
      system: PRIORITIZATION_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Prioritization Agent");
    }

    let response = content.text.trim();
    if (response.startsWith("```json")) response = response.slice(7);
    if (response.startsWith("```")) response = response.slice(3);
    if (response.endsWith("```")) response = response.slice(0, -3);

    const parsed = JSON.parse(response.trim());

    const quickWins = parsed.priorities.filter((p: any) => p.quadrant === "quick_win").length;
    const strategic = parsed.priorities.filter((p: any) => p.quadrant === "strategic").length;

    return {
      agentName: "Prioritization Agent",
      insights: [
        `${quickWins} Quick Wins identified (high value + high feasibility)`,
        `${strategic} Strategic Bets (high value, needs investment)`,
        `${parsed.priorities.filter((p: any) => p.quadrant === "fill_in").length} Fill-Ins (easy but lower value)`,
        `${parsed.priorities.filter((p: any) => p.quadrant === "deprioritize").length} Deprioritized`,
        parsed.summary || "",
      ].filter(Boolean),
      structuredData: {
        priorities: parsed.priorities,
        quickWinCount: quickWins,
        strategicCount: strategic,
      },
      confidence: 0.85,
      reasoning: "Scores based on weighted Impact (value, NPV, strategic alignment) and Feasibility (survey readiness, data readiness, complexity).",
      durationMs: Date.now() - startTime,
    };
  },
};
