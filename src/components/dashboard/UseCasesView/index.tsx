'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  ChevronDown,
  X,
  Sparkles,
  TrendingUp,
  DollarSign,
  Shield,
  Wallet,
  Building2,
  Lightbulb,
  Target,
  Zap,
  Clock,
  ArrowUpRight,
  SlidersHorizontal,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMPANIES, USE_CASES, FRICTION_POINTS, KPIS, STRATEGIC_THEMES } from '@/lib/portfolioData.generated'
import type { ExtractedUseCase } from '@/lib/portfolioTypes'
import { UseCaseCard } from './UseCaseCard'
import { UseCaseDetailPanel } from './UseCaseDetailPanel'
import { UseCasesFilters, type FilterState } from './UseCasesFilters'
import { BenefitDonut } from './BenefitDonut'
import { FormulaEditor } from './FormulaEditor'

// Investment Group definitions
const INVESTMENT_GROUPS = {
  'Small Business': ['50 Floor', 'American Expediting', 'Redwood Logistics'],
  'Middle Market': ['TricorBraun', 'AmeriVet Partners', 'American Dental', 'Ascential Technologies'],
  'Elevate': ['Custom Brands Group', 'National HME', 'SCA Health']
} as const

// Calculate totals
const PORTFOLIO_TOTALS = {
  totalValue: USE_CASES.reduce((sum, uc) => sum + uc.totalAnnualValue, 0),
  totalCost: USE_CASES.reduce((sum, uc) => sum + uc.costBenefit, 0),
  totalRevenue: USE_CASES.reduce((sum, uc) => sum + uc.revenueBenefit, 0),
  totalRisk: USE_CASES.reduce((sum, uc) => sum + uc.riskBenefit, 0),
  totalCashFlow: USE_CASES.reduce((sum, uc) => sum + uc.cashFlowBenefit, 0)
}

// Format currency
function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

// Get unique functions from use cases
function getUniqueFunctions(): string[] {
  const functions = new Set<string>()
  USE_CASES.forEach(uc => functions.add(uc.function))
  return Array.from(functions).sort()
}

// Get unique AI primitives
function getUniqueAIPrimitives(): string[] {
  const primitives = new Set<string>()
  USE_CASES.forEach(uc => uc.aiPrimitives.forEach(p => primitives.add(p)))
  return Array.from(primitives).sort()
}

// Initial filter state
const initialFilters: FilterState = {
  searchQuery: '',
  companies: [],
  functions: [],
  priorities: [],
  phases: [],
  investmentGroups: [],
  aiPrimitives: [],
  minValue: 0,
  maxValue: Math.max(...USE_CASES.map(uc => uc.totalAnnualValue))
}

