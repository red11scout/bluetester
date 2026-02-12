'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Company,
  UseCase,
  DashboardFilters,
  UserPreferences,
  WhatIfScenario,
  FormulaAssumptions,
  Quadrant,
  Track,
  Cohort,
} from './types'

// ============================================================================
// Dashboard Store - Global State Management
// ============================================================================

interface DashboardState {
  // Data
  companies: Company[]
  useCases: UseCase[]
  isLoading: boolean
  error: string | null

  // Filters
  filters: DashboardFilters
  setFilters: (filters: Partial<DashboardFilters>) => void
  clearFilters: () => void

  // Selected items
  selectedCompany: Company | null
  selectedUseCase: UseCase | null
  setSelectedCompany: (company: Company | null) => void
  setSelectedUseCase: (useCase: UseCase | null) => void

  // What-If Analysis
  scenarios: WhatIfScenario[]
  activeScenario: WhatIfScenario | null
  globalAssumptions: FormulaAssumptions
  setGlobalAssumptions: (assumptions: Partial<FormulaAssumptions>) => void
  createScenario: (name: string, description: string) => void
  updateScenario: (id: string, updates: Partial<WhatIfScenario>) => void
  deleteScenario: (id: string) => void
  setActiveScenario: (id: string | null) => void

  // UI State
  sidebarOpen: boolean
  activeTab: string
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: string) => void

  // User Preferences
  preferences: UserPreferences
  setPreferences: (prefs: Partial<UserPreferences>) => void

  // Data Actions
  setCompanies: (companies: Company[]) => void
  setUseCases: (useCases: UseCase[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Default assumptions based on framework research
const DEFAULT_ASSUMPTIONS: FormulaAssumptions = {
  efficiencyFactor: 0.90,
  adoptionFactor: 0.75,
  confidenceFactor: 0.80,
  hourlyRate: 100,
  reductionRate: 0.50,
  automationRate: 0.70,
  deflectionRate: 0.60,
  recoveryRate: 0.25,
  liftRate: 0.03,
}

const DEFAULT_FILTERS: DashboardFilters = {
  cohort: undefined,
  quadrant: undefined,
  track: undefined,
  investmentGroup: undefined,
  valueTheme: undefined,
  minEbitda: undefined,
  maxEbitda: undefined,
  minRevenue: undefined,
  maxRevenue: undefined,
  searchQuery: undefined,
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  defaultView: 'overview',
  chartType: 'bar',
  showTooltips: true,
  compactMode: false,
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      companies: [],
      useCases: [],
      isLoading: false,
      error: null,
      filters: DEFAULT_FILTERS,
      selectedCompany: null,
      selectedUseCase: null,
      scenarios: [],
      activeScenario: null,
      globalAssumptions: DEFAULT_ASSUMPTIONS,
      sidebarOpen: true,
      activeTab: 'overview',
      preferences: DEFAULT_PREFERENCES,

      // Filter actions
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      clearFilters: () =>
        set({ filters: DEFAULT_FILTERS }),

      // Selection actions
      setSelectedCompany: (company) =>
        set({ selectedCompany: company }),

      setSelectedUseCase: (useCase) =>
        set({ selectedUseCase: useCase }),

      // What-If Analysis actions
      setGlobalAssumptions: (assumptions) =>
        set((state) => ({
          globalAssumptions: { ...state.globalAssumptions, ...assumptions },
        })),

      createScenario: (name, description) => {
        const newScenario: WhatIfScenario = {
          id: `scenario-${Date.now()}`,
          name,
          description,
          createdAt: new Date().toISOString(),
          modifiedAssumptions: { ...get().globalAssumptions },
          results: {
            totalOriginalValue: 0,
            totalNewValue: 0,
            totalDelta: 0,
            deltaPercent: 0,
            byFormulaType: {
              cost: { original: 0, new: 0, delta: 0, count: 0 },
              risk: { original: 0, new: 0, delta: 0, count: 0 },
              revenue: { original: 0, new: 0, delta: 0, count: 0 },
              cashFlow: { original: 0, new: 0, delta: 0, count: 0 },
            },
            byCompany: {},
          },
        }
        set((state) => ({
          scenarios: [...state.scenarios, newScenario],
          activeScenario: newScenario,
        }))
      },

      updateScenario: (id, updates) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
          activeScenario:
            state.activeScenario?.id === id
              ? { ...state.activeScenario, ...updates }
              : state.activeScenario,
        })),

      deleteScenario: (id) =>
        set((state) => ({
          scenarios: state.scenarios.filter((s) => s.id !== id),
          activeScenario:
            state.activeScenario?.id === id ? null : state.activeScenario,
        })),

      setActiveScenario: (id) =>
        set((state) => ({
          activeScenario: id
            ? state.scenarios.find((s) => s.id === id) || null
            : null,
        })),

      // UI actions
      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }),

      setActiveTab: (tab) =>
        set({ activeTab: tab }),

      // Preference actions
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      // Data actions
      setCompanies: (companies) =>
        set({ companies }),

      setUseCases: (useCases) =>
        set({ useCases }),

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error }),
    }),
    {
      name: 'blueally-aea-dashboard',
      partialize: (state) => ({
        scenarios: state.scenarios,
        preferences: state.preferences,
        globalAssumptions: state.globalAssumptions,
        filters: state.filters,
      }),
    }
  )
)

