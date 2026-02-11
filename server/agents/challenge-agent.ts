import Anthropic from "@anthropic-ai/sdk";
import type { Agent, WorkshopContext, ChallengeOutput } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const CHALLENGE_PROMPT = `You are an AI Assumption Challenge Agent. You act as a rigorous, evidence-based skeptic who stress-tests every assumption, KPI, and financial projection in an AI use case portfolio.

YOUR APPROACH:
1. Examine each use case's benefit claims (revenue, cost, cash flow, risk) against industry benchmarks
2. Challenge adoption timelines and time-to-value estimates
3. Question data readiness assumptions vs. what the use case actually requires
4. Identify friction points that may be understated or missing
5. Flag where agentic patterns may be over-engineered for the actual need
6. Challenge any KPI that seems optimistic vs. published benchmarks

For each challenge, provide:
- The specific field being challenged
- The original value
- Your proposed adjusted value (or range)
- Evidence/reasoning for the challenge
- Severity: "low" (minor adjustment), "medium" (material impact), "high" (critical concern)

OUTPUT FORMAT (strict JSON):
{
  "challenges": [
    {
      "useCaseId": "UC-001",
      "challengeType": "assumption",
      "fieldName": "costBenefit",
      "originalValue": 500000,
      "challengedValue": 300000,
      "evidence": "Industry benchmark for similar RPA implementations shows 30-40% cost reduction, not the 60% assumed. Source: McKinsey 2024 automation survey.",
      "severity": "high"
    }
  ],
  "totalChallenges": 0,
  "highSeverityCount": 0,
  "summary": "Brief overview of the most critical challenges found"
}`;

export const challengeAgent: Agent = {
  name: "Assumption Challenge Agent",
  role: "Evidence-Based Skeptic",
  goal: "Stress-test every assumption, KPI, and financial projection in the use case portfolio",

  async execute(context: WorkshopContext): Promise<ChallengeOutput> {
    const startTime = Date.now();

    const useCases = context.reconciledUseCases || [];
    const surveyScores = context.surveyDimensionScores;

    const userPrompt = `Challenge the assumptions in these AI use cases for ${context.companyName} (${context.industry}):

USE CASES:
${JSON.stringify(useCases.map(uc => ({
  id: uc.id,
  title: uc.title,
  businessFunction: uc.businessFunction,
  revenueBenefit: uc.revenueBenefit,
  costBenefit: uc.costBenefit,
  cashFlowBenefit: uc.cashFlowBenefit,
  riskBenefit: uc.riskBenefit,
  totalAnnualValue: uc.totalAnnualValue,
  threeYearNPV: uc.threeYearNPV,
  timeToValue: uc.timeToValue,
  dataReadiness: uc.dataReadiness,
  effortScore: uc.effortScore,
  agenticPattern: uc.agenticPattern,
  horizon: uc.horizon,
  trustTaxPercent: uc.trustTaxPercent,
  legacyAnnualCost: uc.legacyAnnualCost,
})), null, 2)}

${surveyScores ? `SURVEY READINESS SCORES: ${JSON.stringify(surveyScores)}` : "No survey scores yet — challenge data readiness assumptions more aggressively."}

Challenge every assumption. Be thorough but fair. Prioritize high-impact challenges that could materially change the business case.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 6144,
      system: CHALLENGE_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Challenge Agent");
    }

    let response = content.text.trim();
    if (response.startsWith("```json")) response = response.slice(7);
    if (response.startsWith("```")) response = response.slice(3);
    if (response.endsWith("```")) response = response.slice(0, -3);

    const parsed = JSON.parse(response.trim());

    return {
      agentName: "Assumption Challenge Agent",
      insights: [
        `Found ${parsed.totalChallenges || parsed.challenges.length} challenges across ${useCases.length} use cases`,
        `${parsed.highSeverityCount || parsed.challenges.filter((c: any) => c.severity === "high").length} high-severity issues`,
        parsed.summary || "",
      ].filter(Boolean),
      structuredData: {
        challenges: parsed.challenges,
        totalChallenges: parsed.challenges.length,
        highSeverityCount: parsed.challenges.filter((c: any) => c.severity === "high").length,
      },
      confidence: 0.8,
      reasoning: "Challenges based on industry benchmarks, published case studies, and cross-referencing survey readiness scores.",
      durationMs: Date.now() - startTime,
    };
  },
};
