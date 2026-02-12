// Workflow node types for ReactFlow
export type WorkflowNodeType = 'process' | 'friction' | 'data' | 'decision' | 'ai'

export interface WorkflowNodeData {
  label: string
  description?: string
  duration: number // minutes
  errorRate: number // percentage 0-100
  isBottleneck: boolean
  dataInputs: string[]
  dataOutputs: string[]
  manualEffort: number // percentage 0-100
  nodeType: WorkflowNodeType
  aiImprovement?: {
    newDuration: number
    newErrorRate: number
    automationLevel: number // 0-100
    description: string
    timeSaved: number
    qualityGain: string
  }
}

export interface WorkflowMetrics {
  totalDuration: number // minutes
  totalErrorRate: number
  totalManualEffort: number
  bottleneckCount: number
  stepCount: number
}

export interface WorkflowComparison {
  currentMetrics: WorkflowMetrics
  improvedMetrics: WorkflowMetrics
  errorReduction: number // percentage
  timeReduction: number // percentage
  manualReduction: number // percentage
  speedImprovement: number // x factor
}

export interface WorkflowSession {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  companyName: string
  useCaseName: string
  currentNodes: any[] // ReactFlow Node[]
  currentEdges: any[] // ReactFlow Edge[]
  improvedNodes: any[]
  improvedEdges: any[]
  comparison: WorkflowComparison
  assumptions: WorkflowAssumptions
  notes: string
}

export interface WorkflowAssumptions {
  automationRate: number
  aiAccuracy: number
  adoptionTimeline: number // months
  trainingTime: number // hours
  integrationComplexity: 'low' | 'medium' | 'high'
}

export interface GeneratedWorkflow {
  currentState: {
    nodes: WorkflowNodeData[]
    connections: { from: number; to: number }[]
  }
  improvedState: {
    nodes: WorkflowNodeData[]
    connections: { from: number; to: number }[]
  }
  comparison: WorkflowComparison
  insights: string[]
}