export function UseCasesView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [showFilters, setShowFilters] = useState(true)
  const [selectedUseCase, setSelectedUseCase] = useState<ExtractedUseCase | null>(null)
  const [showFormulaEditor, setShowFormulaEditor] = useState(false)
  const [sortBy, setSortBy] = useState<'value' | 'priority' | 'company' | 'phase'>('value')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Assumption factors (editable)
  const [assumptions, setAssumptions] = useState({
    efficiencyFactor: 0.90,
    adoptionFactor: 0.75,
    confidenceFactor: 0.80,
    executiveRate: 395,
    managerRate: 150,
    specialistRate: 100,
    analystRate: 85
  })

  // Filter use cases
  const filteredUseCases = useMemo(() => {
    let result = [...USE_CASES]

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(uc =>
        uc.useCaseName.toLowerCase().includes(query) ||
        uc.companyName.toLowerCase().includes(query) ||
        uc.description.toLowerCase().includes(query) ||
        uc.function.toLowerCase().includes(query)
      )
    }

    // Companies filter
    if (filters.companies.length > 0) {
      result = result.filter(uc => filters.companies.includes(uc.companyName))
    }

    // Investment groups filter
    if (filters.investmentGroups.length > 0) {
      const companiesInGroups: string[] = filters.investmentGroups.flatMap(
        group => [...(INVESTMENT_GROUPS[group as keyof typeof INVESTMENT_GROUPS] || [])]
      )
      result = result.filter(uc => companiesInGroups.includes(uc.companyName))
    }

    // Functions filter
    if (filters.functions.length > 0) {
      result = result.filter(uc => filters.functions.includes(uc.function))
    }

    // Priorities filter
    if (filters.priorities.length > 0) {
      result = result.filter(uc => filters.priorities.includes(uc.priorityTier))
    }

    // Phases filter
    if (filters.phases.length > 0) {
      result = result.filter(uc => filters.phases.includes(uc.recommendedPhase || uc.phase || 'Q1'))
    }

    // AI Primitives filter
    if (filters.aiPrimitives.length > 0) {
      result = result.filter(uc =>
        uc.aiPrimitives.some(p => filters.aiPrimitives.includes(p))
      )
    }

    // Value range filter
    result = result.filter(uc =>
      uc.totalAnnualValue >= filters.minValue &&
      uc.totalAnnualValue <= filters.maxValue
    )

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'value':
          comparison = a.totalAnnualValue - b.totalAnnualValue
          break
        case 'priority':
          const priorityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 }
          comparison = (priorityOrder[a.priorityTier as keyof typeof priorityOrder] || 0) -
                      (priorityOrder[b.priorityTier as keyof typeof priorityOrder] || 0)
          break
        case 'company':
          comparison = a.companyName.localeCompare(b.companyName)
          break
        case 'phase':
          comparison = (a.recommendedPhase || a.phase || '').localeCompare(b.recommendedPhase || b.phase || '')
          break
      }
      return sortDirection === 'desc' ? -comparison : comparison
    })

    return result
  }, [filters, sortBy, sortDirection])

  // Filtered totals
  const filteredTotals = useMemo(() => ({
    totalValue: filteredUseCases.reduce((sum, uc) => sum + uc.totalAnnualValue, 0),
    totalCost: filteredUseCases.reduce((sum, uc) => sum + uc.costBenefit, 0),
    totalRevenue: filteredUseCases.reduce((sum, uc) => sum + uc.revenueBenefit, 0),
    totalRisk: filteredUseCases.reduce((sum, uc) => sum + uc.riskBenefit, 0),
    totalCashFlow: filteredUseCases.reduce((sum, uc) => sum + uc.cashFlowBenefit, 0),
    count: filteredUseCases.length
  }), [filteredUseCases])

  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.companies.length > 0 ||
      filters.functions.length > 0 ||
      filters.priorities.length > 0 ||
      filters.phases.length > 0 ||
      filters.investmentGroups.length > 0 ||
      filters.aiPrimitives.length > 0
    )
  }, [filters])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blueally-primary via-blueally-secondary to-blueally-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Title & Stats */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Use Cases Portfolio</h1>
                  <p className="text-blue-200">540 opportunities across 54 companies</p>
                </div>
              </div>

              {/* Total Value Counter */}
              <div className="mt-6">
                <div className="text-sm text-blue-200 uppercase tracking-wider mb-1">
                  Total Portfolio Value
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-bold tracking-tight"
                >
                  {formatCurrency(filteredTotals.totalValue)}
                </motion.div>
                {hasActiveFilters && (
                  <div className="text-sm text-blue-200 mt-1">
                    {filteredTotals.count} of {USE_CASES.length} use cases
                  </div>
                )}
              </div>
            </div>

            {/* Benefit Driver Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <BenefitCard
                icon={DollarSign}
                label="Cost Savings"
                value={filteredTotals.totalCost}
                color="emerald"
                percentage={Math.round((filteredTotals.totalCost / filteredTotals.totalValue) * 100) || 0}
              />
              <BenefitCard
                icon={TrendingUp}
                label="Revenue Growth"
                value={filteredTotals.totalRevenue}
                color="blue"
                percentage={Math.round((filteredTotals.totalRevenue / filteredTotals.totalValue) * 100) || 0}
              />
              <BenefitCard
                icon={Shield}
                label="Risk Reduction"
                value={filteredTotals.totalRisk}
                color="purple"
                percentage={Math.round((filteredTotals.totalRisk / filteredTotals.totalValue) * 100) || 0}
              />
              <BenefitCard
                icon={Wallet}
                label="Cash Flow"
                value={filteredTotals.totalCashFlow}
                color="amber"
                percentage={Math.round((filteredTotals.totalCashFlow / filteredTotals.totalValue) * 100) || 0}
              />
            </div>
          </div>

          {/* Quick Investment Group Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-8 pt-6 border-t border-white/10">
            <span className="text-sm text-blue-200">Quick Filter:</span>
            {Object.keys(INVESTMENT_GROUPS).map(group => (
              <button
                key={group}
                onClick={() => {
                  if (filters.investmentGroups.includes(group)) {
                    setFilters({
                      ...filters,
                      investmentGroups: filters.investmentGroups.filter(g => g !== group)
                    })
                  } else {
                    setFilters({
                      ...filters,
                      investmentGroups: [...filters.investmentGroups, group]
                    })
                  }
                }}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all',
                  filters.investmentGroups.includes(group)
                    ? 'bg-white text-blueally-primary'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                )}
              >
                {group}
              </button>
            ))}
            <button
              onClick={() => setShowFormulaEditor(true)}
              className="ml-auto px-4 py-2 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 text-white flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Edit Assumptions
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex-shrink-0"
              >
                <UseCasesFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  companies={COMPANIES.map(c => c.name)}
                  functions={getUniqueFunctions()}
                  aiPrimitives={getUniqueAIPrimitives()}
                  maxValue={Math.max(...USE_CASES.map(uc => uc.totalAnnualValue))}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    showFilters
                      ? 'bg-blueally-100 text-blueally-600 dark:bg-blueally-900/30 dark:text-blueally-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                  )}
                >
                  <Filter className="w-5 h-5" />
                </button>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search use cases..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
                    className="pl-10 pr-4 py-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blueally-500"
                  />
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blueally-600 hover:text-blueally-700 dark:text-blueally-400 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blueally-500"
                  >
                    <option value="value">Value</option>
                    <option value="priority">Priority</option>
                    <option value="company">Company</option>
                    <option value="phase">Phase</option>
                  </select>
                  <button
                    onClick={() => setSortDirection(d => d === 'asc' ? 'desc' : 'asc')}
                    className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <ArrowUpRight className={cn(
                      'w-4 h-4 transition-transform',
                      sortDirection === 'asc' && 'rotate-180'
                    )} />
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      viewMode === 'grid'
                        ? 'bg-blueally-100 text-blueally-600 dark:bg-blueally-900/30 dark:text-blueally-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 rounded transition-colors',
                      viewMode === 'list'
                        ? 'bg-blueally-100 text-blueally-600 dark:bg-blueally-900/30 dark:text-blueally-400'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                    )}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{filteredUseCases.length}</span> of {USE_CASES.length} use cases
              </p>
            </div>

            {/* Use Cases Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUseCases.slice(0, 50).map((useCase, index) => (
                  <motion.div
                    key={`${useCase.companyName}-${useCase.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <UseCaseCard
                      useCase={useCase}
                      onClick={() => setSelectedUseCase(useCase)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUseCases.slice(0, 100).map((useCase, index) => (
                  <UseCaseListItem
                    key={`${useCase.companyName}-${useCase.id}`}
                    useCase={useCase}
                    onClick={() => setSelectedUseCase(useCase)}
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {filteredUseCases.length > (viewMode === 'grid' ? 50 : 100) && (
              <div className="text-center mt-8">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  Showing {viewMode === 'grid' ? 50 : 100} of {filteredUseCases.length} results
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Use filters to narrow down results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <UseCaseDetailPanel
        useCase={selectedUseCase}
        onClose={() => setSelectedUseCase(null)}
        frictionPoints={FRICTION_POINTS}
        kpis={KPIS}
        assumptions={assumptions}
      />

      {/* Formula Editor Modal */}
      <FormulaEditor
        isOpen={showFormulaEditor}
        onClose={() => setShowFormulaEditor(false)}
        assumptions={assumptions}
        onAssumptionsChange={setAssumptions}
      />
    </div>
  )
}

