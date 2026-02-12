'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ScatterChart, Scatter, ZAxis, AreaChart, Area,
} from 'recharts'
import { Filter, Download, RefreshCw } from 'lucide-react'
import { useDashboardStore, useFilteredCompanies } from '@/lib/store'
import { PORTFOLIO_DATA, getPortfolioTotals } from '@/lib/data-loader'
import { formatCurrency, formatNumber, quadrantColors, trackColors, cohortColors, cn } from '@/lib/utils'

const CHART_COLORS = {
  champion: '#10B981',
  quickwin: '#3B82F6',
  strategic: '#F59E0B',
  foundation: '#6B7280',
  t1: '#10B981',
  t2: '#3B82F6',
  t3: '#8B5CF6',
  industrial: '#6366F1',
  services: '#EC4899',
  consumer: '#F97316',
  healthcare: '#14B8A6',
  logistics: '#8B5CF6',
}

export function PortfolioOverview() {
  const [chartView, setChartView] = useState<'quadrant' | 'cohort' | 'track' | 'scatter'>('quadrant')
  const companies = useFilteredCompanies()
  const totals = getPortfolioTotals()

  // Prepare chart data
  const quadrantData = useMemo(() => [
    { name: 'Champions', value: companies.filter(c => c.quadrant === 'Champion').length, color: CHART_COLORS.champion },
    { name: 'Quick Wins', value: companies.filter(c => c.quadrant === 'Quick Win').length, color: CHART_COLORS.quickwin },
    { name: 'Strategic', value: companies.filter(c => c.quadrant === 'Strategic').length, color: CHART_COLORS.strategic },
    { name: 'Foundations', value: companies.filter(c => c.quadrant === 'Foundation').length, color: CHART_COLORS.foundation },
  ], [companies])

  const cohortData = useMemo(() => [
    { name: 'Industrial', companies: companies.filter(c => c.cohort === 'Industrial').length, ebitda: companies.filter(c => c.cohort === 'Industrial').reduce((s, c) => s + c.ebitda, 0), opportunity: companies.filter(c => c.cohort === 'Industrial').reduce((s, c) => s + c.adjustedEbitda, 0) },
    { name: 'Services', companies: companies.filter(c => c.cohort === 'Services').length, ebitda: companies.filter(c => c.cohort === 'Services').reduce((s, c) => s + c.ebitda, 0), opportunity: companies.filter(c => c.cohort === 'Services').reduce((s, c) => s + c.adjustedEbitda, 0) },
    { name: 'Consumer', companies: companies.filter(c => c.cohort === 'Consumer').length, ebitda: companies.filter(c => c.cohort === 'Consumer').reduce((s, c) => s + c.ebitda, 0), opportunity: companies.filter(c => c.cohort === 'Consumer').reduce((s, c) => s + c.adjustedEbitda, 0) },
    { name: 'Healthcare', companies: companies.filter(c => c.cohort === 'Healthcare').length, ebitda: companies.filter(c => c.cohort === 'Healthcare').reduce((s, c) => s + c.ebitda, 0), opportunity: companies.filter(c => c.cohort === 'Healthcare').reduce((s, c) => s + c.adjustedEbitda, 0) },
    { name: 'Logistics', companies: companies.filter(c => c.cohort === 'Logistics').length, ebitda: companies.filter(c => c.cohort === 'Logistics').reduce((s, c) => s + c.ebitda, 0), opportunity: companies.filter(c => c.cohort === 'Logistics').reduce((s, c) => s + c.adjustedEbitda, 0) },
  ], [companies])

  const trackData = useMemo(() => [
    { name: 'T1: EBITDA Accelerators', value: companies.filter(c => c.track === 'T1').length, ebitda: companies.filter(c => c.track === 'T1').reduce((s, c) => s + c.adjustedEbitda, 0), color: CHART_COLORS.t1 },
    { name: 'T2: Growth Enablers', value: companies.filter(c => c.track === 'T2').length, ebitda: companies.filter(c => c.track === 'T2').reduce((s, c) => s + c.adjustedEbitda, 0), color: CHART_COLORS.t2 },
    { name: 'T3: Exit Multipliers', value: companies.filter(c => c.track === 'T3').length, ebitda: companies.filter(c => c.track === 'T3').reduce((s, c) => s + c.adjustedEbitda, 0), color: CHART_COLORS.t3 },
  ], [companies])

  const scatterData = useMemo(() =>
    companies.map(c => ({
      name: c.name,
      x: c.scores.valueScore,
      y: c.scores.readinessScore,
      z: c.adjustedEbitda,
      cohort: c.cohort,
      quadrant: c.quadrant,
    })),
  [companies])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blueally-navy dark:text-white">Portfolio Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Visual analysis of {companies.length} companies across the AEA portfolio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="ba-btn-ghost text-sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="ba-btn-outline text-sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Chart View Selector */}
      <div className="ba-card p-2 inline-flex gap-1">
        {(['quadrant', 'cohort', 'track', 'scatter'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setChartView(view)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              chartView === view
                ? 'bg-blueally-primary text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {view === 'quadrant' && 'By Quadrant'}
            {view === 'cohort' && 'By Cohort'}
            {view === 'track' && 'By Track'}
            {view === 'scatter' && 'Value-Readiness Matrix'}
          </button>
        ))}
      </div>

      {/* Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 ba-card p-6">
          <h3 className="text-lg font-semibold text-blueally-navy dark:text-white mb-4">
            {chartView === 'quadrant' && 'Quadrant Distribution'}
            {chartView === 'cohort' && 'Cohort Analysis'}
            {chartView === 'track' && 'Track Distribution'}
            {chartView === 'scatter' && 'Value-Readiness Matrix'}
          </h3>

          <div className="h-[400px]">
            {chartView === 'quadrant' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quadrantData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {quadrantData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {chartView === 'cohort' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cohortData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                            <p className="font-semibold text-blueally-navy dark:text-white">{data.name}</p>
                            <p className="text-sm text-slate-500">Companies: {data.companies}</p>
                            <p className="text-sm text-slate-500">EBITDA: {formatCurrency(data.ebitda * 1_000_000)}</p>
                            <p className="text-sm text-blueally-primary font-medium">Opportunity: {formatCurrency(data.opportunity * 1_000_000)}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="companies" fill={CHART_COLORS.industrial} name="Companies" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {chartView === 'track' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trackData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke={CHART_COLORS.t1} fill={CHART_COLORS.t1} fillOpacity={0.6} name="Companies" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {chartView === 'scatter' && (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis type="number" dataKey="x" name="Value Score" domain={[4, 10]} label={{ value: 'Value Score →', position: 'bottom' }} />
                  <YAxis type="number" dataKey="y" name="Readiness Score" domain={[4, 10]} label={{ value: 'Readiness Score →', angle: -90, position: 'left' }} />
                  <ZAxis type="number" dataKey="z" range={[50, 500]} name="AI Opportunity ($M)" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                            <p className="font-semibold text-blueally-navy dark:text-white">{data.name}</p>
                            <p className="text-sm text-slate-500">Value: {data.x.toFixed(2)}</p>
                            <p className="text-sm text-slate-500">Readiness: {data.y.toFixed(2)}</p>
                            <p className="text-sm text-blueally-primary font-medium">Opportunity: {formatCurrency(data.z * 1_000_000)}</p>
                            <p className="text-sm text-slate-500">Quadrant: {data.quadrant}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  {/* Reference lines at 7 */}
                  <Scatter
                    name="Companies"
                    data={scatterData}
                    fill="#0066CC"
                  >
                    {scatterData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[entry.cohort.toLowerCase() as keyof typeof CHART_COLORS] || '#0066CC'}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>

          {chartView === 'scatter' && (
            <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              <div className="inline-flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS.champion }} />
                  Champions (≥7, ≥7)
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span>Bubble size = AI Opportunity</span>
              </div>
            </div>
          )}
        </div>

        {/* Side Stats */}
        <div className="space-y-4">
          <div className="ba-card p-5">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Portfolio Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Total Companies</span>
                <span className="text-lg font-bold text-blueally-navy dark:text-white">{companies.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Total Revenue</span>
                <span className="text-lg font-bold text-blueally-navy dark:text-white">{formatCurrency(totals.totalRevenue * 1_000_000)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-300">Total EBITDA</span>
                <span className="text-lg font-bold text-blueally-navy dark:text-white">{formatCurrency(totals.totalEbitda * 1_000_000)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700 pt-4">
                <span className="text-sm font-medium text-blueally-primary">AI Opportunity</span>
                <span className="text-xl font-bold text-blueally-primary">{formatCurrency(totals.totalEbitdaOpportunity * 1_000_000)}</span>
              </div>
            </div>
          </div>

          <div className="ba-card p-5">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">By Quadrant</h4>
            <div className="space-y-3">
              {quadrantData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-blueally-navy dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ba-card p-5">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">By Track</h4>
            <div className="space-y-3">
              {trackData.map((item) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item.name.split(':')[0]}</span>
                    <span className="font-semibold text-blueally-navy dark:text-white">{item.value}</span>
                  </div>
                  <div className="ba-progress">
                    <div
                      className="ba-progress-bar"
                      style={{
                        width: `${(item.value / companies.length) * 100}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cohort Breakdown Table */}
      <div className="ba-card p-6">
        <h3 className="text-lg font-semibold text-blueally-navy dark:text-white mb-4">Cohort Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="ba-table">
            <thead>
              <tr>
                <th>Cohort</th>
                <th className="text-center">Companies</th>
                <th className="text-right">Total Revenue</th>
                <th className="text-right">Total EBITDA</th>
                <th className="text-right">AI Opportunity</th>
                <th className="text-center">Champions</th>
                <th className="text-center">T1 Companies</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort) => {
                const cohortCompanies = companies.filter(c => c.cohort === cohort.name)
                const champions = cohortCompanies.filter(c => c.quadrant === 'Champion').length
                const t1 = cohortCompanies.filter(c => c.track === 'T1').length
                const revenue = cohortCompanies.reduce((s, c) => s + c.revenue, 0)

                return (
                  <tr key={cohort.name}>
                    <td>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[cohort.name.toLowerCase() as keyof typeof CHART_COLORS] }}
                        />
                        <span className="font-medium text-blueally-navy dark:text-white">{cohort.name}</span>
                      </div>
                    </td>
                    <td className="text-center font-semibold">{cohort.companies}</td>
                    <td className="text-right font-tabular">{formatCurrency(revenue * 1_000_000)}</td>
                    <td className="text-right font-tabular">{formatCurrency(cohort.ebitda * 1_000_000)}</td>
                    <td className="text-right font-tabular font-semibold text-blueally-primary">
                      {formatCurrency(cohort.opportunity * 1_000_000)}
                    </td>
                    <td className="text-center">
                      <span className="ba-badge-champion">{champions}</span>
                    </td>
                    <td className="text-center">
                      <span className="ba-badge-t1">{t1}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
