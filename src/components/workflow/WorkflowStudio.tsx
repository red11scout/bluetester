'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitCompareArrows, Play, Save, Download, ChevronDown,
  Zap, Clock, AlertTriangle, TrendingDown, Sparkles, Plus,
  Loader2, ArrowRight, RotateCcw, Maximize2,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import type { WorkflowComparison, WorkflowNodeData } from '@/lib/workflow-types'

// Sample workflow data for demo
const SAMPLE_CURRENT_WORKFLOW: WorkflowNodeData[] = [
  {
    label: 'Receive Customer Request',
    description: 'Customer submits request via email or phone',
    duration: 15,
    errorRate: 5,
    isBottleneck: false,
    dataInputs: ['Email', 'Phone call', 'Web form'],
    dataOutputs: ['Request ticket'],
    manualEffort: 90,
    nodeType: 'process',
  },
  {
    label: 'Manual Data Entry',
    description: 'Agent manually enters data into CRM system',
    duration: 25,
    errorRate: 18,
    isBottleneck: true,
    dataInputs: ['Request ticket', 'Customer records'],
    dataOutputs: ['CRM record', 'Work order'],
    manualEffort: 100,
    nodeType: 'friction',
  },
  {
    label: 'Review & Validate',
    description: 'Manager reviews for accuracy and completeness',
    duration: 45,
    errorRate: 8,
    isBottleneck: true,
    dataInputs: ['CRM record', 'Historical data'],
    dataOutputs: ['Approved request'],
    manualEffort: 85,
    nodeType: 'process',
  },
  {
    label: 'Route to Department',
    description: 'Request is routed to appropriate department',
    duration: 30,
    errorRate: 12,
    isBottleneck: false,
    dataInputs: ['Approved request', 'Routing rules'],
    dataOutputs: ['Department assignment'],
    manualEffort: 70,
    nodeType: 'decision',
  },
  {
    label: 'Process Request',
    description: 'Department processes the request',
    duration: 120,
    errorRate: 10,
    isBottleneck: true,
    dataInputs: ['Department assignment', 'Resources'],
    dataOutputs: ['Completed work', 'Status update'],
    manualEffort: 75,
    nodeType: 'process',
  },
  {
    label: 'Quality Check',
    description: 'Final quality review before delivery',
    duration: 30,
    errorRate: 5,
    isBottleneck: false,
    dataInputs: ['Completed work', 'Quality standards'],
    dataOutputs: ['Approved deliverable'],
    manualEffort: 80,
    nodeType: 'process',
  },
  {
    label: 'Deliver to Customer',
    description: 'Notify customer and deliver results',
    duration: 15,
    errorRate: 3,
    isBottleneck: false,
    dataInputs: ['Approved deliverable'],
    dataOutputs: ['Customer notification', 'Completion record'],
    manualEffort: 60,
    nodeType: 'process',
  },
]

