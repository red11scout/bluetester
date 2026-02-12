'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  DollarSign,
  TrendingUp,
  Shield,
  Wallet,
  Clock,
  Target,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Users,
  Zap,
  Calculator,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  BarChart3,
  Activity,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExtractedUseCase, ExtractedFrictionPoint, ExtractedKPI } from '@/lib/portfolioTypes'

interface UseCaseDetailPanelProps {
  useCase: ExtractedUseCase | null
  onClose: () => void
  frictionPoints: ExtractedFrictionPoint[]
  kpis: ExtractedKPI[]
  assumptions: {
    efficiencyFactor: number
    adoptionFactor: number
    confidenceFactor: number
    executiveRate: number
    managerRate: number
    specialistRate: number
    analystRate: number
  }
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toFixed(0)
}

function getQuadrant(useCase: ExtractedUseCase): string {
  if (useCase.quadrant) return useCase.quadrant
  // Calculate based on value and data readiness
  const valueHigh = (useCase.valueScore || 0) >= 7 || (useCase.priorityScore || 0) >= 70
  const readinessHigh = (useCase.dataReadiness || 0) >= 3

  if (valueHigh && readinessHigh) return 'Champion'
  if (!valueHigh && readinessHigh) return 'Quick Win'
  if (valueHigh && !readinessHigh) return 'Strategic'
  return 'Foundation'
}

