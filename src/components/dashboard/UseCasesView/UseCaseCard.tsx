'use client'

import { motion } from 'framer-motion'
import {
  DollarSign,
  TrendingUp,
  Shield,
  Wallet,
  Clock,
  Zap,
  ChevronRight,
  Sparkles,
  Target,
  Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExtractedUseCase } from '@/lib/portfolioTypes'

interface UseCaseCardProps {
  useCase: ExtractedUseCase
  onClick: () => void
}

// Format currency
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

// Truncate text
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function UseCaseCard({ useCase, onClick }: UseCaseCardProps) {
  const priorityColors = {
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    High: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    Low: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
  }

  const phaseColors = {
    'Q1': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
    'Q2': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    'Q3': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    'Q4': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
  }

  const benefitBreakdown = [
    { icon: DollarSign, label: 'Cost', value: useCase.costBenefit, color: 'text-emerald-500' },
    { icon: TrendingUp, label: 'Rev', value: useCase.revenueBenefit, color: 'text-blue-500' },
    { icon: Shield, label: 'Risk', value: useCase.riskBenefit, color: 'text-purple-500' },
    { icon: Wallet, label: 'Cash', value: useCase.cashFlowBenefit, color: 'text-amber-500' }
  ]

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0, 102, 204, 0.15)' }}
      onClick={onClick}
      className={cn(
        'rounded-xl overflow-hidden cursor-pointer transition-all h-full flex flex-col',
        'bg-white dark:bg-glass-medium border hover:border-blueally-300 dark:hover:border-blueally-700',
        useCase.priorityTier === 'Critical'
          ? 'border-red-200 dark:border-red-900/50 dark:shadow-[0_0_15px_rgba(239,68,68,0.1)]'
          : 'border-slate-200 dark:border-glass-border'
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {useCase.companyName}
          </span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border',
            priorityColors[useCase.priorityTier as keyof typeof priorityColors] || priorityColors.Medium
          )}>
            {useCase.priorityTier}
          </span>
        </div>
        <h3 className="font-semibold text-blueally-navy dark:text-white text-sm leading-snug">
          {useCase.id}: {truncate(useCase.useCaseName, 60)}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {useCase.function} {useCase.subFunction && `> ${useCase.subFunction}`}
        </p>
      </div>

      {/* Benefit Breakdown */}
      <div className="p-4 pt-3 flex-1">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {benefitBreakdown.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-1">
                <div className={cn('w-6 h-6 rounded-md bg-slate-50 dark:bg-slate-800 flex items-center justify-center', color)}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>
              <div className="text-[11px] font-semibold text-slate-900 dark:text-white">
                {value > 0 ? formatCurrency(value) : '-'}
              </div>
              <div className="text-[10px] text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* AI Primitives */}
        {useCase.aiPrimitives.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {useCase.aiPrimitives.slice(0, 3).map((primitive, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blueally-50 dark:bg-blueally-900/20 text-blueally-600 dark:text-blueally-400 rounded text-[10px] font-medium"
              >
                <Brain className="w-2.5 h-2.5" />
                {primitive}
              </span>
            ))}
            {useCase.aiPrimitives.length > 3 && (
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded text-[10px]">
                +{useCase.aiPrimitives.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-blueally-primary">
              {formatCurrency(useCase.totalAnnualValue)}
            </div>
            <span className="text-[10px] text-slate-400 uppercase">Annual Value</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-0.5 rounded text-[10px] font-medium',
              phaseColors[(useCase.recommendedPhase || useCase.phase || 'Q1') as keyof typeof phaseColors] || phaseColors['Q1']
            )}>
              {useCase.recommendedPhase || useCase.phase || 'Q1'}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
