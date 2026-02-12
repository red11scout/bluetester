'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calculator, Sliders, Save, RefreshCw, TrendingUp, TrendingDown,
  DollarSign, Percent, Info, Play, Download, ChevronRight,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useDashboardStore } from '@/lib/store'
import { runWhatIfScenario, formatCurrency, formatPercent } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import type { FormulaAssumptions } from '@/lib/types'

const DEFAULT_ASSUMPTIONS: FormulaAssumptions = {
  efficiencyFactor: 0.90,
  adoptionFactor: 0.75,
  confidenceFactor: 0.80,
  hourlyRate: 100,
  reductionRate: 0.50,
  automationRate: 0.70,
  deflectionRate: 0.60,
  recoveryRate: 0.25,
  liftRate: 0.03,
}

const ASSUMPTION_CONFIG = [
  {
    key: 'adoptionFactor',
    label: 'User Adoption Rate',
    description: 'Percentage of users who actively adopt and use AI tools',
    min: 0.50,
    max: 0.95,
    step: 0.05,
    format: 'percent',
  },
  {
    key: 'efficiencyFactor',
    label: 'Implementation Efficiency',
    description: 'Factor accounting for real-world implementation challenges',
    min: 0.70,
    max: 0.98,
    step: 0.02,
    format: 'percent',
  },
  {
    key: 'confidenceFactor',
    label: 'Risk Confidence',
    description: 'Confidence level for risk reduction estimates',
    min: 0.60,
    max: 0.95,
    step: 0.05,
    format: 'percent',
  },
  {
    key: 'hourlyRate',
    label: 'Average Hourly Rate',
    description: 'Blended hourly rate for labor cost calculations',
    min: 50,
    max: 200,
    step: 10,
    format: 'currency',
  },
  {
    key: 'reductionRate',
    label: 'Process Improvement',
    description: 'Expected improvement in process efficiency',
    min: 0.30,
    max: 0.80,
    step: 0.05,
    format: 'percent',
  },
  {
    key: 'automationRate',
    label: 'Automation Coverage',
    description: 'Percentage of tasks that can be automated',
    min: 0.40,
    max: 0.90,
    step: 0.05,
    format: 'percent',
  },
]

// Mock data for demonstration
const BASELINE_VALUES = {
  cost: 156000000,
  risk: 42000000,
  revenue: 89000000,
  cashFlow: 58700000,
  total: 345700000,
}

