'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Search } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

const VIEW_TITLES: Record<string, string> = {
  landing: 'Welcome',
  overview: 'Dashboard',
  workflow: 'Workflow Studio',
  usecases: 'Use Case Editor',
  assessment: 'Assessment',
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { activeTab, filters, setFilters } = useDashboardStore()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 bg-white/60 dark:bg-deep-900/60 backdrop-blur-2xl border-b border-slate-200/50 dark:border-glass-border-light">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {VIEW_TITLES[activeTab] || 'Dashboard'}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className={`relative transition-all duration-200 ${searchFocused ? 'w-64' : 'w-48'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={filters.searchQuery || ''}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg bg-slate-100 dark:bg-glass-light border border-transparent dark:border-glass-border-light focus:border-blueally-primary dark:focus:border-blueally-accent focus:outline-none transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blueally-primary to-blueally-accent flex items-center justify-center text-white text-xs font-bold">
          BA
        </div>
      </div>
    </header>
  )
}
