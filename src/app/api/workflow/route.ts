import { NextRequest, NextResponse } from 'next/server'
import { getClaudeClient, SYSTEM_PROMPTS } from '@/lib/claude'
import type { GeneratedWorkflow, WorkflowNodeData, WorkflowComparison } from '@/lib/workflow-types'

interface WorkflowRequest {
  companyName: string
  useCaseName: string
  description?: string
  businessFunction?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: WorkflowRequest = await request.json()
    const { companyName, useCaseName, description, businessFunction } = body

    if (!companyName || !useCaseName) {
      return NextResponse.json(
        { error: 'companyName and useCaseName are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        workflow: generateDemoWorkflow(companyName, useCaseName),
        mode: 'demo',
      })
    }

    const client = getClaudeClient()

    const prompt = `Generate a detailed current-state and AI-improved workflow comparison for:
Company: ${companyName}
Use Case: ${useCaseName}
${description ? `Description: ${description}` : ''}
${businessFunction ? `Business Function: ${businessFunction}` : ''}

Return a JSON object with this exact structure:
{
  "currentState": {
    "nodes": [
      {
        "label": "Step name",
        "description": "What this step does",
        "duration": 30,
        "errorRate": 15,
        "isBottleneck": false,
        "dataInputs": ["input1"],
        "dataOutputs": ["output1"],
        "manualEffort": 80,
        "nodeType": "process"
      }
    ],
    "connections": [{"from": 0, "to": 1}]
  },
  "improvedState": {
    "nodes": [
      {
        "label": "Step name",
        "description": "What this step does",
        "duration": 5,
        "errorRate": 2,
        "isBottleneck": false,
        "dataInputs": ["input1"],
        "dataOutputs": ["output1"],
        "manualEffort": 10,
        "nodeType": "ai",
        "aiImprovement": {
          "newDuration": 5,
          "newErrorRate": 2,
          "automationLevel": 85,
          "description": "AI enhancement description",
          "timeSaved": 25,
          "qualityGain": "Description of quality improvement"
        }
      }
    ],
    "connections": [{"from": 0, "to": 1}]
  },
  "comparison": {
    "currentMetrics": {"totalDuration": 0, "totalErrorRate": 0, "totalManualEffort": 0, "bottleneckCount": 0, "stepCount": 0},
    "improvedMetrics": {"totalDuration": 0, "totalErrorRate": 0, "totalManualEffort": 0, "bottleneckCount": 0, "stepCount": 0},
    "errorReduction": 0,
    "timeReduction": 0,
    "manualReduction": 0,
    "speedImprovement": 0
  },
  "insights": ["Insight 1", "Insight 2"]
}

Use nodeType values: "process" for standard steps, "friction" for bottlenecks, "decision" for decision points, "data" for data I/O, "ai" for AI-enhanced steps.
Generate 5-8 nodes for each state. Include at least 2 friction/bottleneck nodes in the current state. Make numbers realistic based on industry benchmarks.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: SYSTEM_PROMPTS.workflowGenerator,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find(block => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({
        workflow: generateDemoWorkflow(companyName, useCaseName),
        mode: 'fallback',
      })
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = textBlock.text
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim()
    }

    const workflow: GeneratedWorkflow = JSON.parse(jsonStr)

    // Recalculate comparison metrics from actual node data
    workflow.comparison = calculateComparison(
      workflow.currentState.nodes,
      workflow.improvedState.nodes
    )

    return NextResponse.json({ workflow, mode: 'live' })
  } catch (error) {
    console.error('Workflow API error:', error)
    return NextResponse.json({
      workflow: generateDemoWorkflow('Demo Company', 'AI Process Automation'),
      mode: 'error',
    })
  }
}

function calculateComparison(
  currentNodes: WorkflowNodeData[],
  improvedNodes: WorkflowNodeData[]
): WorkflowComparison {
  const sumMetrics = (nodes: WorkflowNodeData[]) => ({
    totalDuration: nodes.reduce((sum, n) => sum + n.duration, 0),
    totalErrorRate: nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.errorRate, 0) / nodes.length
      : 0,
    totalManualEffort: nodes.length > 0
      ? nodes.reduce((sum, n) => sum + n.manualEffort, 0) / nodes.length
      : 0,
    bottleneckCount: nodes.filter(n => n.isBottleneck).length,
    stepCount: nodes.length,
  })

  const currentMetrics = sumMetrics(currentNodes)
  const improvedMetrics = sumMetrics(improvedNodes)

  return {
    currentMetrics,
    improvedMetrics,
    errorReduction: currentMetrics.totalErrorRate > 0
      ? Math.round(((currentMetrics.totalErrorRate - improvedMetrics.totalErrorRate) / currentMetrics.totalErrorRate) * 100)
      : 0,
    timeReduction: currentMetrics.totalDuration > 0
      ? Math.round(((currentMetrics.totalDuration - improvedMetrics.totalDuration) / currentMetrics.totalDuration) * 100)
      : 0,
    manualReduction: currentMetrics.totalManualEffort > 0
      ? Math.round(((currentMetrics.totalManualEffort - improvedMetrics.totalManualEffort) / currentMetrics.totalManualEffort) * 100)
      : 0,
    speedImprovement: improvedMetrics.totalDuration > 0
      ? Math.round((currentMetrics.totalDuration / improvedMetrics.totalDuration) * 10) / 10
      : 1,
  }
}

function generateDemoWorkflow(companyName: string, useCaseName: string): GeneratedWorkflow {
  const currentNodes: WorkflowNodeData[] = [
    { label: 'Data Collection', description: 'Manual data gathering from multiple sources', duration: 45, errorRate: 18, isBottleneck: false, dataInputs: ['Spreadsheets', 'Emails', 'PDFs'], dataOutputs: ['Raw dataset'], manualEffort: 95, nodeType: 'process' },
    { label: 'Data Validation', description: 'Manual cross-referencing and error checking', duration: 60, errorRate: 25, isBottleneck: true, dataInputs: ['Raw dataset'], dataOutputs: ['Validated data'], manualEffort: 90, nodeType: 'friction' },
    { label: 'Analysis', description: 'Manual analysis with spreadsheet formulas', duration: 90, errorRate: 15, isBottleneck: true, dataInputs: ['Validated data'], dataOutputs: ['Analysis results'], manualEffort: 85, nodeType: 'friction' },
    { label: 'Quality Review', description: 'Peer review of analysis output', duration: 30, errorRate: 10, isBottleneck: false, dataInputs: ['Analysis results'], dataOutputs: ['Approved results'], manualEffort: 100, nodeType: 'decision' },
    { label: 'Report Generation', description: 'Manual report formatting and compilation', duration: 40, errorRate: 12, isBottleneck: false, dataInputs: ['Approved results'], dataOutputs: ['Draft report'], manualEffort: 80, nodeType: 'process' },
    { label: 'Stakeholder Review', description: 'Route for approvals and feedback', duration: 120, errorRate: 5, isBottleneck: true, dataInputs: ['Draft report'], dataOutputs: ['Final report'], manualEffort: 70, nodeType: 'friction' },
    { label: 'Distribution', description: 'Email distribution to relevant parties', duration: 15, errorRate: 8, isBottleneck: false, dataInputs: ['Final report'], dataOutputs: ['Distributed report'], manualEffort: 60, nodeType: 'process' },
  ]

  const improvedNodes: WorkflowNodeData[] = [
    { label: 'Automated Ingestion', description: 'AI extracts data from all sources automatically', duration: 5, errorRate: 2, isBottleneck: false, dataInputs: ['Connected sources'], dataOutputs: ['Structured dataset'], manualEffort: 10, nodeType: 'ai', aiImprovement: { newDuration: 5, newErrorRate: 2, automationLevel: 92, description: 'NLP + OCR extract and structure data from emails, PDFs, and spreadsheets', timeSaved: 40, qualityGain: '89% reduction in data entry errors' } },
    { label: 'AI Validation', description: 'ML models validate data patterns and flag anomalies', duration: 3, errorRate: 3, isBottleneck: false, dataInputs: ['Structured dataset'], dataOutputs: ['Validated data'], manualEffort: 15, nodeType: 'ai', aiImprovement: { newDuration: 3, newErrorRate: 3, automationLevel: 88, description: 'Pattern recognition identifies anomalies and auto-corrects common errors', timeSaved: 57, qualityGain: '88% fewer validation errors' } },
    { label: 'AI-Powered Analysis', description: 'Claude analyzes data and generates insights', duration: 8, errorRate: 4, isBottleneck: false, dataInputs: ['Validated data'], dataOutputs: ['AI insights'], manualEffort: 20, nodeType: 'ai', aiImprovement: { newDuration: 8, newErrorRate: 4, automationLevel: 80, description: 'Claude performs multi-dimensional analysis with trend detection', timeSaved: 82, qualityGain: 'Deeper insights, consistent methodology' } },
    { label: 'Auto QA Check', description: 'Automated quality assurance against benchmarks', duration: 2, errorRate: 1, isBottleneck: false, dataInputs: ['AI insights'], dataOutputs: ['QA-passed results'], manualEffort: 5, nodeType: 'ai', aiImprovement: { newDuration: 2, newErrorRate: 1, automationLevel: 95, description: 'Rules engine + ML validates against historical benchmarks', timeSaved: 28, qualityGain: '90% reduction in review cycles' } },
    { label: 'Smart Report Builder', description: 'AI generates formatted report with visualizations', duration: 5, errorRate: 2, isBottleneck: false, dataInputs: ['QA-passed results'], dataOutputs: ['Interactive report'], manualEffort: 15, nodeType: 'ai', aiImprovement: { newDuration: 5, newErrorRate: 2, automationLevel: 85, description: 'Automated report generation with dynamic charts and executive summary', timeSaved: 35, qualityGain: 'Professional formatting, zero manual layout' } },
    { label: 'Digital Approval', description: 'Automated routing with inline commenting', duration: 15, errorRate: 1, isBottleneck: false, dataInputs: ['Interactive report'], dataOutputs: ['Approved report'], manualEffort: 30, nodeType: 'process', aiImprovement: { newDuration: 15, newErrorRate: 1, automationLevel: 70, description: 'Digital workflow with parallel review, auto-reminders, and inline feedback', timeSaved: 105, qualityGain: '87.5% faster approval cycles' } },
    { label: 'Auto Distribution', description: 'Triggered distribution to relevant stakeholders', duration: 1, errorRate: 0, isBottleneck: false, dataInputs: ['Approved report'], dataOutputs: ['Distributed + archived'], manualEffort: 5, nodeType: 'ai', aiImprovement: { newDuration: 1, newErrorRate: 0, automationLevel: 98, description: 'Rule-based distribution with tracking and acknowledgment', timeSaved: 14, qualityGain: 'Zero missed recipients, full audit trail' } },
  ]

  return {
    currentState: {
      nodes: currentNodes,
      connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 }],
    },
    improvedState: {
      nodes: improvedNodes,
      connections: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 }],
    },
    comparison: calculateComparison(currentNodes, improvedNodes),
    insights: [
      `Total process time reduced from ${currentNodes.reduce((s, n) => s + n.duration, 0)} min to ${improvedNodes.reduce((s, n) => s + n.duration, 0)} min`,
      'All 3 bottlenecks eliminated through AI automation',
      'Manual effort reduced from 83% average to 14% average',
      'Error rate reduced from 13.3% to 1.9% across all steps',
      `Estimated annual savings for ${companyName}: $180K-$350K in labor costs`,
    ],
  }
}
