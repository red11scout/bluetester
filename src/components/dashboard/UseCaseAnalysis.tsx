'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Search, Filter, TrendingUp, DollarSign, Shield, Wallet } from 'lucide-react'
import { formatCurrency, cn } from '@/lib/utils'

// Sample use case data (would come from MongoDB in production)
const SAMPLE_USE_CASES = [
  {
    id: 'UC-01',
    company: 'Scan Global Logistics',
    name: 'Intelligent Shipment Routing',
    function: 'Operations',
    aiPrimitives: ['Data Analysis', 'Workflow Automation'],
    costBenefit: 12500000,
    revenueBenefit: 8500000,
    riskBenefit: 2100000,
    cashFlowBenefit: 4200000,
    totalValue: 27300000,
    priorityTier: 'Critical',
    phase: 'Q1',
  },
  {
    id: 'UC-02',
    company: 'TricorBraun',
    name: 'Demand Forecasting Engine',
    function: 'Supply Chain',
    aiPrimitives: ['Data Analysis', 'Content Creation'],
    costBenefit: 8900000,
    revenueBenefit: 15200000,
    riskBenefit: 1800000,
    cashFlowBenefit: 6100000,
    totalValue: 32000000,
    priorityTier: 'Critical',
    phase: 'Q1',
  },
  {
    id: 'UC-03',
    company: 'NES Fircroft',
    name: 'Candidate Matching System',
    function: 'Talent Acquisition',
    aiPrimitives: ['Conversational Interfaces', 'Data Analysis'],
    costBenefit: 6200000,
    revenueBenefit: 11800000,
    riskBenefit: 890000,
    cashFlowBenefit: 2400000,
    totalValue: 21290000,
    priorityTier: 'High',
    phase: 'Q1-Q2',
  },
  {
    id: 'UC-04',
    company: 'Redwood Logistics',
    name: 'Dynamic Pricing Optimizer',
    function: 'Sales',
    aiPrimitives: ['Data Analysis', 'Workflow Automation'],
    costBenefit: 3400000,
    revenueBenefit: 9600000,
    riskBenefit: 1200000,
    cashFlowBenefit: 3800000,
    totalValue: 18000000,
    priorityTier: 'High',
    phase: 'Q2',
  },
  {
    id: 'UC-05',
    company: 'American Oncology Network',
    name: 'Clinical Documentation Assistant',
    function: 'Healthcare Operations',
    aiPrimitives: ['Content Creation', 'Research & Information Retrieval'],
    costBenefit: 5100000,
    revenueBenefit: 4200000,
    riskBenefit: 3600000,
    cashFlowBenefit: 1800000,
    totalValue: 14700000,
    priorityTier: 'Critical',
    phase: 'Q1',
  },
]

export function UseCaseAnalysis() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null)

  const filteredUseCases = SAMPLE_USE_CASES.filter(uc => {
    if (searchQuery && !uc.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !uc.company.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (selectedFunction && uc.function !== selectedFunction) {
      return false
    }
    return true
  })

  const functions = [...new Set(SAMPLE_USE_CASES.map(uc => uc.function))]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-blueally-navy dark:text-white">AI Use Case Analysis</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Explore AI use cases with quantified benefits across portfolio companies
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search use cases or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blueally-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFunction(null)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              !selectedFunction
                ? 'bg-blueally-primary text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            )}
          >
            All Functions
          </button>
          {functions.map(func => (
            <button
              key={func}
              onClick={() => setSelectedFunction(selectedFunction === func ? null : func)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                selectedFunction === func
                  ? 'bg-blueally-primary text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              )}
            >
              {func}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Cost Savings"
          value={formatCurrency(filteredUseCases.reduce((s, uc) => s + uc.costBenefit, 0))}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue Impact"
          value={formatCurrency(filteredUseCases.reduce((s, uc) => s + uc.revenueBenefit, 0))}
          color="blue"
        />
        <StatCard
          icon={Shield}
          label="Risk Reduction"
          value={formatCurrency(filteredUseCases.reduce((s, uc) => s + uc.riskBenefit, 0))}
          color="amber"
        />
        <StatCard
          icon={Wallet}
          label="Cash Flow Impact"
          value={formatCurrency(filteredUseCases.reduce((s, uc) => s + uc.cashFlowBenefit, 0))}
          color="purple"
        />
      </div>

      {/* Use Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredUseCases.map((uc) => (
          <motion.div
            key={uc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="ba-card p-5 hover:shadow-card-hover transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blueally-50 dark:bg-blueally-900/30 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-blueally-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-blueally-navy dark:text-white">{uc.name}</h3>
                  <p className="text-sm text-slate-500">{uc.company}</p>
                </div>
              </div>
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-semibold',
                uc.priorityTier === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                uc.priorityTier === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              )}>
                {uc.priorityTier}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">
                {uc.function}
              </span>
              {uc.aiPrimitives.map(prim => (
                <span key={prim} className="px-2 py-0.5 bg-blueally-50 dark:bg-blueally-900/30 rounded text-xs text-blueally-600 dark:text-blueally-400">
                  {prim}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <BenefitRow icon={DollarSign} label="Cost" value={uc.costBenefit} color="text-green-600" />
              <BenefitRow icon={TrendingUp} label="Revenue" value={uc.revenueBenefit} color="text-blue-600" />
              <BenefitRow icon={Shield} label="Risk" value={uc.riskBenefit} color="text-amber-600" />
              <BenefitRow icon={Wallet} label="Cash Flow" value={uc.cashFlowBenefit} color="text-purple-600" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-sm text-slate-500">Total Annual Value</span>
                <div className="text-xl font-bold text-blueally-primary">{formatCurrency(uc.totalValue)}</div>
              </div>
              <div className="text-right">
                <span className="text-sm text-slate-500">Phase</span>
                <div className="font-semibold text-blueally-navy dark:text-white">{uc.phase}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorClasses = {
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600',
  }

  return (
    <div className="ba-card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', colorClasses[color as keyof typeof colorClasses])}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="text-xl font-bold text-blueally-navy dark:text-white">{value}</div>
    </div>
  )
}

function BenefitRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn('w-4 h-4', color)} />
      <span className="text-xs text-slate-500">{label}:</span>
      <span className="text-sm font-semibold text-blueally-navy dark:text-white">{formatCurrency(value)}</span>
    </div>
  )
}