const SAMPLE_IMPROVED_WORKFLOW: WorkflowNodeData[] = [
  {
    label: 'AI Request Intake',
    description: 'AI auto-classifies and extracts request details from any channel',
    duration: 2,
    errorRate: 1,
    isBottleneck: false,
    dataInputs: ['Email', 'Phone call', 'Web form', 'Chat'],
    dataOutputs: ['Structured request', 'Auto-classification'],
    manualEffort: 10,
    nodeType: 'ai',
    aiImprovement: {
      newDuration: 2,
      newErrorRate: 1,
      automationLevel: 95,
      description: 'NLP-powered request classification and entity extraction',
      timeSaved: 13,
      qualityGain: 'Consistent classification with 99% accuracy',
    },
  },
  {
    label: 'Auto-Populate & Validate',
    description: 'AI populates CRM fields and cross-validates against existing records',
    duration: 3,
    errorRate: 2,
    isBottleneck: false,
    dataInputs: ['Structured request', 'CRM database', 'Historical patterns'],
    dataOutputs: ['Validated CRM record', 'Anomaly flags'],
    manualEffort: 5,
    nodeType: 'ai',
    aiImprovement: {
      newDuration: 3,
      newErrorRate: 2,
      automationLevel: 98,
      description: 'Automated data entry with intelligent field mapping and validation',
      timeSaved: 22,
      qualityGain: '89% reduction in data entry errors',
    },
  },
  {
    label: 'Smart Review (Exception Only)',
    description: 'Only flagged items require human review — AI pre-approves routine requests',
    duration: 10,
    errorRate: 3,
    isBottleneck: false,
    dataInputs: ['Validated CRM record', 'Anomaly flags', 'Approval rules'],
    dataOutputs: ['Approved request'],
    manualEffort: 25,
    nodeType: 'ai',
    aiImprovement: {
      newDuration: 10,
      newErrorRate: 3,
      automationLevel: 80,
      description: '80% of requests auto-approved; humans handle exceptions only',
      timeSaved: 35,
      qualityGain: 'Faster approval with consistent policy application',
    },
  },
  {
    label: 'Intelligent Routing',
    description: 'ML model routes to optimal team based on skills, workload, and urgency',
    duration: 1,
    errorRate: 2,
    isBottleneck: false,
    dataInputs: ['Approved request', 'Team capacity', 'Skills matrix'],
    dataOutputs: ['Optimal assignment', 'SLA prediction'],
    manualEffort: 5,
    nodeType: 'ai',
    aiImprovement: {
      newDuration: 1,
      newErrorRate: 2,
      automationLevel: 95,
      description: 'Predictive routing based on team capacity and request complexity',
      timeSaved: 29,
      qualityGain: '40% improvement in first-assignment accuracy',
    },
  },
  {
    label: 'AI-Assisted Processing',
    description: 'AI provides recommendations, auto-fills templates, and flags issues',
    duration: 45,
    errorRate: 4,
    isBottleneck: false,
    dataInputs: ['Optimal assignment', 'Knowledge base', 'Templates'],
    dataOutputs: ['AI-assisted output', 'Confidence scores'],
    manualEffort: 40,
    nodeType: 'ai',
    aiImprovement: {
      newDuration: 45,
      newErrorRate: 4,
      automationLevel: 60,
      description: 'AI copilot assists with drafting, research, and quality checks',
      timeSaved: 75,
      qualityGain: '60% reduction in rework cycles',
    },
  },
  {
    label: 'Automated QC',
    description: 'AI performs automated quality checks against standards',
    duration: 5,
    errorRate: 1,
    isBottleneck: false,
    dataInputs: ['AI-assisted output', 'Quality rules', 'Benchmark data'],
    dataOutputs: ['QC report', 'Approved deliverable'],
    manualEffort: 15,
    nodeType: 'ai',
    aiImprovement: {
      newDuration: 5,
      newErrorRate: 1,
      automationLevel: 85,
      description: 'Automated compliance and quality validation',
      timeSaved: 25,
      qualityGain: 'Real-time quality scoring with zero manual check overhead',
    },
  },
  {
    label: 'Smart Delivery & Follow-up',
    description: 'Automated delivery with personalized messaging and satisfaction tracking',
    duration: 2,
    errorRate: 0,
    isBottleneck: false,
    dataInputs: ['Approved deliverable', 'Customer preferences'],
    dataOutputs: ['Delivery confirmation', 'Satisfaction survey', 'Analytics'],
    manualEffort: 5,
    nodeType: 'ai',
    aiImprovement: {
      newDuration: 2,
      newErrorRate: 0,
      automationLevel: 95,
      description: 'Personalized automated delivery with sentiment-aware follow-up',
      timeSaved: 13,
      qualityGain: 'Proactive customer engagement with feedback loop',
    },
  },
]

function calculateMetrics(nodes: WorkflowNodeData[]) {
  return {
    totalDuration: nodes.reduce((sum, n) => sum + n.duration, 0),
    totalErrorRate: nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.errorRate, 0) / nodes.length : 0,
    totalManualEffort: nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.manualEffort, 0) / nodes.length : 0,
    bottleneckCount: nodes.filter(n => n.isBottleneck).length,
    stepCount: nodes.length,
  }
}