export function WhatIfAnalysis() {
  const { globalAssumptions, setGlobalAssumptions, scenarios, createScenario } = useDashboardStore()
  const [assumptions, setAssumptions] = useState<FormulaAssumptions>({ ...DEFAULT_ASSUMPTIONS, ...globalAssumptions })
  const [scenarioName, setScenarioName] = useState('')
  const [showSaveModal, setShowSaveModal] = useState(false)

  // Calculate scenario results based on assumptions
  const results = useMemo(() => {
    // Simplified calculation for demonstration
    const adoptionMultiplier = (assumptions.adoptionFactor || 0.75) / 0.75
    const efficiencyMultiplier = (assumptions.efficiencyFactor || 0.90) / 0.90
    const hourlyRateMultiplier = (assumptions.hourlyRate || 100) / 100
    const reductionMultiplier = (assumptions.reductionRate || 0.50) / 0.50

    const combinedMultiplier = adoptionMultiplier * efficiencyMultiplier

    const newCost = BASELINE_VALUES.cost * combinedMultiplier * hourlyRateMultiplier
    const newRisk = BASELINE_VALUES.risk * combinedMultiplier * (assumptions.confidenceFactor || 0.80) / 0.80
    const newRevenue = BASELINE_VALUES.revenue * adoptionMultiplier * (assumptions.liftRate || 0.03) / 0.03
    const newCashFlow = BASELINE_VALUES.cashFlow * combinedMultiplier

    return {
      cost: { original: BASELINE_VALUES.cost, new: newCost, delta: newCost - BASELINE_VALUES.cost },
      risk: { original: BASELINE_VALUES.risk, new: newRisk, delta: newRisk - BASELINE_VALUES.risk },
      revenue: { original: BASELINE_VALUES.revenue, new: newRevenue, delta: newRevenue - BASELINE_VALUES.revenue },
      cashFlow: { original: BASELINE_VALUES.cashFlow, new: newCashFlow, delta: newCashFlow - BASELINE_VALUES.cashFlow },
      total: {
        original: BASELINE_VALUES.total,
        new: newCost + newRisk + newRevenue + newCashFlow,
        delta: (newCost + newRisk + newRevenue + newCashFlow) - BASELINE_VALUES.total,
      },
    }
  }, [assumptions])

  const chartData = [
    { name: 'Cost Savings', baseline: BASELINE_VALUES.cost / 1_000_000, scenario: results.cost.new / 1_000_000 },
    { name: 'Risk Reduction', baseline: BASELINE_VALUES.risk / 1_000_000, scenario: results.risk.new / 1_000_000 },
    { name: 'Revenue Impact', baseline: BASELINE_VALUES.revenue / 1_000_000, scenario: results.revenue.new / 1_000_000 },
    { name: 'Cash Flow', baseline: BASELINE_VALUES.cashFlow / 1_000_000, scenario: results.cashFlow.new / 1_000_000 },
  ]

  const handleReset = () => {
    setAssumptions({ ...DEFAULT_ASSUMPTIONS })
  }

  const handleSaveScenario = () => {
    if (scenarioName) {
      createScenario(scenarioName, `Custom scenario created on ${new Date().toLocaleDateString()}`)
      setGlobalAssumptions(assumptions)
      setShowSaveModal(false)
      setScenarioName('')
    }
  }

  const formatValue = (value: number, format: string) => {
    if (format === 'percent') return `${(value * 100).toFixed(0)}%`
    if (format === 'currency') return `$${value}`
    return value.toString()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blueally-navy dark:text-white">What-If Analysis</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Adjust assumptions to model different scenarios and see impact on portfolio value
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset} className="ba-btn-ghost text-sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </button>
          <button onClick={() => setShowSaveModal(true)} className="ba-btn-primary text-sm">
            <Save className="w-4 h-4 mr-2" />
            Save Scenario
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assumptions Panel */}
        <div className="lg:col-span-1">
          <div className="ba-card p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Sliders className="w-5 h-5 text-blueally-primary" />
              <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">Assumptions</h2>
            </div>

            <div className="space-y-6">
              {ASSUMPTION_CONFIG.map((config) => (
                <div key={config.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {config.label}
                    </label>
                    <span className="text-sm font-bold text-blueally-primary">
                      {formatValue(assumptions[config.key as keyof FormulaAssumptions] as number || config.min, config.format)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={assumptions[config.key as keyof FormulaAssumptions] as number || config.min}
                    onChange={(e) => setAssumptions({ ...assumptions, [config.key]: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blueally-primary"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{config.description}</p>
                </div>
              ))}
            </div>

            {/* Quick Presets */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Quick Presets</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAssumptions({ ...assumptions, adoptionFactor: 0.65, efficiencyFactor: 0.85 })}
                  className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-left"
                >
                  <div className="font-medium">Conservative</div>
                  <div className="text-xs text-slate-500">Lower adoption</div>
                </button>
                <button
                  onClick={() => setAssumptions({ ...assumptions, adoptionFactor: 0.85, efficiencyFactor: 0.95 })}
                  className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-left"
                >
                  <div className="font-medium">Aggressive</div>
                  <div className="text-xs text-slate-500">High adoption</div>
                </button>
                <button
                  onClick={() => setAssumptions({ ...assumptions, hourlyRate: 150 })}
                  className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-left"
                >
                  <div className="font-medium">Higher Rates</div>
                  <div className="text-xs text-slate-500">$150/hour</div>
                </button>
                <button
                  onClick={() => setAssumptions({ ...assumptions, automationRate: 0.85, reductionRate: 0.70 })}
                  className="px-3 py-2 text-sm bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-left"
                >
                  <div className="font-medium">High Automation</div>
                  <div className="text-xs text-slate-500">85% coverage</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultCard
              label="Cost Savings"
              baseline={results.cost.original}
              scenario={results.cost.new}
              delta={results.cost.delta}
              color="green"
            />
            <ResultCard
              label="Risk Reduction"
              baseline={results.risk.original}
              scenario={results.risk.new}
              delta={results.risk.delta}
              color="amber"
            />
            <ResultCard
              label="Revenue Impact"
              baseline={results.revenue.original}
              scenario={results.revenue.new}
              delta={results.revenue.delta}
              color="blue"
            />
            <ResultCard
              label="Cash Flow"
              baseline={results.cashFlow.original}
              scenario={results.cashFlow.new}
              delta={results.cashFlow.delta}
              color="purple"
            />
          </div>

          {/* Total Impact */}
          <div className="ba-card p-6 bg-gradient-to-r from-blueally-50 to-blueally-100 dark:from-blueally-900/30 dark:to-blueally-800/30 border-2 border-blueally-200 dark:border-blueally-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-blueally-600 dark:text-blueally-400">Total Portfolio Impact</h3>
                <div className="text-3xl font-bold text-blueally-primary mt-1">
                  {formatCurrency(results.total.new)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Baseline: {formatCurrency(results.total.original)}
                  </span>
                  <span className={cn(
                    'text-sm font-semibold flex items-center gap-1',
                    results.total.delta >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {results.total.delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {formatCurrency(Math.abs(results.total.delta))} ({formatPercent((results.total.delta / results.total.original) * 100)})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <Calculator className="w-12 h-12 text-blueally-primary/30" />
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="ba-card p-6">
            <h3 className="text-lg font-semibold text-blueally-navy dark:text-white mb-4">Baseline vs Scenario Comparison</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis type="number" unit="M" />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toFixed(1)}M`, '']}
                    labelStyle={{ color: '#1A2B4C' }}
                  />
                  <Bar dataKey="baseline" fill="#94A3B8" name="Baseline" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="scenario" fill="#0066CC" name="Scenario" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Saved Scenarios */}
          {scenarios.length > 0 && (
            <div className="ba-card p-6">
              <h3 className="text-lg font-semibold text-blueally-navy dark:text-white mb-4">Saved Scenarios</h3>
              <div className="space-y-2">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-blueally-navy dark:text-white">{scenario.name}</div>
                      <div className="text-xs text-slate-500">{scenario.description}</div>
                    </div>
                    <button className="text-blueally-primary hover:text-blueally-600 text-sm font-medium flex items-center gap-1">
                      Load <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSaveModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-blueally-navy dark:text-white mb-4">Save Scenario</h3>
            <input
              type="text"
              placeholder="Scenario name..."
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="ba-input mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSaveModal(false)} className="ba-btn-ghost">Cancel</button>
              <button onClick={handleSaveScenario} className="ba-btn-primary">Save</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

function ResultCard({
  label,
  baseline,
  scenario,
  delta,
  color,
}: {
  label: string
  baseline: number
  scenario: number
  delta: number
  color: string
}) {
  const colorClasses = {
    green: 'text-green-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  }

  return (
    <div className="ba-card p-4">
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      <div className="text-xl font-bold text-blueally-navy dark:text-white">{formatCurrency(scenario)}</div>
      <div className={cn(
        'text-sm font-medium flex items-center gap-1 mt-1',
        delta >= 0 ? 'text-green-600' : 'text-red-600'
      )}>
        {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {formatCurrency(Math.abs(delta))}
      </div>
    </div>
  )
}
