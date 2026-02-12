import Anthropic from "@anthropic-ai/sdk";
import type { Agent, WorkshopContext, ReconciliationOutput } from "./types";
import type { ReconciledUseCase } from "@shared/schema";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const RECONCILIATION_PROMPT = `You are an AI Use Case Reconciliation Agent. You merge use case data from two different analysis systems into a unified model.

SOURCE 1 - ResearchApp: Provides financial analysis including:
- Use case names with business functions, AI primitives, friction points
- Revenue, Cost, Cash Flow, Risk benefits (quantified in $)
- 3-year NPV, priority scores, token costs
- Data readiness, effort scores, time-to-value

SOURCE 2 - CognitionTwo: Provides cognitive analysis including:
- Use case titles with agentic patterns (drafter-critic, reasoning-engine, orchestrator, tool-user)
- Horizon mapping (H1/H2/H3), business value (1-10), implementation risk (1-10)
- Trust tax %, LCOAI
- Legacy process details (steps, pain points, annual cost, translation tax, context switching)
- Agentic transformation details (pattern rationale, automation level, AI primitives, HITL checkpoints)

YOUR TASK:
1. Match use cases from both sources by title/description similarity (>70% match)
2. For matched use cases: merge ALL fields from both sources
3. For unmatched use cases: include them with data from whichever source has them
4. Flag any conflicts where both sources have different values for the same field
5. Normalize business function names and AI primitives

OUTPUT FORMAT (strict JSON):
{
  "reconciledUseCases": [
    {
      "id": "UC-001",
      "title": "Use Case Name",
      "description": "...",
      "businessFunction": "Normalized function name",
      "subFunction": "...",
      "frictionPoint": "...",
      "aiPrimitives": ["Research & Information Retrieval"],
      "hitlCheckpoint": "...",
      "strategicTheme": "...",
      "revenueBenefit": 0,
      "costBenefit": 0,
      "cashFlowBenefit": 0,
      "riskBenefit": 0,
      "totalAnnualValue": 0,
      "threeYearNPV": 0,
      "priorityScore": 0,
      "tokenCost": 0,
      "timeToValue": 0,
      "dataReadiness": 0,
      "effortScore": 0,
      "agenticPattern": "orchestrator",
      "horizon": "H1",
      "horizonLabel": "Deflationary Core",
      "businessValue": 0,
      "implementationRisk": 0,
      "trustTaxPercent": 0,
      "lcoai": 0,
      "legacyProcessSteps": [],
      "legacyPainPoints": [],
      "legacyAnnualCost": 0,
      "legacyTranslationTax": "",
      "legacyContextSwitching": "",
      "legacyTimeConsumed": "",
      "agenticPatternRationale": "",
      "agenticAutomationLevel": "assisted",
      "agenticPrimitives": [],
      "agenticHitlCheckpoints": [],
      "agenticTransformSteps": []
    }
  ],
  "matchedCount": 0,
  "researchOnlyCount": 0,
  "cognitionOnlyCount": 0,
  "conflicts": []
}`;

export const importReconciliationAgent: Agent = {
  name: "Import Reconciliation Agent",
  role: "Data Integration Specialist",
  goal: "Merge use case data from ResearchApp and CognitionTwo into a unified model",

  async execute(context: WorkshopContext): Promise<ReconciliationOutput> {
    const startTime = Date.now();

    // Extract use cases from both sources
    const researchData = context.researchAppData;
    const cognitionData = context.cognitionTwoData;

    // Build the user prompt with actual data
    let researchUseCases = "None imported";
    let cognitionUseCases = "None imported";

    if (researchData?.analysisData) {
      const analysis = typeof researchData.analysisData === "string"
        ? JSON.parse(researchData.analysisData)
        : researchData.analysisData;

      // Extract use cases from Step 4 and benefits from Step 5
      const step4 = analysis.steps?.find((s: any) => s.step === 4);
      const step5 = analysis.steps?.find((s: any) => s.step === 5);
      if (step4?.data || step5?.data) {
        researchUseCases = JSON.stringify({
          useCases: step4?.data || [],
          benefits: step5?.data || [],
          companyOverview: analysis.companyOverview,
        }, null, 2);
      }
    }

    if (cognitionData) {
      const useCases = cognitionData.useCases || [];
      const cognitiveNodes = cognitionData.cognitiveNodes || [];
      cognitionUseCases = JSON.stringify({
        useCases,
        cognitiveNodes,
        executiveSummary: cognitionData.executiveSummary,
      }, null, 2);
    }

    const userPrompt = `Reconcile use cases from these two analysis sources for ${context.companyName} (${context.industry}):

RESEARCHAPP DATA:
${researchUseCases}

COGNITIONTWO DATA:
${cognitionUseCases}

Merge into the unified ReconciledUseCase format. Match by title/description similarity.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      system: RECONCILIATION_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Reconciliation Agent");
    }

    let response = content.text.trim();
    if (response.startsWith("```json")) response = response.slice(7);
    if (response.startsWith("```")) response = response.slice(3);
    if (response.endsWith("```")) response = response.slice(0, -3);

    const parsed = JSON.parse(response.trim());

    return {
      agentName: "Import Reconciliation Agent",
      insights: [
        `Matched ${parsed.matchedCount} use cases across both sources`,
        `${parsed.researchOnlyCount} use cases only in ResearchApp`,
        `${parsed.cognitionOnlyCount} use cases only in CognitionTwo`,
        `${parsed.conflicts?.length || 0} data conflicts detected`,
      ],
      structuredData: parsed,
      confidence: 0.85,
      reasoning: "Used title/description similarity matching with >70% threshold. All financial data from ResearchApp, all cognitive data from CognitionTwo.",
      durationMs: Date.now() - startTime,
    };
  },
};
