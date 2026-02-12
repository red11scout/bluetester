'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Map, ChevronRight, CheckCircle2, Clock, Target, DollarSign, Building2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { PORTFOLIO_DATA } from '@/lib/data-loader'

const PHASES = [
  {
    id: 1,
    name: 'Foundation',
    duration: 'Months 1-3',
    objective: 'Launch Champions, establish infrastructure',
    investment: '$175K-$250K',
    outcome: '5 completed assessments, 3+ PoC engagements',
    status: 'current',
    activities: [
      'Finalize partnership agreement at Strategic tier',
      'Deploy AI Readiness Assessments at top 5 Champions',
      'Convert assessments to Proof of Concept engagements',
      'Establish portfolio-wide AI governance framework',
    ],
    companies: ['Scan Global Logistics', 'TricorBraun', 'NES Fircroft', 'Redwood Logistics', 'American Oncology Network'],
  },
  {
    id: 2,
    name: 'Acceleration',
    duration: 'Months 4-9',
    objective: 'Scale proven approaches, activate Quick Wins',
    investment: '$400K-$600K',
    outcome: '$5-10M annualized EBITDA improvement',
    status: 'upcoming',
    activities: [
      'Complete Phase 1 PoCs, initiate Pilots',
      'Assess and activate Quick Win portfolio',
      'Identify first Platform Play opportunity',
      'Portfolio-wide progress review',
    ],
    companies: ['Traeger Pellet Grills', 'Visual Comfort', 'Mark Spain Real Estate', 'EZ Texting', 'Chemical Guys', 'Montway', 'Bespoke Partners'],
  },
  {
    id: 3,
    name: 'Proof',
    duration: 'Months 10-18',
    objective: 'Demonstrate value capture, expand to Strategic quadrant',
    investment: '$800K-$1.2M',
    outcome: '$25-50M annualized EBITDA improvement',
    status: 'future',
    activities: [
      'Production implementations from successful Pilots',
      'Address Strategic quadrant readiness gaps',
      'Deploy Platform Plays across portfolio',
      'Document outcomes for quality of earnings',
    ],
    companies: [],
  },
  {
    id: 4,
    name: 'Exit Preparation',
    duration: 'Months 18-36',
    objective: 'Build AI narrative, prepare for buyer diligence',
    investment: 'Ongoing retainer',
    outcome: 'Premium multiples supported by AI capabilities',
    status: 'future',
    activities: [
      'Continue optimization of deployed solutions',
      'Activate Track 3 Exit Multiplier initiatives',
      'Develop AI capability documentation',
      'Support management presentation development',
    ],
    companies: [],
  },
]

