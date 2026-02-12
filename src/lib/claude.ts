import Anthropic from '@anthropic-ai/sdk'

// Lazy-init singleton
let client: Anthropic | null = null

export function getClaudeClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    })
  }
  return client
}

export const SYSTEM_PROMPTS = {
  workflowGenerator: `You are an AI workflow analysis expert for BlueAlly Technology Solutions. You analyze business processes and identify opportunities for AI improvement.

When given a company and use case, you generate:
1. A current-state workflow showing existing manual processes, bottlenecks, friction points, and data flows
2. An AI-improved workflow showing how AI/automation can transform each step

For each workflow step, provide:
- Step name and description
- Duration in minutes
- Error rate (0-100%)
- Manual effort percentage
- Whether it's a bottleneck
- Data inputs and outputs

For AI improvements, specify:
- New duration after AI
- New error rate
- Automation level
- Description of the AI enhancement
- Time saved
- Quality gain

Be specific and realistic with numbers. Use industry benchmarks where available.`,

  assessmentAnalyzer: `You are an AI use case identification expert. Given company assessment data, you identify high-impact AI use cases with quantified benefits.

For each use case provide:
- Use case name and description
- Target business function and sub-function
- AI primitives (e.g., NLP, Computer Vision, Predictive Analytics)
- Friction points it addresses
- Quantified benefits: cost savings, risk reduction, revenue impact, cash flow improvement
- Effort estimates: implementation complexity, data readiness, integration effort
- Priority tier (Critical, High, Medium)`,

  chatAssistant: `You are an AI portfolio analysis assistant for BlueAlly Technology Solutions. You help analyze private equity portfolio companies for AI adoption opportunities.

You have access to portfolio data including company metrics, AI use cases, benefit calculations, and workflow comparisons. Be concise, data-driven, and actionable in your responses.`,
}

export const TOOL_DEFINITIONS = {
  generateWorkflow: {
    name: 'generate_workflow',
    description: 'Generate current-state and AI-improved workflow for a given company and use case',
    input_schema: {
      type: 'object' as const,
      properties: {
        companyName: { type: 'string', description: 'Name of the portfolio company' },
        useCaseName: { type: 'string', description: 'Name of the AI use case' },
        description: { type: 'string', description: 'Description of the use case' },
        function: { type: 'string', description: 'Business function (e.g., Sales, Operations)' },
      },
      required: ['companyName', 'useCaseName'],
    },
  },
  identifyUseCases: {
    name: 'identify_use_cases',
    description: 'Identify AI use cases from assessment data',
    input_schema: {
      type: 'object' as const,
      properties: {
        companyName: { type: 'string' },
        industry: { type: 'string' },
        revenue: { type: 'number' },
        painPoints: { type: 'string' },
      },
      required: ['companyName'],
    },
  },
}
