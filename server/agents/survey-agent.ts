import Anthropic from "@anthropic-ai/sdk";
import type { Agent, WorkshopContext, SurveyGenerationOutput } from "./types";
import type { SurveyQuestion } from "@shared/schema";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const SURVEY_GENERATION_PROMPT = `You are an AI Readiness Survey Generation Agent. You create tailored 4-dimension readiness assessments for enterprise AI workshops.

The 4 dimensions are:
1. **Skills Assessment** — AI/ML expertise, technical proficiency, training programs, change readiness, leadership buy-in
2. **Data Readiness** — Data availability, quality, governance, integration capability, architecture maturity
3. **Infrastructure** — Compute & storage capacity, networking, DevOps/MLOps, AI-specific infrastructure, scalability
4. **Governance Framework** — AI policies, decision-making frameworks, compliance & risk management, accountability, transparency & ethics

For each dimension, generate 4-5 questions that are SPECIFIC to the client's actual use cases and industry.
Each question should:
- Map to specific use cases it assesses readiness for
- Include a practical hint about what "good" looks like
- Have a weight (1 = standard, 2 = critical for the identified use cases)
- Reference a category within the dimension

MATURITY LEVELS (for each question, the user rates 1-5):
1 = Ad hoc / No formal process
2 = Initial / Basic awareness
3 = Defined / Documented processes
4 = Managed / Measured and controlled
5 = Optimized / Continuous improvement

OUTPUT FORMAT (strict JSON):
{
  "dimensions": [
    {
      "dimension": "skills",
      "questions": [
        {
          "id": "S-001",
          "category": "AI/ML Expertise",
          "question": "How mature is your team's ability to...",
          "hint": "Look for: dedicated ML engineers, regular upskilling, hands-on experience with...",
          "weight": 1,
          "useCaseIds": ["UC-001", "UC-003"]
        }
      ]
    },
    {
      "dimension": "data",
      "questions": [...]
    },
    {
      "dimension": "infrastructure",
      "questions": [...]
    },
    {
      "dimension": "governance",
      "questions": [...]
    }
  ],
  "totalQuestions": 0,
  "rationale": "Brief explanation of how questions were tailored to the client's use cases"
}`;

export const surveyGenerationAgent: Agent = {
  name: "Survey Generation Agent",
  role: "Assessment Designer",
  goal: "Generate a tailored 4-dimension AI readiness survey based on the client's specific use cases",

  async execute(context: WorkshopContext): Promise<SurveyGenerationOutput> {
    const startTime = Date.now();

    const useCases = context.reconciledUseCases || [];
    const useCaseSummary = useCases.map((uc) => ({
      id: uc.id,
      title: uc.title,
      businessFunction: uc.businessFunction,
      aiPrimitives: uc.aiPrimitives,
      agenticPattern: uc.agenticPattern,
      dataReadiness: uc.dataReadiness,
      horizon: uc.horizon,
    }));

    const userPrompt = `Generate a tailored AI readiness survey for ${context.companyName} (${context.industry}).

Their reconciled use cases are:
${JSON.stringify(useCaseSummary, null, 2)}

Create questions that specifically assess readiness for THESE use cases. For example:
- If they have use cases requiring "Research & Information Retrieval", ask about document management systems and search infrastructure
- If they have "orchestrator" patterns, ask about workflow automation maturity
- If they have H1 horizon use cases, focus on near-term deployment readiness

Generate 4-5 questions per dimension (16-20 total), each linked to relevant use case IDs.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system: SURVEY_GENERATION_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Survey Generation Agent");
    }

    let response = content.text.trim();
    if (response.startsWith("```json")) response = response.slice(7);
    if (response.startsWith("```")) response = response.slice(3);
    if (response.endsWith("```")) response = response.slice(0, -3);

    const parsed = JSON.parse(response.trim());

    // Flatten questions with dimension info for structured output
    const allQuestions: SurveyQuestion[] = [];
    for (const dim of parsed.dimensions) {
      for (const q of dim.questions) {
        allQuestions.push({
          ...q,
          platformImpact: q.useCaseIds || [],
        });
      }
    }

    return {
      agentName: "Survey Generation Agent",
      insights: [
        `Generated ${parsed.totalQuestions || allQuestions.length} tailored questions across 4 dimensions`,
        `Skills: ${parsed.dimensions.find((d: any) => d.dimension === "skills")?.questions.length || 0} questions`,
        `Data: ${parsed.dimensions.find((d: any) => d.dimension === "data")?.questions.length || 0} questions`,
        `Infrastructure: ${parsed.dimensions.find((d: any) => d.dimension === "infrastructure")?.questions.length || 0} questions`,
        `Governance: ${parsed.dimensions.find((d: any) => d.dimension === "governance")?.questions.length || 0} questions`,
      ],
      structuredData: {
        dimensions: parsed.dimensions,
        totalQuestions: allQuestions.length,
      },
      confidence: 0.9,
      reasoning: parsed.rationale || "Questions generated based on client use cases, industry context, and AI primitive requirements.",
      durationMs: Date.now() - startTime,
    };
  },
};
