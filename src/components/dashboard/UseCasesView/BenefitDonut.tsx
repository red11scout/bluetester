'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { DollarSign, TrendingUp, Shield, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BenefitDonutProps {
  costBenefit: number
  revenueBenefit: number
  riskBenefit: number
  cashFlowBenefit: number
  size?: 'sm' | 'md' | 'lg'
  showLegend?: boolean
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

const COLORS = {
  cost: '#10B981',      // emerald
  revenue: '#3B82F6',   // blue
  risk: '#8B5CF6',      // purple
  cashFlow: '#F59E0B'   // amber
}

export function BenefitDonut({
  costBenefit,
  revenueBenefit,
  riskBenefit,
  cashFlowBenefit,
  size = 'md',
  showLegend = true
}: BenefitDonutProps) {
  const data = [
    { name: 'Cost Savings', value: costBenefit, color: COLORS.cost, icon: DollarSign },
    { name: 'Revenue Growth', value: revenueBenefit, color: COLORS.revenue, icon: TrendingUp },
    { name: 'Risk Reduction', value: riskBenefit, color: COLORS.risk, icon: Shield },
    { name: 'Cash Flow', value: cashFlowBenefit, color: COLORS.cashFlow, icon: Wallet }
  ].filter(d => d.value > 0)

  const total = costBenefit + revenueBenefit + riskBenefit + cashFlowBenefit

  const sizeConfig = {
    sm: { height: 160, innerRadius: 40, outerRadius: 60 },
    md: { height: 200, innerRadius: 50, outerRadius: 80 },
    lg: { height: 280, innerRadius: 70, outerRadius: 110 }
  }

  const config = sizeConfig[size]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      const percentage = Math.round((item.value / total) * 100)
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-3">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-medium text-slate-900 dark:text-white text-sm">
              {item.name}
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(item.value)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {percentage}% of total
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col items-center">
      <div style={{ height: config.height, width: '100%' }} className="relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={config.innerRadius}
              outerRadius={config.outerRadius}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total
            </div>
            <div className="text-lg font-bold text-blueally-navy dark:text-white">
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>

      {showLegend && (
        <div className="grid grid-cols-2 gap-2 mt-4 w-full">
          {data.map((item, index) => {
            const Icon = item.icon
            const percentage = Math.round((item.value / total) * 100)
            return (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(item.value)} ({percentage}%)
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Simple horizontal bar variant
interface BenefitBarProps {
  costBenefit: number
  revenueBenefit: number
  riskBenefit: number
  cashFlowBenefit: number
}

export function BenefitBar({
  costBenefit,
  revenueBenefit,
  riskBenefit,
  cashFlowBenefit
}: BenefitBarProps) {
  const total = costBenefit + revenueBenefit + riskBenefit + cashFlowBenefit

  const segments = [
    { value: costBenefit, color: COLORS.cost, label: 'Cost' },
    { value: revenueBenefit, color: COLORS.revenue, label: 'Revenue' },
    { value: riskBenefit, color: COLORS.risk, label: 'Risk' },
    { value: cashFlowBenefit, color: COLORS.cashFlow, label: 'Cash' }
  ].filter(s => s.value > 0)

  return (
    <div className="space-y-2">
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
        {segments.map((segment, index) => {
          const width = (segment.value / total) * 100
          return (
            <div
              key={index}
              className="h-full transition-all duration-500"
              style={{
                width: `${width}%`,
                backgroundColor: segment.color
              }}
              title={`${segment.label}: ${formatCurrency(segment.value)}`}
            />
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span>{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
