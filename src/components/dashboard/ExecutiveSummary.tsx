'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  Building2,
  DollarSign,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Wallet,
  BarChart3,
  Info,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useDashboardStore, usePortfolioStats } from '@/lib/store'
import { formatCurrency, formatNumber, quadrantColors, trackColors, cohortColors, cn } from '@/lib/utils'
import { getPortfolioTotals, PORTFOLIO_DATA } from '@/lib/data-loader'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function ExecutiveSummary() {
  const { setActiveTab } = useDashboardStore()
  const totals = getPortfolioTotals()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants}>
        <div className="ba-hero text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blueally-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blueally-accent" />
              <span className="text-sm font-medium text-blueally-100">AI Portfolio Intelligence</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              BlueAlly × AEA Strategic Partnership
            </h1>

            <p className="text-lg text-blueally-100 max-w-2xl mb-6 leading-relaxed">
              The opportunity before you is clear: accelerate AI adoption across 54 portfolio companies
              with a methodology built for private equity timelines and economics. The analysis identifies
              <span className="text-white font-semibold"> {totals.champions} Champions</span> ready for
              immediate deployment and projects
              <span className="text-white font-semibold"> ${formatNumber(totals.totalEbitdaOpportunity)}M</span> in
              annual EBITDA improvement potential.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('usecases')}
                className="ba-btn bg-white text-blueally-primary hover:bg-blueally-50"
              >
                Explore Portfolio
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
              <button
                onClick={() => setActiveTab('workflow')}
                className="ba-btn border-2 border-white/30 text-white hover:bg-white/10"
              >
                View Frameworks
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Building2}
            label="Portfolio Companies"
            value={totals.totalCompanies.toString()}
            subtext="Across 5 cohorts"
            color="blueally"
          />
          <MetricCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(totals.totalRevenue * 1_000_000)}
            subtext="Combined portfolio"
            color="green"
          />
          <MetricCard
            icon={BarChart3}
            label="Total EBITDA"
            value={formatCurrency(totals.totalEbitda * 1_000_000)}
            subtext="Current baseline"
            color="blue"
          />
          <MetricCard
            icon={Target}
            label="AI Opportunity"
            value={formatCurrency(totals.totalEbitdaOpportunity * 1_000_000)}
            subtext="Projected annual impact"
            color="purple"
            highlighted
          />
        </div>
      </motion.div>

      {/* Three Frameworks Preview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <FrameworkCard
            number={1}
            title="Value-Readiness Matrix"
            description="Score each initiative by value potential and organizational readiness. Companies scoring 7+ on both dimensions are Champions."
            stats={[
              { label: 'Champions', value: totals.champions, color: 'text-quadrant-champion' },
              { label: 'Quick Wins', value: totals.quickWins, color: 'text-quadrant-quickwin' },
              { label: 'Strategic', value: 0, color: 'text-quadrant-strategic' },
              { label: 'Foundations', value: totals.foundations, color: 'text-quadrant-foundation' },
            ]}
          />
          <FrameworkCard
            number={2}
            title="Portfolio Amplification"
            description="Capture your structural advantage by deploying AI solutions across multiple companies. High replication potential multiplies returns."
            stats={[
              { label: 'Platform Plays', value: 20, color: 'text-blueally-primary' },
              { label: 'Hybrid', value: 19, color: 'text-blueally-accent' },
              { label: 'Point Solutions', value: 15, color: 'text-slate-500' },
            ]}
          />
          <FrameworkCard
            number={3}
            title="Hold Period Capture"
            description="Sequence investments against your hold period. Track 1 delivers EBITDA before exit. Track 2 shows growth trajectory. Track 3 builds AI narrative."
            stats={[
              { label: 'T1: Accelerators', value: totals.t1Count, color: 'text-track-t1' },
              { label: 'T2: Enablers', value: totals.t2Count, color: 'text-track-t2' },
              { label: 'T3: Multipliers', value: totals.t3Count, color: 'text-track-t3' },
            ]}
          />
        </div>
      </motion.div>

      {/* Quadrant Distribution */}
      <motion.div variants={itemVariants}>
        <div className="ba-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">Portfolio Distribution</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Companies by Value-Readiness quadrant</p>
            </div>
            <button
              onClick={() => setActiveTab('usecases')}
              className="text-sm text-blueally-primary hover:text-blueally-600 font-medium flex items-center gap-1"
            >
              View Details <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <QuadrantCard
              name="Champions"
              count={totals.champions}
              percentage={Math.round((totals.champions / totals.totalCompanies) * 100)}
              description="High value + High readiness"
              color="champion"
              icon={Zap}
            />
            <QuadrantCard
              name="Quick Wins"
              count={totals.quickWins}
              percentage={Math.round((totals.quickWins / totals.totalCompanies) * 100)}
              description="Fast implementation"
              color="quickwin"
              icon={TrendingUp}
            />
            <QuadrantCard
              name="Strategic"
              count={0}
              percentage={0}
              description="Invest in readiness first"
              color="strategic"
              icon={Target}
            />
            <QuadrantCard
              name="Foundations"
              count={totals.foundations}
              percentage={Math.round((totals.foundations / totals.totalCompanies) * 100)}
              description="Build capabilities first"
              color="foundation"
              icon={Shield}
            />
          </div>
        </div>
      </motion.div>

      {/* Top Champions List */}
      <motion.div variants={itemVariants}>
        <div className="ba-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">Top Champions</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Highest priority companies for immediate AI deployment</p>
            </div>
            <button
              onClick={() => setActiveTab('usecases')}
              className="text-sm text-blueally-primary hover:text-blueally-600 font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="ba-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Company</th>
                  <th>Cohort</th>
                  <th>Revenue</th>
                  <th>EBITDA</th>
                  <th>AI Opportunity</th>
                  <th>Track</th>
                  <th>Phase</th>
                </tr>
              </thead>
              <tbody>
                {PORTFOLIO_DATA.filter(c => c.quadrant === 'Champion').slice(0, 5).map((company, index) => (
                  <tr key={company.name} className="cursor-pointer">
                    <td className="font-semibold text-blueally-navy dark:text-white">{index + 1}</td>
                    <td>
                      <div className="font-medium text-blueally-navy dark:text-white">{company.name}</div>
                    </td>
                    <td>
                      <span className={cn('ba-badge', cohortColors[company.cohort]?.bg, cohortColors[company.cohort]?.text)}>
                        {company.cohort}
                      </span>
                    </td>
                    <td className="font-tabular">{formatCurrency(company.revenue * 1_000_000)}</td>
                    <td className="font-tabular">{formatCurrency(company.ebitda * 1_000_000)}</td>
                    <td className="font-tabular font-semibold text-blueally-primary">
                      {formatCurrency(company.adjustedEbitda * 1_000_000)}
                    </td>
                    <td>
                      <span className={cn('ba-badge', trackColors[company.track]?.bg, trackColors[company.track]?.text)}>
                        {company.track}
                      </span>
                    </td>
                    <td className="text-slate-600 dark:text-slate-300">{company.implementationQuarter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* Implementation Timeline Preview */}
      <motion.div variants={itemVariants}>
        <div className="ba-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">Implementation Roadmap</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Four-phase value capture strategy</p>
            </div>
            <button
              onClick={() => setActiveTab('workflow')}
              className="text-sm text-blueally-primary hover:text-blueally-600 font-medium flex items-center gap-1"
            >
              Full Roadmap <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <PhaseCard
              phase={1}
              title="Foundation"
              duration="Months 1-3"
              objective="Launch Champions, establish infrastructure"
              investment="$175K-$250K"
              outcome="5 completed assessments"
              active
            />
            <PhaseCard
              phase={2}
              title="Acceleration"
              duration="Months 4-9"
              objective="Scale proven approaches"
              investment="$400K-$600K"
              outcome="$5-10M annualized impact"
            />
            <PhaseCard
              phase={3}
              title="Proof"
              duration="Months 10-18"
              objective="Demonstrate value capture"
              investment="$800K-$1.2M"
              outcome="$25-50M annualized impact"
            />
            <PhaseCard
              phase={4}
              title="Exit Prep"
              duration="Months 18-36"
              objective="Build AI narrative"
              investment="Ongoing retainer"
              outcome="Premium multiples"
            />
          </div>
        </div>
      </motion.div>

      {/* AI Assistant Prompt */}
      <motion.div variants={itemVariants}>
        <div className="ba-card p-6 border-2 border-dashed border-blueally-200 dark:border-blueally-700 bg-blueally-50/50 dark:bg-blueally-900/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blueally-primary to-blueally-accent flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blueally-navy dark:text-white mb-2">
                AI-Powered Analysis at Your Fingertips
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Ask questions about the portfolio, explore what-if scenarios, or get recommendations.
                The AI Assistant understands all 54 companies, their use cases, and the three frameworks.
              </p>
              <div className="flex flex-wrap gap-2">
                <SuggestedPrompt text="Which companies have the highest replication potential?" />
                <SuggestedPrompt text="Show me Track 1 companies by cohort" />
                <SuggestedPrompt text="What's the total AI opportunity for Healthcare?" />
              </div>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-assistant'))}
                className="mt-4 ba-btn-primary"
              >
                Open AI Assistant
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Sub-components
function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
  highlighted = false,
}: {
  icon: any
  label: string
  value: string
  subtext: string
  color: string
  highlighted?: boolean
}) {
  const colorClasses = {
    blueally: 'bg-blueally-50 dark:bg-blueally-900/30 text-blueally-primary',
    green: 'bg-green-50 dark:bg-green-900/30 text-green-600',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600',
  }

  return (
    <div className={cn('ba-card p-5', highlighted && 'ring-2 ring-blueally-primary')}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colorClasses[color as keyof typeof colorClasses])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-blueally-navy dark:text-white">{value}</div>
      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtext}</div>
    </div>
  )
}

