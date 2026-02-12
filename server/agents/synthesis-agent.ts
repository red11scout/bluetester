import Anthropic from "@anthropic-ai/sdk";
import type { Agent, WorkshopContext, SynthesisOutput } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const SYNTHESIS_PROMPT = `You are an AI Workshop Synthesis Agent. You generate executive-level recommendations, implementation roadmaps, and final reports from the complete workshop output.

You have access to ALL previous agent outputs:
- Reconciled use cases (merged from ResearchApp + CognitionTwo)
- Survey readiness scores (Skills, Data, Infrastructure, Governance)
- Challenge findings (assumptions that were questioned)
- Validation results (risk-adjusted benefits)
- Prioritization matrix (2x2 Impact vs Feasibility)
- Workflow maps (current vs AI-automated)
- Data lineage (sources, inputs, outputs, governance)

YOUR OUTPUT MUST INCLUDE:

1. **Executive Summary** — 2-3 paragraph overview of findings and recommendations
2. **Top 5 Recommendations** — Specific, actionable recommendations ranked by impact
3. **Implementation Roadmap**:
   - 30 Days: Quick wins to build momentum and prove value
   - 60 Days: Scale pilots and build infrastructure
   - 90 Days: Operationalize and measure ROI
4. **Risk Register** — Top risks with likelihood, impact, and mitigation strategies
5. **Resource Requirements** — What the organization needs (people, tools, data, budget)
6. **Total Estimated Value** — Risk-adjusted portfolio value from validation results
7. **Top Quick Wins** — Use cases that should start immediately

OUTPUT FORMAT (strict JSON):
{
  "executiveSummary": "...",
  "topRecommendations": ["Rec 1", "Rec 2", "Rec 3", "Rec 4", "Rec 5"],
  "implementationRoadmap": {
    "thirtyDay": ["Action 1", "Action 2", "Action 3"],
    "sixtyDay": ["Action 1", "Action 2", "Action 3"],
    "ninetyDay": ["Action 1", "Action 2", "Action 3"]
  },
  "riskRegister": [
    {
      "risk": "...",
      "likelihood": "high|medium|low",
      "impact": "high|medium|low",
      "mitigation": "..."
    }
  ],
  "resourceRequirements": ["Req 1", "Req 2"],
  "totalEstimatedValue": 0,
  "topQuickWins": ["UC-001: Use case name", "UC-002: Use case name"]
}`;

export const synthesisAgent: Agent = {
  name: "Workshop Synthesis Agent",
  role: "Strategic Advisor",
  goal: "Generate executive summary, recommendations, roadmap, and final workshop report",

  async execute(context: WorkshopContext): Promise<SynthesisOutput> {
    const startTime = Date.now();

    const useCases = context.reconciledUseCases || [];
    const surveyScores = context.surveyDimensionScores;
    const previousOutputs = context.previousAgentOutputs;

    const userPrompt = `Synthesize the complete workshop findings for ${context.companyName} (${context.industry}):

USE CASES (${useCases.length} total):
${JSON.stringify(useCases.map(uc => ({
  id: uc.id,
  title: uc.title,
  totalAnnualValue: uc.totalAnnualValue,
  quadrant: uc.quadrant,
  agenticPattern: uc.agenticPattern,
  horizon: uc.horizon,
})), null, 2)}

SURVEY READINESS SCORES:
${surveyScores ? JSON.stringify(surveyScores, null, 2) : "Not available"}

PREVIOUS AGENT INSIGHTS:
${Object.entries(previousOutputs).map(([name, output]) =>
  `${name}: ${output.insights.join("; ")}`
).join("\n\n")}

Generate the executive summary, top 5 recommendations, 30/60/90 day roadmap, risk register, and resource requirements. Be specific to the company's industry and use cases.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 6144,
      system: SYNTHESIS_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Synthesis Agent");
    }

    let response = content.text.trim();
    if (response.startsWith("```json")) response = response.slice(7);
    if (response.startsWith("```")) response = response.slice(3);
    if (response.endsWith("```")) response = response.slice(0, -3);

    const parsed = JSON.parse(response.trim());

    return {
      agentName: "Workshop Synthesis Agent",
      insights: [
        `${parsed.topRecommendations?.length || 0} recommendations generated`,
        `${parsed.topQuickWins?.length || 0} quick wins identified`,
        `${parsed.riskRegister?.length || 0} risks in register`,
        `Estimated portfolio value: $${((parsed.totalEstimatedValue || 0) / 1000000).toFixed(1)}M`,
      ],
      structuredData: {
        executiveSummary: parsed.executiveSummary,
        topRecommendations: parsed.topRecommendations,
        implementationRoadmap: parsed.implementationRoadmap,
        riskRegister: parsed.riskRegister,
        resourceRequirements: parsed.resourceRequirements,
        totalEstimatedValue: parsed.totalEstimatedValue,
        topQuickWins: parsed.topQuickWins,
      },
      confidence: 0.85,
      reasoning: "Synthesis based on all 7 previous agent outputs, survey scores, and industry context.",
      durationMs: Date.now() - startTime,
    };
  },
};
