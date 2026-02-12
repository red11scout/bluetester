import Anthropic from "@anthropic-ai/sdk";
import type { Agent, WorkshopContext, DataLineageOutput } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const LINEAGE_PROMPT = `You are an AI Data Lineage Agent. You map the complete data lineage for each use case, including data sources, inputs, outputs, explainability, observability, and governance requirements.

For each use case, provide:

1. **Data Sources**: Where the data comes from (databases, APIs, files, sensors, etc.)
2. **Inputs**: What data the AI system needs as input (formats, schemas, volumes)
3. **Outputs**: What the AI system produces (decisions, reports, actions, predictions)
4. **Explainability**: How can the AI's decisions be explained to stakeholders?
5. **Observability**: How will the system be monitored? (metrics, alerts, dashboards)
6. **Governance**: What controls are needed? (access, audit trails, bias checks, compliance)

Cross-reference with the client's survey readiness scores:
- Low Data score → flag data availability/quality risks
- Low Governance score → flag compliance and audit gaps
- Low Infrastructure score → flag scalability concerns

OUTPUT FORMAT (strict JSON):
{
  "lineages": [
    {
      "useCaseId": "UC-001",
      "dataSources": ["CRM (Salesforce)", "ERP (SAP)", "Document Store (SharePoint)"],
      "inputs": ["Customer records", "Transaction history", "Support tickets"],
      "outputs": ["Risk score", "Recommended action", "Confidence level"],
      "explainability": "Feature importance ranking + natural language explanation of top 3 factors. Audit trail for each decision.",
      "observability": "Real-time dashboard with accuracy metrics, drift detection, latency monitoring. Alert on accuracy < 90%.",
      "governance": "RBAC on input data. Bias monitoring quarterly. SOC2 compliant logging. Human override for decisions > $10K."
    }
  ]
}`;

export const lineageAgent: Agent = {
  name: "Data Lineage Agent",
  role: "Data Governance Specialist",
  goal: "Map complete data lineage, explainability, observability, and governance for each use case",

  async execute(context: WorkshopContext): Promise<DataLineageOutput> {
    const startTime = Date.now();

    const useCases = context.reconciledUseCases || [];
    const surveyScores = context.surveyDimensionScores;

    const userPrompt = `Map data lineage for these AI use cases at ${context.companyName} (${context.industry}):

USE CASES:
${JSON.stringify(useCases.map(uc => ({
  id: uc.id,
  title: uc.title,
  businessFunction: uc.businessFunction,
  aiPrimitives: uc.aiPrimitives,
  agenticPattern: uc.agenticPattern,
  dataReadiness: uc.dataReadiness,
})), null, 2)}

SURVEY READINESS SCORES:
${surveyScores ? JSON.stringify(surveyScores, null, 2) : "Not available — flag potential data and governance gaps."}

For each use case, map data sources, inputs, outputs, explainability, observability, and governance requirements. Flag risks where survey scores indicate gaps.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 6144,
      system: LINEAGE_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Data Lineage Agent");
    }

    let response = content.text.trim();
    if (response.startsWith("```json")) response = response.slice(7);
    if (response.startsWith("```")) response = response.slice(3);
    if (response.endsWith("```")) response = response.slice(0, -3);

    const parsed = JSON.parse(response.trim());

    return {
      agentName: "Data Lineage Agent",
      insights: [
        `Mapped data lineage for ${parsed.lineages.length} use cases`,
        `Total data sources identified: ${new Set(parsed.lineages.flatMap((l: any) => l.dataSources)).size}`,
      ],
      structuredData: {
        lineages: parsed.lineages,
      },
      confidence: 0.8,
      reasoning: "Lineage mapped based on use case data requirements, AI primitives, and cross-referenced with survey readiness scores.",
      durationMs: Date.now() - startTime,
    };
  },
};
