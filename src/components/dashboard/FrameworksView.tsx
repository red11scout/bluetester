'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Layers, ChevronRight, Target, Zap, Clock, Building2, RefreshCw, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FrameworksView() {
  const [activeFramework, setActiveFramework] = useState<1 | 2 | 3>(1)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-blueally-navy dark:text-white">The Three Framework Approach</h1>
        <p className="text-slate-500 dark:text-slate-400">
          A cascading decision system designed specifically for private equity AI deployment
        </p>
      </div>

      {/* Framework Navigation */}
      <div className="ba-card p-2 inline-flex gap-1">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => setActiveFramework(num as 1 | 2 | 3)}
            className={cn(
              'px-6 py-3 rounded-lg font-medium transition-all',
              activeFramework === num
                ? 'bg-blueally-primary text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            Framework {num}
          </button>
        ))}
      </div>

      {/* Framework Content */}
      {activeFramework === 1 && <Framework1 />}
      {activeFramework === 2 && <Framework2 />}
      {activeFramework === 3 && <Framework3 />}

      {/* Integration Section */}
      <div className="ba-card p-6">
        <h2 className="text-lg font-semibold text-blueally-navy dark:text-white mb-4">How the Frameworks Work Together</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blueally-primary text-white flex items-center justify-center font-bold">1</div>
              <span className="font-medium text-blueally-navy dark:text-white">Value-Readiness</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Score each initiative by value + readiness. Determines quadrant assignment.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blueally-primary text-white flex items-center justify-center font-bold">2</div>
              <span className="font-medium text-blueally-navy dark:text-white">Amplification</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Multiply priority by portfolio leverage. Identifies Platform Plays.
            </p>
          </div>
        </div>
        <div className="flex justify-center my-4">
          <ChevronRight className="w-6 h-6 text-slate-400 rotate-90" />
        </div>
        <div className="max-w-md mx-auto p-4 bg-blueally-50 dark:bg-blueally-900/30 rounded-lg border-2 border-blueally-200 dark:border-blueally-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blueally-primary text-white flex items-center justify-center font-bold">3</div>
            <span className="font-medium text-blueally-navy dark:text-white">Hold Period Capture</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Sequence against exit timeline. Assigns to Track and Implementation Phase.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Framework1() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div className="ba-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blueally-50 dark:bg-blueally-900/30 flex items-center justify-center">
            <Target className="w-5 h-5 text-blueally-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">Value-Readiness Matrix</h2>
            <p className="text-sm text-slate-500">Framework 1 Overview</p>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-6">
          The matrix plots every AI initiative on two axes. <strong>Value</strong> measures the potential impact—EBITDA contribution,
          revenue enablement, and risk reduction. <strong>Readiness</strong> measures the ability to execute—organizational capacity,
          data quality, technical infrastructure, and timeline alignment.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-blueally-navy dark:text-white mb-2">Value Score Components</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">EBITDA Impact</span>
              <span className="font-semibold">50%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Revenue Enablement</span>
              <span className="font-semibold">25%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Risk Reduction</span>
              <span className="font-semibold">25%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h4 className="font-medium text-blueally-navy dark:text-white mb-2">Readiness Score Components</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Organizational Capacity</span>
              <span className="font-semibold">35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Data Quality</span>
              <span className="font-semibold">35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Technical Infrastructure</span>
              <span className="font-semibold">20%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600 dark:text-slate-300">Timeline Fit</span>
              <span className="font-semibold">10%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ba-card p-6">
        <h3 className="font-semibold text-blueally-navy dark:text-white mb-4">Quadrant Assignments</h3>

        <div className="grid grid-cols-2 gap-4">
          <QuadrantCard
            name="Champions"
            criteria="Value ≥7 AND Readiness ≥7"
            action="Full resources, 90-day implementation target"
            color="bg-quadrant-champion"
          />
          <QuadrantCard
            name="Quick Wins"
            criteria="Value <7 AND Readiness ≥7"
            action="Fast implementation, accumulate learnings"
            color="bg-quadrant-quickwin"
          />
          <QuadrantCard
            name="Strategic"
            criteria="Value ≥7 AND Readiness <7"
            action="Invest in readiness enablers first"
            color="bg-quadrant-strategic"
          />
          <QuadrantCard
            name="Foundations"
            criteria="Value <7 AND Readiness <7"
            action="Revisit after foundation work"
            color="bg-quadrant-foundation"
          />
        </div>

        <div className="mt-6 p-4 bg-blueally-50 dark:bg-blueally-900/30 rounded-lg">
          <h4 className="font-medium text-blueally-navy dark:text-white mb-2">Key Formulas</h4>
          <div className="space-y-2 text-sm font-mono">
            <div className="text-slate-600 dark:text-slate-300">
              <code>Adjusted EBITDA = EBITDA × 0.15 × (Value Score / 7)</code>
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              <code>Priority Score = EBITDA × ((Value × 0.5) + (Readiness × 0.5))</code>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function Framework2() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div className="ba-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blueally-50 dark:bg-blueally-900/30 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 text-blueally-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">Portfolio Amplification Model</h2>
            <p className="text-sm text-slate-500">Framework 2 Overview</p>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-6">
          This framework captures what makes PE AI investment fundamentally different from corporate AI investment.
          When Apollo built contract analysis AI, they analyzed 15,000 contracts across 40+ portfolio companies.
          The development cost was shared. The learning curve was shared. The ROI was portfolio-level.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-blueally-navy dark:text-white mb-2">Replication Potential Scoring</h4>
          <div className="space-y-2 text-sm">
            <ScoreRow score="9-10" definition="Deployable to 10+ companies with minimal customization" />
            <ScoreRow score="7-8" definition="Deployable to 5-10 companies with moderate customization" />
            <ScoreRow score="5-6" definition="Deployable to 2-4 companies with significant customization" />
            <ScoreRow score="1-4" definition="Single company use case" />
          </div>
        </div>

        <div className="p-4 bg-blueally-50 dark:bg-blueally-900/30 rounded-lg">
          <h4 className="font-medium text-blueally-navy dark:text-white mb-2">Portfolio-Adjusted Priority Formula</h4>
          <code className="text-sm text-blueally-700 dark:text-blueally-300">
            Portfolio-Adjusted Priority = (PE-Native Score × EBITDA) × (1 + (Replication Count × 0.1))
          </code>
        </div>
      </div>

      <div className="ba-card p-6">
        <h3 className="font-semibold text-blueally-navy dark:text-white mb-4">Platform Classifications</h3>

        <div className="space-y-4">
          <ClassificationCard
            name="Platform Plays"
            definition="Creates shared infrastructure or capability"
            strategy="Build centrally, deploy to portfolio"
            examples="Data lake architecture, ML model registry, contract intelligence"
            count={20}
          />
          <ClassificationCard
            name="Hybrid"
            definition="Partially replicable with customization"
            strategy="Build core, customize for each company"
            examples="Sales forecasting, demand planning"
            count={19}
          />
          <ClassificationCard
            name="Point Solutions"
            definition="Solves specific problem at specific company"
            strategy="Build locally, share learnings only"
            examples="Custom workflow automation"
            count={15}
          />
        </div>

        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800 dark:text-green-200">Key Insight</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            A solution deployable across 10 companies generates 2× the portfolio-adjusted value of an equivalent single-company solution.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function Framework3() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      <div className="ba-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blueally-50 dark:bg-blueally-900/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-blueally-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">Hold Period Value Capture</h2>
            <p className="text-sm text-slate-500">Framework 3 Overview</p>
          </div>
        </div>

        <p className="text-slate-600 dark:text-slate-300 mb-6">
          PE hold periods are shorter than typical AI transformation timelines. This framework ensures value capture
          before exit through three investment tracks with phase-gates ensuring real value delivery.
        </p>

        <div className="bg-amber-50 dark:bg-amber-900/30 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
          <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2">Critical Constraint</h4>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            No more than 25% of AI investment should go to initiatives without 12-month value visibility.
            This prevents the common failure mode where PE-backed companies launch ambitious AI programs
            that never deliver within the hold period.
          </p>
        </div>
      </div>

      <div className="ba-card p-6">
        <h3 className="font-semibold text-blueally-navy dark:text-white mb-4">The Three Tracks</h3>

        <div className="space-y-4">
          <TrackCard
            track="T1"
            name="EBITDA Accelerators"
            timeline="0-12 months"
            investment="40-50%"
            focus="Customer support automation, procurement optimization, back-office automation"
            exitRelevance="Proven savings in quality of earnings"
            color="bg-track-t1"
            count={18}
          />
          <TrackCard
            track="T2"
            name="Growth Enablers"
            timeline="6-24 months"
            investment="30-40%"
            focus="Sales forecasting, pricing optimization, demand planning"
            exitRelevance="AI-enhanced growth story in management presentation"
            color="bg-track-t2"
            count={31}
          />
          <TrackCard
            track="T3"
            name="Exit Multiplier Plays"
            timeline="12-36 months"
            investment="15-25%"
            focus="AI-enhanced products, proprietary data assets"
            exitRelevance="'AI company' narrative (2-4× multiple premium)"
            color="bg-track-t3"
            count={5}
          />
        </div>
      </div>
    </motion.div>
  )
}

