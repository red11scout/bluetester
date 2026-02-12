import { NextRequest, NextResponse } from 'next/server'
import { getClaudeClient, SYSTEM_PROMPTS } from '@/lib/claude'

interface AssessmentRequest {
  companyName: string
  industry: string
  revenue?: string
  ebitda?: string
  employees?: string
  functions: string[]
  painPoints: string
  readinessChecks: string[]
}

interface GeneratedUseCase {
  name: string
  description: string
  function: string
  subFunction: string
  aiPrimitives: string[]
  frictionPoints: string[]
  benefits: {
    costSavings: number
    riskReduction: number
    revenueImpact: number
    cashFlowImprovement: number
  }
  effort: {
    complexity: 'Low' | 'Medium' | 'High'
    dataReadiness: 'Low' | 'Medium' | 'High'
    integrationEffort: 'Low' | 'Medium' | 'High'
  }
  priority: 'Critical' | 'High' | 'Medium'
  valueScore: number
  readinessScore: number
}

export async function POST(request: NextRequest) {
  try {
    const body: AssessmentRequest = await request.json()
    const { companyName, industry, revenue, ebitda, employees, functions, painPoints, readinessChecks } = body

    if (!companyName || !industry) {
      return NextResponse.json(
        { error: 'companyName and industry are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        useCases: generateDemoUseCases(companyName, industry, functions),
        company: { companyName, industry, revenue, ebitda, employees },
        mode: 'demo',
      })
    }

    const client = getClaudeClient()

    const prompt = `Analyze this company and identify 6-10 high-impact AI use cases:

Company: ${companyName}
Industry: ${industry}
Revenue: ${revenue || 'Not provided'}
EBITDA: ${ebitda || 'Not provided'}
Employees: ${employees || 'Not provided'}
Business Functions: ${functions.join(', ')}
Pain Points: ${painPoints}
AI Readiness Indicators: ${readinessChecks.join(', ')}

Return a JSON array of use cases with this structure:
[
  {
    "name": "Use case name",
    "description": "Clear description",
    "function": "Business function",
    "subFunction": "Sub-function",
    "aiPrimitives": ["NLP", "Predictive Analytics"],
    "frictionPoints": ["Manual data entry", "Slow approvals"],
    "benefits": {
      "costSavings": 150000,
      "riskReduction": 50000,
      "revenueImpact": 200000,
      "cashFlowImprovement": 75000
    },
    "effort": {
      "complexity": "Medium",
      "dataReadiness": "High",
      "integrationEffort": "Medium"
    },
    "priority": "Critical",
    "valueScore": 8.5,
    "readinessScore": 7.2
  }
]

Make benefits realistic for the company size. Value scores range 1-10 (based on total benefit impact). Readiness scores range 1-10 (based on effort/readiness indicators). Prioritize use cases that address the stated pain points.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: SYSTEM_PROMPTS.assessmentAnalyzer,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find(block => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({
        useCases: generateDemoUseCases(companyName, industry, functions),
        company: { companyName, industry, revenue, ebitda, employees },
        mode: 'fallback',
      })
    }

    let jsonStr = textBlock.text
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const useCases: GeneratedUseCase[] = JSON.parse(jsonStr)

    return NextResponse.json({
      useCases,
      company: { companyName, industry, revenue, ebitda, employees },
      mode: 'live',
    })
  } catch (error) {
    console.error('Assessment API error:', error)
    return NextResponse.json({
      useCases: generateDemoUseCases('Demo Company', 'Technology', ['Operations', 'Sales']),
      company: { companyName: 'Demo Company', industry: 'Technology' },
      mode: 'error',
    })
  }
}

function generateDemoUseCases(companyName: string, industry: string, functions: string[]): GeneratedUseCase[] {
  const useCases: GeneratedUseCase[] = [
    {
      name: 'Intelligent Document Processing',
      description: `Automate extraction and processing of documents across ${companyName}'s operations using AI-powered OCR and NLP`,
      function: functions[0] || 'Operations',
      subFunction: 'Document Management',
      aiPrimitives: ['NLP', 'OCR', 'Document AI'],
      frictionPoints: ['Manual data entry', 'Error-prone transcription', 'Slow processing times'],
      benefits: { costSavings: 180000, riskReduction: 45000, revenueImpact: 0, cashFlowImprovement: 35000 },
      effort: { complexity: 'Medium', dataReadiness: 'High', integrationEffort: 'Medium' },
      priority: 'Critical',
      valueScore: 8.5,
      readinessScore: 7.8,
    },
    {
      name: 'Predictive Demand Forecasting',
      description: `ML-driven demand forecasting to optimize inventory and resource allocation for ${companyName}`,
      function: functions[0] || 'Operations',
      subFunction: 'Supply Chain',
      aiPrimitives: ['Predictive Analytics', 'Time Series', 'ML'],
      frictionPoints: ['Inaccurate forecasts', 'Excess inventory costs', 'Stockouts'],
      benefits: { costSavings: 250000, riskReduction: 80000, revenueImpact: 150000, cashFlowImprovement: 120000 },
      effort: { complexity: 'High', dataReadiness: 'Medium', integrationEffort: 'High' },
      priority: 'Critical',
      valueScore: 9.2,
      readinessScore: 6.5,
    },
    {
      name: 'AI-Powered Customer Service',
      description: 'Deploy conversational AI to handle tier-1 customer inquiries, routing complex issues to specialists',
      function: 'Customer Service',
      subFunction: 'Support Operations',
      aiPrimitives: ['NLP', 'Conversational AI', 'Sentiment Analysis'],
      frictionPoints: ['Long wait times', 'Inconsistent responses', 'High agent turnover'],
      benefits: { costSavings: 120000, riskReduction: 25000, revenueImpact: 85000, cashFlowImprovement: 40000 },
      effort: { complexity: 'Medium', dataReadiness: 'High', integrationEffort: 'Low' },
      priority: 'High',
      valueScore: 7.8,
      readinessScore: 8.2,
    },
    {
      name: 'Automated Financial Reconciliation',
      description: `AI-driven matching and reconciliation of financial transactions across ${companyName}'s systems`,
      function: 'Finance',
      subFunction: 'Accounting',
      aiPrimitives: ['ML', 'Pattern Recognition', 'Anomaly Detection'],
      frictionPoints: ['Manual matching', 'Month-end delays', 'Reconciliation errors'],
      benefits: { costSavings: 95000, riskReduction: 120000, revenueImpact: 0, cashFlowImprovement: 65000 },
      effort: { complexity: 'Medium', dataReadiness: 'High', integrationEffort: 'Medium' },
      priority: 'High',
      valueScore: 7.2,
      readinessScore: 7.5,
    },
    {
      name: 'Intelligent Sales Pipeline Optimization',
      description: 'AI scoring and prioritization of sales opportunities with next-best-action recommendations',
      function: functions.includes('Sales') ? 'Sales' : (functions[1] || 'Sales'),
      subFunction: 'Revenue Operations',
      aiPrimitives: ['Predictive Analytics', 'NLP', 'Recommendation Engine'],
      frictionPoints: ['Low conversion rates', 'Missed follow-ups', 'Inaccurate forecasting'],
      benefits: { costSavings: 60000, riskReduction: 30000, revenueImpact: 320000, cashFlowImprovement: 95000 },
      effort: { complexity: 'Medium', dataReadiness: 'Medium', integrationEffort: 'Medium' },
      priority: 'Critical',
      valueScore: 8.8,
      readinessScore: 7.0,
    },
    {
      name: 'Quality Assurance Automation',
      description: `Computer vision and ML for automated quality inspection in ${industry.toLowerCase()} operations`,
      function: functions[0] || 'Operations',
      subFunction: 'Quality Control',
      aiPrimitives: ['Computer Vision', 'ML', 'Anomaly Detection'],
      frictionPoints: ['Manual inspection bottleneck', 'Inconsistent quality', 'Slow feedback loops'],
      benefits: { costSavings: 140000, riskReduction: 200000, revenueImpact: 50000, cashFlowImprovement: 30000 },
      effort: { complexity: 'High', dataReadiness: 'Medium', integrationEffort: 'High' },
      priority: 'High',
      valueScore: 8.0,
      readinessScore: 5.8,
    },
  ]

  return useCases
}
