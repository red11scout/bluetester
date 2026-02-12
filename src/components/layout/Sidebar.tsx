'use client'

import { motion } from 'framer-motion'
import {
  Upload,
  LayoutDashboard,
  GitCompareArrows,
  Lightbulb,
  ClipboardList,
  Sparkles,
} from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems = [
  {
    id: 'landing',
    label: 'Upload',
    icon: Upload,
    description: 'Upload assessment data',
  },
  {
    id: 'overview',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Portfolio overview & metrics',
  },
  {
    id: 'workflow',
    label: 'Workflows',
    icon: GitCompareArrows,
    description: 'AI workflow comparison',
  },
  {
    id: 'usecases',
    label: 'Use Cases',
    icon: Lightbulb,
    description: 'Edit use cases & benefits',
  },
  {
    id: 'assessment',
    label: 'Assessment',
    icon: ClipboardList,
    description: 'Run new assessments',
  },
]

export function Sidebar() {
  const { activeTab, setActiveTab } = useDashboardStore()

  return (
    <>
      {/* Desktop Nav Rail */}
      <nav className="nav-rail hidden md:flex">
        {/* Logo */}
        <div className="mb-6 mt-1">
          <div className="w-10 h-10 bg-gradient-to-br from-blueally-primary to-blueally-accent rounded-xl flex items-center justify-center shadow-glow-blue">
            <span className="text-white font-black text-sm">BA</span>
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  isActive ? 'nav-rail-item-active' : 'nav-rail-item',
                  'group'
                )}
              >
                <Icon size={20} />

                {/* Tooltip */}
                <div className="absolute left-full ml-3 px-3 py-2 bg-deep-600 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-glass-border backdrop-blur-xl">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{item.description}</div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-deep-600" />
                </div>
              </button>
            )
          })}
        </div>

        {/* AI Assistant Button */}
        <div className="mt-auto mb-2">
          <button
            onClick={() => {
              const event = new CustomEvent('toggle-ai-assistant')
              window.dispatchEvent(event)
            }}
            className="nav-rail-item group animate-glow-pulse"
          >
            <Sparkles size={20} />
            <div className="absolute left-full ml-3 px-3 py-2 bg-deep-600 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 border border-glass-border">
              <div className="font-medium">AI Assistant</div>
              <div className="text-xs text-slate-400 mt-0.5">Ask anything about the portfolio</div>
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-deep-800/80 backdrop-blur-2xl border-t border-slate-200 dark:border-glass-border z-40 flex items-center justify-around md:hidden px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all',
                isActive
                  ? 'text-blueally-primary dark:text-blueally-accent'
                  : 'text-slate-400 dark:text-slate-500'
              )}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}
