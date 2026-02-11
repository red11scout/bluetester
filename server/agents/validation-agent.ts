import Anthropic from "@anthropic-ai/sdk";
import type { Agent, WorkshopContext, ValidationOutput } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const VALIDATION_PROMPT = `You are an AI Benefit Validation Agent. You verify financial projections against industry benchmarks, published case studies, and the client's actual readiness level.

YOUR APPROACH:
1. Cross-reference each use case's projected benefits against published ROI data for similar AI implementations
2. Apply risk-adjusted discount factors based on the client's survey readiness scores:
   - Score 1 (Ad hoc): Apply 60-70% discount — high uncertainty, likely overestimated
   - Score 2 (Initial): Apply 40-50% discount — some foundation but gaps remain
   - Score 3 (Defined): Apply 20-30% discount — reasonable basis for the projection
   - Score 4 (Managed): Apply 5-15% discount — well-positioned, minor risks
   - Score 5 (Optimized): Apply 0-5% discount — strong foundation, projections likely achievable
3. Factor in industry-specific adoption curves and typical time-to-value
4. Identify any benefits that lack supporting evidence or benchmarks
5. Provide confidence levels for each validation

OUTPUT FORMAT (strict JSON):
{
  "validations": [
    {
      "useCaseId": "UC-001",
      "originalBenefit": 1000000,
      "validatedBenefit": 720000,
      "confidenceLevel": 75,
      "adjustmentReason": "Applied 28% readiness discount (data readiness score 3/5). Industry benchmarks suggest 15-25% cost savings for document automation, supporting the general direction but at lower magnitude.",
      "benchmarkSource": "Forrester TEI studies on intelligent document processing (2024)",
      "riskFlags": ["Data integration gaps may delay deployment by 3-6 months"]
    }
  ],
  "totalOriginalValue": 0,
  "totalValidatedValue": 0,
  "averageConfidence": 0,
  "summary": "Brief overview of the validation results and key risk-adjusted changes"
}`;

export const validationAgent: Agent = {
  name: "Benefit Validation Agent",
  role: "Financial Verification Specialist",
  goal: "Verify financial projections against industry benchmarks and readiness levels",

  async execute(context: WorkshopContext): Promise<ValidationOutput> {
    const startTime = Date.now();

    const useCases = context.reconciledUseCases || [];
    const surveyScores = context.surveyDimensionScores;
    const challengeData = context.previousAgentOutputs["Assumption Challenge Agent"];

    const userPrompt = `Validate the financial projections for these AI use cases at ${context.companyName} (${context.industry}):

USE CASES WITH BENEFITS:
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
  dataReadiness: uc.dataReadiness,
  horizon: uc.horizon,
  agenticPattern: uc.agenticPattern,
  legacyAnnualCost: uc.legacyAnnualCost,
})), null, 2)}

SURVEY READINESS SCORES:
${surveyScores ? JSON.stringify(surveyScores, null, 2) : "Not yet available — apply moderate discount factors across the board."}

${challengeData ? `CHALLENGE AGENT FINDINGS:\n${JSON.stringify(challengeData.insights, null, 2)}` : ""}

For each use case, verify the totalAnnualValue against industry benchmarks and apply readiness-based discount factors. Provide a validated (risk-adjusted) benefit and confidence level.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 6144,
      system: VALIDATION_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Validation Agent");
    }

    let response = content.text.trim();
    if (response.startsWith("```json")) response = response.slice(7);
    if (response.startsWith("```")) response = response.slice(3);
    if (response.endsWith("```")) response = response.slice(0, -3);

    const parsed = JSON.parse(response.trim());

    // Calculate totals if not provided
    const totalOriginal = parsed.totalOriginalValue ||
      parsed.validations.reduce((sum: number, v: any) => sum + (v.originalBenefit || 0), 0);
    const totalValidated = parsed.totalValidatedValue ||
      parsed.validations.reduce((sum: number, v: any) => sum + (v.validatedBenefit || 0), 0);
    const avgConfidence = parsed.averageConfidence ||
      Math.round(parsed.validations.reduce((sum: number, v: any) => sum + (v.confidenceLevel || 0), 0) / (parsed.validations.length || 1));

    return {
      agentName: "Benefit Validation Agent",
      insights: [
        `Original portfolio value: $${(totalOriginal / 1000000).toFixed(1)}M`,
        `Validated portfolio value: $${(totalValidated / 1000000).toFixed(1)}M`,
        `Average confidence: ${avgConfidence}%`,
        `Overall adjustment: ${totalOriginal > 0 ? Math.round((1 - totalValidated / totalOriginal) * 100) : 0}% reduction`,
        parsed.summary || "",
      ].filter(Boolean),
      structuredData: {
        validations: parsed.validations,
        totalOriginalValue: totalOriginal,
        totalValidatedValue: totalValidated,
        averageConfidence: avgConfidence,
      },
      confidence: avgConfidence / 100,
      reasoning: "Risk-adjusted benefits based on survey readiness scores, industry benchmarks, and challenge findings.",
      durationMs: Date.now() - startTime,
    };
  },
};
