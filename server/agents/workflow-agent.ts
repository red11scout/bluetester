import Anthropic from "@anthropic-ai/sdk";
import type { Agent, WorkshopContext, WorkflowOutput } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const WORKFLOW_PROMPT = `You are an AI Workflow Visualization Agent. You generate side-by-side current state vs AI-automated target state workflows for use cases.

For each use case, create:

**CURRENT STATE WORKFLOW (6-8 steps)**:
Each step includes: stepNumber, stepName, description, actor (human/system), duration, systems used, isBottleneck, isFrictionPoint, painPoints.

**TARGET STATE WORKFLOW (6-10 steps)**:
Each step includes all current state fields PLUS: isAIEnabled, aiCapabilities, agentType, automationLevel (full/assisted/supervised/manual).

**COMPARISON METRICS**:
For each use case, provide before/after comparisons:
- Time reduction (e.g., "5 days" → "4 hours")
- Cost reduction (e.g., "$50K/year" → "$12K/year")
- Quality improvement (e.g., "85% accuracy" → "97% accuracy")
- Throughput increase (e.g., "20 per week" → "200 per week")

OUTPUT FORMAT (strict JSON):
{
  "workflows": [
    {
      "useCaseId": "UC-001",
      "useCaseTitle": "...",
      "agenticPattern": "orchestrator",
      "patternRationale": "...",
      "currentStateWorkflow": [
        {
          "stepNumber": 1,
          "stepName": "Receive Request",
          "description": "...",
          "actor": "human",
          "duration": "30 min",
          "systems": ["Email", "CRM"],
          "isBottleneck": false,
          "isFrictionPoint": true,
          "painPoints": ["Manual data entry"]
        }
      ],
      "targetStateWorkflow": [
        {
          "stepNumber": 1,
          "stepName": "Auto-Capture Request",
          "description": "...",
          "actor": "ai_agent",
          "duration": "2 min",
          "systems": ["AI Orchestrator", "CRM API"],
          "isAIEnabled": true,
          "aiCapabilities": ["NLP extraction", "Entity recognition"],
          "agentType": "tool-user",
          "automationLevel": "full"
        }
      ],
      "comparisonMetrics": {
        "timeReduction": { "before": "5 days", "after": "4 hours", "improvement": "95%" },
        "costReduction": { "before": "$50K/year", "after": "$12K/year", "improvement": "76%" },
        "qualityImprovement": { "before": "85% accuracy", "after": "97% accuracy", "improvement": "+12pp" },
        "throughputIncrease": { "before": "20/week", "after": "200/week", "improvement": "10x" }
      }
    }
  ]
}`;

export const workflowAgent: Agent = {
  name: "Workflow Visualization Agent",
  role: "Process Transformation Architect",
  goal: "Generate side-by-side current vs AI-automated workflows for prioritized use cases",

  async execute(context: WorkshopContext): Promise<WorkflowOutput> {
    const startTime = Date.now();

    const useCases = context.reconciledUseCases || [];
    // Focus on top-priority use cases (quick wins + strategic bets)
    const prioritized = useCases.slice(0, 6); // Top 6 use cases

    const userPrompt = `Generate current state vs AI-automated target state workflows for these use cases at ${context.companyName} (${context.industry}):

USE CASES:
${JSON.stringify(prioritized.map(uc => ({
  id: uc.id,
  title: uc.title,
  businessFunction: uc.businessFunction,
  frictionPoint: uc.frictionPoint,
  aiPrimitives: uc.aiPrimitives,
  agenticPattern: uc.agenticPattern,
  legacyProcessSteps: uc.legacyProcessSteps,
  legacyPainPoints: uc.legacyPainPoints,
  legacyAnnualCost: uc.legacyAnnualCost,
  agenticTransformSteps: uc.agenticTransformSteps,
  agenticAutomationLevel: uc.agenticAutomationLevel,
})), null, 2)}

For each use case, generate detailed current and target workflows with comparison metrics. Use the legacy data from CognitionTwo where available.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 8192,
      system: WORKFLOW_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Workflow Agent");
    }

    let response = content.text.trim();
    if (response.startsWith("```json")) response = response.slice(7);
    if (response.startsWith("```")) response = response.slice(3);
    if (response.endsWith("```")) response = response.slice(0, -3);

    const parsed = JSON.parse(response.trim());

    return {
      agentName: "Workflow Visualization Agent",
      insights: [
        `Generated ${parsed.workflows.length} workflow maps`,
        `${parsed.workflows.filter((w: any) => w.currentStateWorkflow?.some((s: any) => s.isBottleneck)).length} workflows with bottlenecks identified`,
      ],
      structuredData: {
        workflows: parsed.workflows,
      },
      confidence: 0.85,
      reasoning: "Workflows generated based on use case details, legacy process data, and agentic transformation patterns.",
      durationMs: Date.now() - startTime,
    };
  },
};