export function UseCaseDetailPanel({ useCase, onClose, frictionPoints, kpis, assumptions }: UseCaseDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'benefits' | 'effort' | 'integration'>('overview')
  const [copied, setCopied] = useState(false)

  // Find related friction points and KPIs
  const relatedFrictionPoints = frictionPoints.filter(fp =>
    fp.companyName === useCase?.companyName
  ).slice(0, 3)

  const relatedKPIs = kpis.filter(kpi =>
    kpi.companyName === useCase?.companyName
  ).slice(0, 3)

  const handleCopy = () => {
    if (!useCase) return
    const text = `${useCase.useCaseName}\nCompany: ${useCase.companyName}\nTotal Value: ${formatCurrency(useCase.totalAnnualValue)}\n\n${useCase.description}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Reset tab when use case changes
  useEffect(() => {
    setActiveTab('overview')
  }, [useCase?.id])

  if (!useCase) return null

  const priorityColors = {
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    High: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Low: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
  }

  const quadrantColors = {
    Champion: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'Quick Win': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Strategic: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Foundation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'benefits', label: 'Benefits', icon: DollarSign },
    { id: 'effort', label: 'Effort', icon: Calculator },
    { id: 'integration', label: 'Integration', icon: Zap }
  ] as const

  return (
    <AnimatePresence>
      {useCase && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blueally-50 to-white dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blueally-600 dark:text-blueally-400">
                      {useCase.companyName}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {useCase.id}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-blueally-navy dark:text-white mb-2">
                    {useCase.useCaseName}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold',
                      priorityColors[useCase.priorityTier as keyof typeof priorityColors] || priorityColors.Medium
                    )}>
                      {useCase.priorityTier} Priority
                    </span>
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold',
                      quadrantColors[getQuadrant(useCase) as keyof typeof quadrantColors] || quadrantColors.Foundation
                    )}>
                      {getQuadrant(useCase)}
                    </span>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {useCase.recommendedPhase || useCase.phase || 'Q1'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Total Value Banner */}
              <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Annual Value</div>
                    <div className="text-3xl font-bold text-blueally-primary">
                      {formatCurrency(useCase.totalAnnualValue)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 dark:text-slate-400">Success Probability</div>
                    <div className="text-2xl font-bold text-emerald-500">
                      {Math.round(useCase.probabilityOfSuccess * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-6">
              <div className="flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                      activeTab === tab.id
                        ? 'text-blueally-600 dark:text-blueally-400 border-blueally-500'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-transparent'
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Description */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Description
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {useCase.description}
                    </p>
                  </section>

                  {/* Function & Sub-Function */}
                  <section className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Function
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {useCase.function}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                        Sub-Function
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {useCase.subFunction || 'N/A'}
                      </div>
                    </div>
                  </section>

                  {/* AI Primitives */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      AI Primitives
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {useCase.aiPrimitives.map((primitive, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blueally-50 dark:bg-blueally-900/20 text-blueally-700 dark:text-blueally-300 rounded-lg text-sm font-medium"
                        >
                          <Brain className="w-4 h-4" />
                          {primitive}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Target Friction Point */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Target Friction Point
                    </h3>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          {useCase.targetFriction || 'Addresses general operational inefficiencies and process bottlenecks.'}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Human-in-the-Loop Checkpoint */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Human-in-the-Loop Checkpoint
                    </h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {useCase.humanCheckpoint || 'Subject matter expert review required before implementation of recommendations.'}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'benefits' && (
                <div className="space-y-6">
                  {/* Benefit Breakdown */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Benefit Breakdown
                    </h3>
                    <div className="space-y-3">
                      <BenefitRow
                        icon={DollarSign}
                        label="Cost Savings"
                        value={useCase.costBenefit}
                        formula={useCase.costFormula}
                        color="emerald"
                        percentage={Math.round((useCase.costBenefit / useCase.totalAnnualValue) * 100) || 0}
                      />
                      <BenefitRow
                        icon={TrendingUp}
                        label="Revenue Growth"
                        value={useCase.revenueBenefit}
                        formula={useCase.revenueFormula}
                        color="blue"
                        percentage={Math.round((useCase.revenueBenefit / useCase.totalAnnualValue) * 100) || 0}
                      />
                      <BenefitRow
                        icon={Shield}
                        label="Risk Reduction"
                        value={useCase.riskBenefit}
                        formula={useCase.riskFormula}
                        color="purple"
                        percentage={Math.round((useCase.riskBenefit / useCase.totalAnnualValue) * 100) || 0}
                      />
                      <BenefitRow
                        icon={Wallet}
                        label="Cash Flow Improvement"
                        value={useCase.cashFlowBenefit}
                        formula={useCase.cashFlowFormula}
                        color="amber"
                        percentage={Math.round((useCase.cashFlowBenefit / useCase.totalAnnualValue) * 100) || 0}
                      />
                    </div>
                  </section>

                  {/* Applied Assumptions */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Applied Assumptions
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {Math.round(assumptions.efficiencyFactor * 100)}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Efficiency</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {Math.round(assumptions.adoptionFactor * 100)}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Adoption</div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {Math.round(assumptions.confidenceFactor * 100)}%
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Confidence</div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'effort' && (
                <div className="space-y-6">
                  {/* Token Estimates */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      AI Token Estimates
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Monthly Input Tokens
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatNumber(useCase.monthlyInputTokens || (useCase.inputTokensPerRun * useCase.runsPerMonth) || 0)}
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                          Monthly Output Tokens
                        </div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatNumber(useCase.monthlyOutputTokens || (useCase.outputTokensPerRun * useCase.runsPerMonth) || 0)}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Implementation Timeline */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Implementation
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Implementation Phase
                          </span>
                        </div>
                        <span className="px-3 py-1 bg-blueally-100 dark:bg-blueally-900/30 text-blueally-700 dark:text-blueally-300 rounded-full text-sm font-semibold">
                          {useCase.recommendedPhase || useCase.phase || 'Q1'}
                        </span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Activity className="w-5 h-5 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Effort Rating
                          </span>
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {useCase.effortScore}/10
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Score Breakdown */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Scoring
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <ScoreCard label="Value Score" value={useCase.valueScore || 0} max={10} color="emerald" />
                      <ScoreCard label="Data Readiness" value={useCase.dataReadiness || useCase.readinessScore || 0} max={5} color="blue" />
                      <ScoreCard label="Priority Score" value={Math.round((useCase.priorityScore || 0) / 10)} max={10} color="purple" />
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'integration' && (
                <div className="space-y-6">
                  {/* Framework Integration */}
                  <section>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                      Three Framework Integration
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-emerald-800 dark:text-emerald-200">
                              Value-Readiness Matrix
                            </div>
                            <div className="text-sm text-emerald-600 dark:text-emerald-400">
                              Quadrant: {getQuadrant(useCase)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-blue-800 dark:text-blue-200">
                              Portfolio Amplification
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              Cross-portfolio replication potential
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-purple-800 dark:text-purple-200">
                              Hold Period Tracks
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">
                              Track: {useCase.track || 'T2 - Growth Enablers'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Related KPIs */}
                  {relatedKPIs.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Related KPIs
                      </h3>
                      <div className="space-y-2">
                        {relatedKPIs.map((kpi, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white text-sm">
                                {kpi.kpiName || kpi.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {kpi.function}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                {kpi.baselineValue || kpi.baseline}
                              </div>
                              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                                Target: {kpi.targetValue || kpi.target}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Related Friction Points */}
                  {relatedFrictionPoints.length > 0 && (
                    <section>
                      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                        Related Friction Points
                      </h3>
                      <div className="space-y-2">
                        {relatedFrictionPoints.map((fp, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-medium text-slate-900 dark:text-white text-sm">
                                {fp.frictionPoint || fp.name}
                              </div>
                              <span className={cn(
                                'px-2 py-0.5 rounded text-[10px] font-semibold',
                                fp.severity === 'Critical' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                fp.severity === 'High' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                fp.severity === 'Medium' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              )}>
                                {fp.severity}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Est. Cost: {fp.estimatedAnnualCost || fp.estimatedCost}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Benefit Row Component
interface BenefitRowProps {
  icon: React.ElementType
  label: string
  value: number
  formula: string
  color: 'emerald' | 'blue' | 'purple' | 'amber'
  percentage: number
}

function BenefitRow({ icon: Icon, label, value, formula, color, percentage }: BenefitRowProps) {
  const [showFormula, setShowFormula] = useState(false)

  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
  }

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-slate-900 dark:text-white">{label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{percentage}% of total</div>
          </div>
        </div>
        <div className="text-xl font-bold text-slate-900 dark:text-white">
          {formatCurrency(value)}
        </div>
      </div>
      <button
        onClick={() => setShowFormula(!showFormula)}
        className="text-xs text-blueally-600 dark:text-blueally-400 hover:underline flex items-center gap-1"
      >
        <Calculator className="w-3 h-3" />
        {showFormula ? 'Hide formula' : 'View formula'}
      </button>
      {showFormula && (
        <div className="mt-2 p-2 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
          <code className="text-xs text-slate-600 dark:text-slate-400 break-all">
            {formula || 'No formula available'}
          </code>
        </div>
      )}
    </div>
  )
}

// Score Card Component
interface ScoreCardProps {
  label: string
  value: number
  max: number
  color: 'emerald' | 'blue' | 'purple'
}

function ScoreCard({ label, value, max, color }: ScoreCardProps) {
  const percentage = (value / max) * 100

  const colorClasses = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {value}/{max}
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