export function RoadmapView() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1)

  const activePhase = PHASES.find(p => p.id === selectedPhase)!

  // Get T1 companies for roadmap
  const t1Companies = PORTFOLIO_DATA.filter(c => c.track === 'T1').slice(0, 10)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-blueally-navy dark:text-white">Implementation Roadmap</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Four-phase value capture strategy aligned to PE hold period
        </p>
      </div>

      {/* Timeline Overview */}
      <div className="ba-card p-6">
        <div className="flex items-center justify-between mb-6">
          {PHASES.map((phase, index) => (
            <div key={phase.id} className="flex items-center">
              <button
                onClick={() => setSelectedPhase(phase.id)}
                className={cn(
                  'flex flex-col items-center cursor-pointer group',
                  selectedPhase === phase.id && 'transform scale-105'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all',
                  phase.status === 'current' && 'bg-blueally-primary text-white ring-4 ring-blueally-200 dark:ring-blueally-800',
                  phase.status === 'upcoming' && 'bg-blueally-100 dark:bg-blueally-900/50 text-blueally-600 dark:text-blueally-400',
                  phase.status === 'future' && 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500',
                  selectedPhase === phase.id && 'ring-2 ring-blueally-primary'
                )}>
                  {phase.status === 'current' ? <Clock className="w-6 h-6" /> : phase.id}
                </div>
                <span className={cn(
                  'text-sm font-medium mt-2',
                  selectedPhase === phase.id ? 'text-blueally-primary' : 'text-slate-600 dark:text-slate-400'
                )}>
                  {phase.name}
                </span>
                <span className="text-xs text-slate-500">{phase.duration}</span>
              </button>
              {index < PHASES.length - 1 && (
                <div className={cn(
                  'w-20 lg:w-32 h-1 mx-2',
                  phase.status === 'current' || (PHASES[index + 1]?.status !== 'future') ? 'bg-blueally-200 dark:bg-blueally-800' : 'bg-slate-200 dark:bg-slate-700'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="ba-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white',
                activePhase.status === 'current' ? 'bg-blueally-primary' : 'bg-slate-500'
              )}>
                {activePhase.id}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-blueally-navy dark:text-white">
                  Phase {activePhase.id}: {activePhase.name}
                </h2>
                <p className="text-sm text-slate-500">{activePhase.duration}</p>
              </div>
              {activePhase.status === 'current' && (
                <span className="ml-auto px-3 py-1 bg-blueally-100 dark:bg-blueally-900/50 text-blueally-700 dark:text-blueally-300 rounded-full text-sm font-medium">
                  Current Phase
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Objective</span>
                  <p className="font-medium text-blueally-navy dark:text-white mt-1">{activePhase.objective}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Investment</span>
                  <p className="font-medium text-blueally-navy dark:text-white mt-1">{activePhase.investment}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Expected Outcome</span>
                  <p className="font-medium text-blueally-primary mt-1">{activePhase.outcome}</p>
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-blueally-navy dark:text-white mb-3">Key Activities</h3>
            <div className="space-y-2">
              {activePhase.activities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                    activePhase.status === 'current' ? 'bg-blueally-100 dark:bg-blueally-900/50 text-blueally-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  )}>
                    {index + 1}
                  </div>
                  <span className="text-slate-700 dark:text-slate-200">{activity}</span>
                </div>
              ))}
            </div>

            {activePhase.companies.length > 0 && (
              <>
                <h3 className="font-semibold text-blueally-navy dark:text-white mt-6 mb-3">Target Companies</h3>
                <div className="flex flex-wrap gap-2">
                  {activePhase.companies.map((company) => (
                    <span key={company} className="px-3 py-1 bg-blueally-50 dark:bg-blueally-900/30 text-blueally-700 dark:text-blueally-300 rounded-full text-sm">
                      {company}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Side Panel - Success Metrics */}
        <div className="space-y-4">
          <div className="ba-card p-5">
            <h3 className="font-semibold text-blueally-navy dark:text-white mb-4">Success Metrics</h3>
            <div className="space-y-4">
              <MetricRow
                label="Champion Activation Rate"
                target="80%+ within Year 1"
                description="Champions with active AI initiatives"
              />
              <MetricRow
                label="EBITDA Improvement"
                target="$25M+ by Month 18"
                description="Documented, annualized run-rate savings"
              />
              <MetricRow
                label="Replication Success"
                target="3+ Platform Plays"
                description="AI solutions active in 5+ companies each"
              />
              <MetricRow
                label="Track 1 Completion"
                target="100% by Year 2"
                description="EBITDA Accelerators at run-rate"
              />
            </div>
          </div>

          <div className="ba-card p-5">
            <h3 className="font-semibold text-blueally-navy dark:text-white mb-4">Company-Level Targets</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Time to First Value</span>
                <span className="font-semibold text-blueally-primary">&lt;6 months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Assessment-to-Production</span>
                <span className="font-semibold text-blueally-primary">&lt;12 months</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Adoption Rate</span>
                <span className="font-semibold text-blueally-primary">70%+</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* T1 Companies Timeline */}
      <div className="ba-card p-6">
        <h3 className="text-lg font-semibold text-blueally-navy dark:text-white mb-4">Track 1 Implementation Schedule</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          EBITDA Accelerators targeted for Year 1 deployment
        </p>

        <div className="overflow-x-auto">
          <table className="ba-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Cohort</th>
                <th className="text-right">EBITDA</th>
                <th className="text-right">AI Opportunity</th>
                <th>Quarter</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {t1Companies.map((company, index) => (
                <tr key={company.name}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blueally-primary to-blueally-secondary flex items-center justify-center text-white text-xs font-bold">
                        {company.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-blueally-navy dark:text-white">{company.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-600 dark:text-slate-300">{company.cohort}</td>
                  <td className="text-right font-tabular">{formatCurrency(company.ebitda * 1_000_000)}</td>
                  <td className="text-right font-tabular font-semibold text-blueally-primary">
                    {formatCurrency(company.adjustedEbitda * 1_000_000)}
                  </td>
                  <td className="font-medium">{company.implementationQuarter}</td>
                  <td>
                    {index < 3 ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                        In Progress
                      </span>
                    ) : index < 6 ? (
                      <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                        Scheduled
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                        Planned
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

function MetricRow({ label, target, description }: { label: string; target: string; description: string }) {
  return (
    <div className="pb-3 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="text-sm font-semibold text-blueally-primary">{target}</span>
      </div>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
  )
}