function FrameworkCard({
  number,
  title,
  description,
  stats,
}: {
  number: number
  title: string
  description: string
  stats: { label: string; value: number; color: string }[]
}) {
  return (
    <div className="ba-card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-blueally-primary text-white flex items-center justify-center font-bold text-sm">
          {number}
        </div>
        <h3 className="font-semibold text-blueally-navy dark:text-white">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">{description}</p>
      <div className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">{stat.label}</span>
            <span className={cn('font-semibold', stat.color)}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuadrantCard({
  name,
  count,
  percentage,
  description,
  color,
  icon: Icon,
}: {
  name: string
  count: number
  percentage: number
  description: string
  color: string
  icon: any
}) {
  const colorMap = {
    champion: { bg: 'bg-quadrant-champion', light: 'bg-quadrant-champion/10', text: 'text-quadrant-champion' },
    quickwin: { bg: 'bg-quadrant-quickwin', light: 'bg-quadrant-quickwin/10', text: 'text-quadrant-quickwin' },
    strategic: { bg: 'bg-quadrant-strategic', light: 'bg-quadrant-strategic/10', text: 'text-quadrant-strategic' },
    foundation: { bg: 'bg-quadrant-foundation', light: 'bg-quadrant-foundation/10', text: 'text-quadrant-foundation' },
  }

  const colors = colorMap[color as keyof typeof colorMap]

  return (
    <div className={cn('p-4 rounded-xl', colors.light)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors.bg)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className={cn('text-2xl font-bold', colors.text)}>{count}</span>
      </div>
      <h4 className={cn('font-semibold mb-1', colors.text)}>{name}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-3">
        <div className="ba-progress">
          <div className={cn('ba-progress-bar', colors.bg)} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">{percentage}% of portfolio</span>
      </div>
    </div>
  )
}

function PhaseCard({
  phase,
  title,
  duration,
  objective,
  investment,
  outcome,
  active = false,
}: {
  phase: number
  title: string
  duration: string
  objective: string
  investment: string
  outcome: string
  active?: boolean
}) {
  return (
    <div className={cn(
      'p-4 rounded-xl border-2 transition-all',
      active
        ? 'border-blueally-primary bg-blueally-50 dark:bg-blueally-900/30'
        : 'border-slate-200 dark:border-slate-700 hover:border-blueally-300'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn(
          'w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center',
          active ? 'bg-blueally-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        )}>
          {phase}
        </span>
        <span className="font-semibold text-blueally-navy dark:text-white">{title}</span>
        {active && <span className="text-xs bg-blueally-primary text-white px-2 py-0.5 rounded-full">Current</span>}
      </div>
      <p className="text-xs text-blueally-600 dark:text-blueally-400 mb-2">{duration}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{objective}</p>
      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div>Investment: <span className="font-medium text-blueally-navy dark:text-white">{investment}</span></div>
        <div>Outcome: <span className="font-medium text-blueally-navy dark:text-white">{outcome}</span></div>
      </div>
    </div>
  )
}

function SuggestedPrompt({ text }: { text: string }) {
  const { setActiveTab } = useDashboardStore()

  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-assistant'))}
      className="px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-full text-slate-600 dark:text-slate-300 hover:border-blueally-300 dark:hover:border-blueally-500 hover:text-blueally-600 dark:hover:text-blueally-400 transition-colors"
    >
      "{text}"
    </button>
  )
}