function WorkflowNode({ node, isImproved, index }: { node: WorkflowNodeData; isImproved: boolean; index: number }) {
  const [expanded, setExpanded] = useState(false)

  const typeStyles = {
    process: 'border-slate-300 dark:border-slate-600',
    friction: 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-500/10',
    data: 'border-cyan-400 dark:border-cyan-500',
    decision: 'border-amber-400 dark:border-amber-500',
    ai: 'border-blueally-accent dark:border-blueally-accent bg-blueally-50 dark:bg-blueally-500/10',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: isImproved ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className={`glass-card p-4 cursor-pointer transition-all border-l-4 ${typeStyles[node.nodeType]} ${
          node.isBottleneck ? 'ring-1 ring-red-400/30 dark:ring-red-500/20' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {node.nodeType === 'ai' && <Sparkles className="w-3.5 h-3.5 text-blueally-accent flex-shrink-0" />}
              {node.isBottleneck && <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />}
              <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{node.label}</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{node.description}</p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">{node.duration}m</div>
              <div className="text-[10px] text-slate-400">duration</div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-semibold ${node.errorRate > 10 ? 'text-red-500' : 'text-slate-700 dark:text-slate-200'}`}>
                {node.errorRate}%
              </div>
              <div className="text-[10px] text-slate-400">error</div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-semibold ${node.manualEffort > 70 ? 'text-amber-500' : 'text-green-500'}`}>
                {node.manualEffort}%
              </div>
              <div className="text-[10px] text-slate-400">manual</div>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                <div className="flex gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Inputs</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {node.dataInputs.map(input => (
                        <span key={input} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-300">{input}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">Outputs</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {node.dataOutputs.map(output => (
                        <span key={output} className="text-[10px] px-2 py-0.5 bg-blueally-50 dark:bg-blueally-500/10 rounded-full text-blueally-600 dark:text-blueally-300">{output}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {node.aiImprovement && (
                  <div className="bg-blueally-50 dark:bg-blueally-500/10 rounded-lg p-3 mt-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3 h-3 text-blueally-accent" />
                      <span className="text-xs font-semibold text-blueally-700 dark:text-blueally-300">AI Enhancement</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{node.aiImprovement.description}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">-{node.aiImprovement.timeSaved}min saved</span>
                      <span className="text-[10px] text-blueally-600 dark:text-blueally-300 font-medium">{node.aiImprovement.automationLevel}% automated</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection line to next node */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-200 dark:bg-white/10" />
      </div>
    </motion.div>
  )
}

function MetricCard({ label, currentValue, improvedValue, unit, format, icon: Icon, color }: {
  label: string
  currentValue: number
  improvedValue: number
  unit?: string
  format?: 'time' | 'percent' | 'factor'
  icon: any
  color: string
}) {
  const improvement = currentValue > 0 ? ((currentValue - improvedValue) / currentValue) * 100 : 0

  const formatValue = (v: number) => {
    if (format === 'time') {
      if (v >= 60) return `${(v / 60).toFixed(1)}h`
      return `${Math.round(v)}m`
    }
    if (format === 'percent') return `${v.toFixed(1)}%`
    if (format === 'factor') return `${v.toFixed(1)}x`
    return v.toString()
  }

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-slate-400 line-through">{formatValue(currentValue)}</div>
          <div className="text-2xl font-black text-slate-800 dark:text-white">{formatValue(improvedValue)}</div>
        </div>
        <div className={`text-sm font-bold ${improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {improvement > 0 ? '-' : '+'}{Math.abs(improvement).toFixed(0)}%
        </div>
      </div>
    </div>
  )
}

export function WorkflowStudio() {
  const { companies } = useDashboardStore()
  const [selectedCompany, setSelectedCompany] = useState(companies[0]?.name || 'Demo Company')
  const [selectedUseCase, setSelectedUseCase] = useState('Customer Request Processing')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showFullscreen, setShowFullscreen] = useState(false)

  const currentNodes = SAMPLE_CURRENT_WORKFLOW
  const improvedNodes = SAMPLE_IMPROVED_WORKFLOW

  const currentMetrics = useMemo(() => calculateMetrics(currentNodes), [currentNodes])
  const improvedMetrics = useMemo(() => calculateMetrics(improvedNodes), [improvedNodes])

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    // TODO: Call Claude API to generate workflow
    setTimeout(() => setIsGenerating(false), 2000)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Workflow Studio</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Compare current-state workflows with AI-powered improvements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="ba-input py-2 text-sm max-w-[200px]"
          >
            {companies.length > 0 ? companies.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            )) : (
              <option value="Demo Company">Demo Company</option>
            )}
          </select>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="ba-btn-primary"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" /> Generate with AI</>
            )}
          </button>

          <button className="ba-btn-ghost">
            <Save className="w-4 h-4 mr-2" /> Save
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Process Time"
          currentValue={currentMetrics.totalDuration}
          improvedValue={improvedMetrics.totalDuration}
          format="time"
          icon={Clock}
          color="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
        />
        <MetricCard
          label="Average Error Rate"
          currentValue={currentMetrics.totalErrorRate}
          improvedValue={improvedMetrics.totalErrorRate}
          format="percent"
          icon={AlertTriangle}
          color="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400"
        />
        <MetricCard
          label="Manual Effort"
          currentValue={currentMetrics.totalManualEffort}
          improvedValue={improvedMetrics.totalManualEffort}
          format="percent"
          icon={TrendingDown}
          color="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          label="Speed Improvement"
          currentValue={1}
          improvedValue={currentMetrics.totalDuration / Math.max(improvedMetrics.totalDuration, 1)}
          format="factor"
          icon={Zap}
          color="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400"
        />
      </div>

      {/* Split View: Current vs Improved */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current State */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Current State</h2>
            <span className="text-xs text-slate-400 ml-auto">{currentNodes.length} steps &bull; {currentMetrics.bottleneckCount} bottlenecks</span>
          </div>
          <div className="space-y-4 relative">
            {currentNodes.map((node, i) => (
              <WorkflowNode key={i} node={node} isImproved={false} index={i} />
            ))}
          </div>
        </div>

        {/* AI Improved State */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-blueally-accent shadow-glow-accent" />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">AI-Improved State</h2>
            <span className="text-xs text-blueally-accent ml-auto">{improvedNodes.length} steps &bull; Powered by AI</span>
          </div>
          <div className="space-y-4 relative">
            {improvedNodes.map((node, i) => (
              <WorkflowNode key={i} node={node} isImproved={true} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="ba-hero text-white relative z-10">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <div className="stat-number text-3xl text-white mb-1">
                {((1 - improvedMetrics.totalDuration / Math.max(currentMetrics.totalDuration, 1)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-white/80">Time Reduction</div>
              <div className="text-xs text-white/60 mt-1">
                From {currentMetrics.totalDuration}min to {improvedMetrics.totalDuration}min per cycle
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <div className="stat-number text-3xl text-white mb-1">
                {((1 - improvedMetrics.totalErrorRate / Math.max(currentMetrics.totalErrorRate, 1)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-white/80">Error Reduction</div>
              <div className="text-xs text-white/60 mt-1">
                From {currentMetrics.totalErrorRate.toFixed(1)}% to {improvedMetrics.totalErrorRate.toFixed(1)}% avg error
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4">
              <div className="stat-number text-3xl text-white mb-1">
                {((1 - improvedMetrics.totalManualEffort / Math.max(currentMetrics.totalManualEffort, 1)) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-white/80">Manual Effort Reduction</div>
              <div className="text-xs text-white/60 mt-1">
                From {currentMetrics.totalManualEffort.toFixed(0)}% to {improvedMetrics.totalManualEffort.toFixed(0)}% manual
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