function QuadrantCard({ name, criteria, action, color }: { name: string; criteria: string; action: string; color: string }) {
  return (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className={cn('w-3 h-3 rounded-full', color)} />
        <span className="font-medium text-blueally-navy dark:text-white">{name}</span>
      </div>
      <p className="text-xs text-blueally-600 dark:text-blueally-400 font-mono mb-1">{criteria}</p>
      <p className="text-sm text-slate-600 dark:text-slate-300">{action}</p>
    </div>
  )
}

function ScoreRow({ score, definition }: { score: string; definition: string }) {
  return (
    <div className="flex gap-3">
      <span className="font-semibold text-blueally-primary w-12">{score}</span>
      <span className="text-slate-600 dark:text-slate-300">{definition}</span>
    </div>
  )
}

function ClassificationCard({ name, definition, strategy, examples, count }: {
  name: string
  definition: string
  strategy: string
  examples: string
  count: number
}) {
  return (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-blueally-navy dark:text-white">{name}</span>
        <span className="px-2 py-0.5 bg-blueally-100 dark:bg-blueally-900/50 text-blueally-700 dark:text-blueally-300 rounded text-sm font-semibold">
          {count} companies
        </span>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">{definition}</p>
      <p className="text-xs text-slate-500"><strong>Strategy:</strong> {strategy}</p>
      <p className="text-xs text-slate-500"><strong>Examples:</strong> {examples}</p>
    </div>
  )
}

function TrackCard({ track, name, timeline, investment, focus, exitRelevance, color, count }: {
  track: string
  name: string
  timeline: string
  investment: string
  focus: string
  exitRelevance: string
  color: string
  count: number
}) {
  return (
    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-0.5 rounded text-white text-sm font-bold', color)}>{track}</span>
          <span className="font-medium text-blueally-navy dark:text-white">{name}</span>
        </div>
        <span className="text-sm font-semibold text-blueally-primary">{count} companies</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
        <div><strong>Timeline:</strong> {timeline}</div>
        <div><strong>Investment:</strong> {investment}</div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 mb-1"><strong>Focus:</strong> {focus}</p>
      <p className="text-xs text-blueally-600 dark:text-blueally-400"><strong>Exit Relevance:</strong> {exitRelevance}</p>
    </div>
  )
}