// ============================================================================
// Computed Selectors
// ============================================================================

export const useFilteredCompanies = () => {
  const companies = useDashboardStore((state) => state.companies)
  const filters = useDashboardStore((state) => state.filters)

  return companies.filter((company) => {
    // Cohort filter
    if (filters.cohort?.length && !filters.cohort.includes(company.cohort)) {
      return false
    }

    // Quadrant filter
    if (filters.quadrant?.length && !filters.quadrant.includes(company.quadrant)) {
      return false
    }

    // Track filter
    if (filters.track?.length && !filters.track.includes(company.track)) {
      return false
    }

    // Investment group filter
    if (
      filters.investmentGroup?.length &&
      !filters.investmentGroup.includes(company.investmentGroup)
    ) {
      return false
    }

    // Value theme filter
    if (
      filters.valueTheme?.length &&
      !filters.valueTheme.includes(company.valueTheme)
    ) {
      return false
    }

    // EBITDA range
    if (filters.minEbitda && company.ebitda < filters.minEbitda) {
      return false
    }
    if (filters.maxEbitda && company.ebitda > filters.maxEbitda) {
      return false
    }

    // Revenue range
    if (filters.minRevenue && company.revenue < filters.minRevenue) {
      return false
    }
    if (filters.maxRevenue && company.revenue > filters.maxRevenue) {
      return false
    }

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      return (
        company.name.toLowerCase().includes(query) ||
        company.cohort.toLowerCase().includes(query)
      )
    }

    return true
  })
}

export const usePortfolioStats = () => {
  const companies = useDashboardStore((state) => state.companies)

  const stats = {
    totalCompanies: companies.length,
    totalRevenue: companies.reduce((sum, c) => sum + c.revenue, 0),
    totalEbitda: companies.reduce((sum, c) => sum + c.ebitda, 0),
    totalEbitdaOpportunity: companies.reduce((sum, c) => sum + c.adjustedEbitda, 0),
    quadrantDistribution: {
      champion: companies.filter((c) => c.quadrant === 'Champion').length,
      quickWin: companies.filter((c) => c.quadrant === 'Quick Win').length,
      strategic: companies.filter((c) => c.quadrant === 'Strategic').length,
      foundation: companies.filter((c) => c.quadrant === 'Foundation').length,
    },
    trackDistribution: {
      t1: companies.filter((c) => c.track === 'T1').length,
      t2: companies.filter((c) => c.track === 'T2').length,
      t3: companies.filter((c) => c.track === 'T3').length,
    },
    cohortDistribution: {
      industrial: companies.filter((c) => c.cohort === 'Industrial').length,
      services: companies.filter((c) => c.cohort === 'Services').length,
      consumer: companies.filter((c) => c.cohort === 'Consumer').length,
      healthcare: companies.filter((c) => c.cohort === 'Healthcare').length,
      logistics: companies.filter((c) => c.cohort === 'Logistics').length,
    },
    valueThemeDistribution: {
      revenueGrowth: companies.filter((c) => c.valueTheme === 'Revenue Growth').length,
      marginExpansion: companies.filter((c) => c.valueTheme === 'Margin Expansion').length,
      costCutting: companies.filter((c) => c.valueTheme === 'Cost Cutting').length,
    },
  }

  return stats
}

export const useCompanyUseCases = (companyName: string) => {
  const useCases = useDashboardStore((state) => state.useCases)
  return useCases.filter((uc) => uc.companyName === companyName)
}
