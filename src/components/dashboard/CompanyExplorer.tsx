'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Filter, SortAsc, SortDesc, ChevronDown, ChevronRight,
  Building2, TrendingUp, Target, X, Eye, Download,
} from 'lucide-react'
import { useDashboardStore, useFilteredCompanies } from '@/lib/store'
import { PORTFOLIO_DATA } from '@/lib/data-loader'
import { formatCurrency, quadrantColors, trackColors, cohortColors, cn } from '@/lib/utils'
import type { Company, Cohort, Quadrant, Track } from '@/lib/types'

type SortField = 'rank' | 'name' | 'revenue' | 'ebitda' | 'adjustedEbitda' | 'priorityScore'
type SortDirection = 'asc' | 'desc'

export function CompanyExplorer() {
  const { filters, setFilters, clearFilters, setSelectedCompany } = useDashboardStore()
  const companies = useFilteredCompanies()

  const [sortField, setSortField] = useState<SortField>('rank')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState<Company | null>(null)

  // Sort companies
  const sortedCompanies = useMemo(() => {
    return [...companies].sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      if (sortField === 'priorityScore') {
        aVal = a.scores.priorityScore
        bVal = b.scores.priorityScore
      } else {
        aVal = a[sortField as keyof Company] as number | string
        bVal = b[sortField as keyof Company] as number | string
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      }

      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })
  }, [companies, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blueally-navy dark:text-white">Company Explorer</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Showing {companies.length} of {PORTFOLIO_DATA.length} companies
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={filters.searchQuery || ''}
              onChange={(e) => setFilters({ searchQuery: e.target.value })}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-blueally-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'ba-btn-ghost text-sm',
              showFilters && 'bg-blueally-50 dark:bg-blueally-900/30 text-blueally-primary'
            )}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {(filters.cohort?.length || filters.quadrant?.length || filters.track?.length) && (
              <span className="ml-2 w-5 h-5 rounded-full bg-blueally-primary text-white text-xs flex items-center justify-center">
                {(filters.cohort?.length || 0) + (filters.quadrant?.length || 0) + (filters.track?.length || 0)}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {(filters.cohort?.length || filters.quadrant?.length || filters.track?.length || filters.searchQuery) && (
            <button
              onClick={clearFilters}
              className="text-sm text-slate-500 hover:text-blueally-primary flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}

          {/* Export */}
          <button className="ba-btn-outline text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="ba-card p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Cohort Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cohort</label>
                  <div className="flex flex-wrap gap-2">
                    {(['Industrial', 'Services', 'Consumer', 'Healthcare', 'Logistics'] as Cohort[]).map((cohort) => (
                      <button
                        key={cohort}
                        onClick={() => {
                          const current = filters.cohort || []
                          const newCohorts = current.includes(cohort)
                            ? current.filter(c => c !== cohort)
                            : [...current, cohort]
                          setFilters({ cohort: newCohorts.length ? newCohorts : undefined })
                        }}
                        className={cn(
                          'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                          filters.cohort?.includes(cohort)
                            ? 'bg-blueally-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        )}
                      >
                        {cohort}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quadrant Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quadrant</label>
                  <div className="flex flex-wrap gap-2">
                    {(['Champion', 'Quick Win', 'Strategic', 'Foundation'] as Quadrant[]).map((quadrant) => (
                      <button
                        key={quadrant}
                        onClick={() => {
                          const current = filters.quadrant || []
                          const newQuadrants = current.includes(quadrant)
                            ? current.filter(q => q !== quadrant)
                            : [...current, quadrant]
                          setFilters({ quadrant: newQuadrants.length ? newQuadrants : undefined })
                        }}
                        className={cn(
                          'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                          filters.quadrant?.includes(quadrant)
                            ? `${quadrantColors[quadrant].bg} ${quadrantColors[quadrant].text}`
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        )}
                      >
                        {quadrant}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Track Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Track</label>
                  <div className="flex flex-wrap gap-2">
                    {(['T1', 'T2', 'T3'] as Track[]).map((track) => (
                      <button
                        key={track}
                        onClick={() => {
                          const current = filters.track || []
                          const newTracks = current.includes(track)
                            ? current.filter(t => t !== track)
                            : [...current, track]
                          setFilters({ track: newTracks.length ? newTracks : undefined })
                        }}
                        className={cn(
                          'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                          filters.track?.includes(track)
                            ? `${trackColors[track].bg} ${trackColors[track].text}`
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        )}
                      >
                        {track}: {trackColors[track].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companies Table */}
      <div className="ba-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ba-table">
            <thead>
              <tr>
                <th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort('rank')}>
                  <div className="flex items-center gap-1">Rank <SortIcon field="rank" /></div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Company <SortIcon field="name" /></div>
                </th>
                <th>Cohort</th>
                <th>Quadrant</th>
                <th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-right" onClick={() => handleSort('revenue')}>
                  <div className="flex items-center justify-end gap-1">Revenue <SortIcon field="revenue" /></div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-right" onClick={() => handleSort('ebitda')}>
                  <div className="flex items-center justify-end gap-1">EBITDA <SortIcon field="ebitda" /></div>
                </th>
                <th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 text-right" onClick={() => handleSort('adjustedEbitda')}>
                  <div className="flex items-center justify-end gap-1">AI Opportunity <SortIcon field="adjustedEbitda" /></div>
                </th>
                <th>Track</th>
                <th>Phase</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCompanies.map((company) => (
                <tr
                  key={company.name}
                  className="cursor-pointer"
                  onClick={() => setSelectedDetail(company)}
                >
                  <td className="font-semibold text-blueally-navy dark:text-white">{company.rank}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blueally-primary to-blueally-secondary flex items-center justify-center text-white text-xs font-bold">
                        {company.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-blueally-navy dark:text-white">{company.name}</div>
                        <div className="text-xs text-slate-500">{company.investmentGroup}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={cn('ba-badge', cohortColors[company.cohort]?.bg, cohortColors[company.cohort]?.text)}>
                      {company.cohort}
                    </span>
                  </td>
                  <td>
                    <span className={cn('ba-badge', quadrantColors[company.quadrant]?.bg, quadrantColors[company.quadrant]?.text)}>
                      {company.quadrant}
                    </span>
                  </td>
                  <td className="text-right font-tabular">{formatCurrency(company.revenue * 1_000_000)}</td>
                  <td className="text-right font-tabular">{formatCurrency(company.ebitda * 1_000_000)}</td>
                  <td className="text-right font-tabular font-semibold text-blueally-primary">
                    {formatCurrency(company.adjustedEbitda * 1_000_000)}
                  </td>
                  <td>
                    <span className={cn('ba-badge', trackColors[company.track]?.bg, trackColors[company.track]?.text)}>
                      {company.track}
                    </span>
                  </td>
                  <td className="text-slate-600 dark:text-slate-300">{company.implementationQuarter}</td>
                  <td className="text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedDetail(company)
                      }}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-blueally-primary"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Detail Modal */}
      <AnimatePresence>
        {selectedDetail && (
          <CompanyDetailModal company={selectedDetail} onClose={() => setSelectedDetail(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CompanyDetailModal({ company, onClose }: { company: Company; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blueally-primary to-blueally-secondary flex items-center justify-center text-white text-xl font-bold">
                {company.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-blueally-navy dark:text-white">{company.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn('ba-badge', cohortColors[company.cohort]?.bg, cohortColors[company.cohort]?.text)}>
                    {company.cohort}
                  </span>
                  <span className={cn('ba-badge', quadrantColors[company.quadrant]?.bg, quadrantColors[company.quadrant]?.text)}>
                    {company.quadrant}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-blueally-navy dark:text-white">
                {formatCurrency(company.revenue * 1_000_000)}
              </div>
              <div className="text-sm text-slate-500">Revenue</div>
            </div>
            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="text-2xl font-bold text-blueally-navy dark:text-white">
                {formatCurrency(company.ebitda * 1_000_000)}
              </div>
              <div className="text-sm text-slate-500">EBITDA</div>
            </div>
            <div className="text-center p-4 bg-blueally-50 dark:bg-blueally-900/30 rounded-lg">
              <div className="text-2xl font-bold text-blueally-primary">
                {formatCurrency(company.adjustedEbitda * 1_000_000)}
              </div>
              <div className="text-sm text-blueally-600 dark:text-blueally-400">AI Opportunity</div>
            </div>
          </div>

          {/* Scores */}
          <div>
            <h3 className="text-lg font-semibold text-blueally-navy dark:text-white mb-3">Framework Scores</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Value Score</span>
                  <span className="font-semibold">{company.scores.valueScore.toFixed(2)}</span>
                </div>
                <div className="ba-progress">
                  <div
                    className="ba-progress-bar bg-blueally-primary"
                    style={{ width: `${(company.scores.valueScore / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600 dark:text-slate-300">Readiness Score</span>
                  <span className="font-semibold">{company.scores.readinessScore.toFixed(2)}</span>
                </div>
                <div className="ba-progress">
                  <div
                    className="ba-progress-bar bg-blueally-accent"
                    style={{ width: `${(company.scores.readinessScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Value Components</h4>
              <div className="space-y-2">
                <ScoreRow label="EBITDA Impact" value={company.scores.ebitdaImpact} />
                <ScoreRow label="Revenue Enablement" value={company.scores.revenueEnablement} />
                <ScoreRow label="Risk Reduction" value={company.scores.riskReduction} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Readiness Components</h4>
              <div className="space-y-2">
                <ScoreRow label="Org Capacity" value={company.scores.orgCapacity} />
                <ScoreRow label="Data Readiness" value={company.scores.dataReadiness} />
                <ScoreRow label="Tech Infrastructure" value={company.scores.techInfrastructure} />
                <ScoreRow label="Timeline Fit" value={company.scores.timelineFit} />
              </div>
            </div>
          </div>

          {/* Implementation Details */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-3">Implementation Plan</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Track:</span>
                <span className={cn('ml-2 font-medium', trackColors[company.track]?.text)}>
                  {company.track} - {company.trackDescription}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Timeline:</span>
                <span className="ml-2 font-medium text-blueally-navy dark:text-white">
                  {company.implementationYear}, {company.implementationQuarter}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Platform Classification:</span>
                <span className="ml-2 font-medium text-blueally-navy dark:text-white">
                  {company.platformClassification}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Replication Count:</span>
                <span className="ml-2 font-medium text-blueally-navy dark:text-white">
                  {company.replicationCount} companies
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 ba-progress">
          <div
            className={cn(
              'ba-progress-bar',
              value >= 7 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${(value / 10) * 100}%` }}
          />
        </div>
        <span className="font-semibold text-sm w-6 text-right">{value}</span>
      </div>
    </div>
  )
}