// Benefit Card Component
interface BenefitCardProps {
  icon: React.ElementType
  label: string
  value: number
  color: 'emerald' | 'blue' | 'purple' | 'amber'
  percentage: number
}

function BenefitCard({ icon: Icon, label, value, color, percentage }: BenefitCardProps) {
  const colorClasses = {
    emerald: 'from-emerald-400 to-emerald-600',
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    amber: 'from-amber-400 to-amber-600'
  }

  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-blue-100">{label}</span>
      </div>
      <div className="text-2xl font-bold">{formatCurrency(value)}</div>
      <div className="text-xs text-blue-200 mt-1">{percentage}% of total</div>
    </div>
  )
}

// List Item Component
interface UseCaseListItemProps {
  useCase: ExtractedUseCase
  onClick: () => void
}

function UseCaseListItem({ useCase, onClick }: UseCaseListItemProps) {
  const priorityColors = {
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    High: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
  }

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 hover:border-blueally-300 dark:hover:border-blueally-700 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">{useCase.companyName}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{useCase.function}</span>
          </div>
          <h3 className="font-medium text-blueally-navy dark:text-white truncate">
            {useCase.id}: {useCase.useCaseName}
          </h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-lg font-bold text-blueally-primary">
              {formatCurrency(useCase.totalAnnualValue)}
            </div>
            <div className="text-xs text-slate-500">{useCase.recommendedPhase || useCase.phase || 'Q1'}</div>
          </div>
          <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', priorityColors[useCase.priorityTier as keyof typeof priorityColors] || priorityColors.Medium)}>
            {useCase.priorityTier}
          </span>
        </div>
      </div>
    </div>
  )
}
