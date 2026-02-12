import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface ChatRequest {
  message: string
  context?: {
    activeTab?: string
    companies?: string[]
    filters?: Record<string, any>
  }
}

const SYSTEM_PROMPT = `You are an AI Portfolio Assistant for the BlueAlly × AEA Strategic Partnership Dashboard.
You help analyze the AEA portfolio of 54 companies using the Three Framework Approach:

1. Value-Readiness Matrix: Plots companies on Value (EBITDA impact, revenue enablement, risk reduction) vs Readiness (org capacity, data quality, tech infrastructure, timeline fit). Champions score 7+ on both.
2. Portfolio Amplification Model: Identifies Platform Plays that replicate across multiple portfolio companies, multiplying returns.
3. Hold Period Value Capture: Sequences investments into Track 1 (EBITDA Accelerators, 0-12mo), Track 2 (Growth Enablers, 6-24mo), and Track 3 (Exit Multipliers, 12-36mo).

Key Portfolio Statistics:
- Total Companies: 54 across 5 cohorts (Industrial, Services, Consumer, Healthcare, Logistics)
- Champions: 18 (high value + high readiness)
- Quick Wins: 7, Strategic: 6, Foundations: 23
- Total EBITDA Opportunity: ~$439M
- Total Revenue: ~$20.5B

Be concise, data-driven, and actionable. Use bullet points and numbers. Keep responses under 200 words unless more detail is explicitly requested.`

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Fallback to demo response when no API key
      return NextResponse.json({
        response: generateDemoResponse(message),
        mode: 'demo',
      })
    }

    const client = new Anthropic({ apiKey })

    const contextNote = context?.activeTab
      ? `\n\nUser is currently viewing: ${context.activeTab}`
      : ''

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: SYSTEM_PROMPT + contextNote,
      messages: [{ role: 'user', content: message }],
    })

    const textBlock = response.content.find(block => block.type === 'text')
    const responseText = textBlock ? textBlock.text : 'No response generated.'

    return NextResponse.json({ response: responseText, mode: 'live' })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({
      response: generateDemoResponse(''),
      mode: 'error',
    })
  }
}

function generateDemoResponse(message: string): string {
  const msg = message.toLowerCase()

  if (msg.includes('champion')) {
    return 'The portfolio has 18 Champion companies — those scoring 7+ on both Value and Readiness. Top Champions include TricorBraun, Apex Group, and Safeguard. These are ready for immediate AI deployment with Track 1 timelines of 0-12 months.'
  }
  if (msg.includes('opportunity') || msg.includes('value')) {
    return 'Total AI opportunity across the portfolio is approximately $439M in annualized EBITDA improvement. This breaks down to:\n\n- Cost Savings: $156M\n- Revenue Impact: $89M\n- Risk Reduction: $42M\n- Cash Flow: $58.7M\n\nThe highest-value opportunities concentrate in Industrial and Services cohorts.'
  }
  if (msg.includes('workflow') || msg.includes('bottleneck')) {
    return 'The Workflow Studio shows current-state vs. AI-improved processes. Common bottlenecks include manual data entry (18% error rate), approval routing (30min delays), and quality review backlogs. AI typically reduces process time by 75% and errors by 80%.'
  }

  return 'I can analyze the AEA portfolio of 54 companies across frameworks, use cases, and workflow comparisons. Try asking about Champions, AI opportunity values, specific companies, or workflow improvements.'
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    framework: 'Anthropic Claude SDK',
    capabilities: [
      'Portfolio analysis',
      'Company comparisons',
      'Workflow generation',
      'Use case identification',
      'Strategic recommendations',
    ],
  })
}
