'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X,
  Search,
  Building2,
  Briefcase,
  Flag,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterState {
  searchQuery: string
  companies: string[]
  functions: string[]
  priorities: string[]
  phases: string[]
  investmentGroups: string[]
  aiPrimitives: string[]
  minValue: number
  maxValue: number
}

interface UseCasesFiltersProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  companies: string[]
  functions: string[]
  aiPrimitives: string[]
  maxValue: number
}

export function UseCasesFilters({
  filters,
  onFiltersChange,
  companies,
  functions,
  aiPrimitives,
  maxValue
}: UseCasesFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['companies', 'functions', 'priorities'])
  )
  const [companySearch, setCompanySearch] = useState('')

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const toggleFilter = (
    key: keyof FilterState,
    value: string
  ) => {
    const currentValues = filters[key] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    onFiltersChange({ ...filters, [key]: newValues })
  }

  const priorities = ['Critical', 'High', 'Medium', 'Low']
  const phases = ['Q1', 'Q2', 'Q3', 'Q4']

  const filteredCompanies = companies.filter(c =>
    c.toLowerCase().includes(companySearch.toLowerCase())
  )

  // Format value for display
  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blueally-primary" />
            <span className="font-semibold text-blueally-navy dark:text-white">Filters</span>
          </div>
          {(filters.companies.length > 0 ||
            filters.functions.length > 0 ||
            filters.priorities.length > 0 ||
            filters.phases.length > 0 ||
            filters.aiPrimitives.length > 0) && (
            <button
              onClick={() => onFiltersChange({
                ...filters,
                companies: [],
                functions: [],
                priorities: [],
                phases: [],
                investmentGroups: [],
                aiPrimitives: []
              })}
              className="text-xs text-blueally-600 hover:text-blueally-700 dark:text-blueally-400 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {/* Companies Section */}
        <FilterSection
          title="Companies"
          icon={Building2}
          count={filters.companies.length}
          isExpanded={expandedSections.has('companies')}
          onToggle={() => toggleSection('companies')}
        >
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blueally-500"
            />
          </div>
          <div className="space-y-0.5 max-h-48 overflow-y-auto">
            {filteredCompanies.slice(0, 20).map(company => (
              <FilterCheckbox
                key={company}
                label={company}
                checked={filters.companies.includes(company)}
                onChange={() => toggleFilter('companies', company)}
              />
            ))}
            {filteredCompanies.length > 20 && (
              <p className="text-[10px] text-slate-400 px-2 py-1">
                +{filteredCompanies.length - 20} more...
              </p>
            )}
          </div>
        </FilterSection>

        {/* Functions Section */}
        <FilterSection
          title="Business Functions"
          icon={Briefcase}
          count={filters.functions.length}
          isExpanded={expandedSections.has('functions')}
          onToggle={() => toggleSection('functions')}
        >
          <div className="space-y-0.5">
            {functions.map(func => (
              <FilterCheckbox
                key={func}
                label={func}
                checked={filters.functions.includes(func)}
                onChange={() => toggleFilter('functions', func)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Priority Section */}
        <FilterSection
          title="Priority Tier"
          icon={Flag}
          count={filters.priorities.length}
          isExpanded={expandedSections.has('priorities')}
          onToggle={() => toggleSection('priorities')}
        >
          <div className="space-y-0.5">
            {priorities.map(priority => (
              <FilterCheckbox
                key={priority}
                label={priority}
                checked={filters.priorities.includes(priority)}
                onChange={() => toggleFilter('priorities', priority)}
                badge={
                  <PriorityBadge priority={priority} />
                }
              />
            ))}
          </div>
        </FilterSection>

        {/* Phase Section */}
        <FilterSection
          title="Implementation Phase"
          icon={Clock}
          count={filters.phases.length}
          isExpanded={expandedSections.has('phases')}
          onToggle={() => toggleSection('phases')}
        >
          <div className="grid grid-cols-2 gap-1">
            {phases.map(phase => (
              <button
                key={phase}
                onClick={() => toggleFilter('phases', phase)}
                className={cn(
                  'px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                  filters.phases.includes(phase)
                    ? 'bg-blueally-100 text-blueally-700 dark:bg-blueally-900/30 dark:text-blueally-400'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                {phase}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* AI Primitives Section */}
        <FilterSection
          title="AI Primitives"
          icon={Sparkles}
          count={filters.aiPrimitives.length}
          isExpanded={expandedSections.has('aiPrimitives')}
          onToggle={() => toggleSection('aiPrimitives')}
        >
          <div className="flex flex-wrap gap-1.5">
            {aiPrimitives.slice(0, 12).map(primitive => (
              <button
                key={primitive}
                onClick={() => toggleFilter('aiPrimitives', primitive)}
                className={cn(
                  'px-2 py-1 rounded text-[10px] font-medium transition-colors',
                  filters.aiPrimitives.includes(primitive)
                    ? 'bg-blueally-100 text-blueally-700 dark:bg-blueally-900/30 dark:text-blueally-400'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                {primitive}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Value Range Section */}
        <FilterSection
          title="Value Range"
          icon={Sparkles}
          isExpanded={expandedSections.has('valueRange')}
          onToggle={() => toggleSection('valueRange')}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{formatValue(filters.minValue)}</span>
              <span>{formatValue(filters.maxValue)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxValue}
              value={filters.maxValue}
              onChange={(e) => onFiltersChange({
                ...filters,
                maxValue: parseInt(e.target.value)
              })}
              className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </FilterSection>
      </div>
    </div>
  )
}

// Filter Section Component
interface FilterSectionProps {
  title: string
  icon: React.ElementType
  count?: number
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, icon: Icon, count, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="px-1.5 py-0.5 bg-blueally-100 dark:bg-blueally-900/30 text-blueally-600 dark:text-blueally-400 text-[10px] font-semibold rounded">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

// Filter Checkbox Component
interface FilterCheckboxProps {
  label: string
  checked: boolean
  onChange: () => void
  badge?: React.ReactNode
}

function FilterCheckbox({ label, checked, onChange, badge }: FilterCheckboxProps) {
  return (
    <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group">
      <div className={cn(
        'w-4 h-4 rounded border flex items-center justify-center transition-colors',
        checked
          ? 'bg-blueally-500 border-blueally-500'
          : 'border-slate-300 dark:border-slate-600 group-hover:border-blueally-400'
      )}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="flex-1 text-xs text-slate-600 dark:text-slate-400 truncate">
        {label}
      </span>
      {badge}
    </label>
  )
}

// Priority Badge Component
function PriorityBadge({ priority }: { priority: string }) {
  const colors = {
    Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    High: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Low: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
  }

  return (
    <span className={cn(
      'px-1.5 py-0.5 rounded text-[10px] font-medium',
      colors[priority as keyof typeof colors] || colors.Medium
    )}>
      {priority.charAt(0)}
    </span>
  )
}
