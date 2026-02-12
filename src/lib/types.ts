// ============================================================================
// BlueAlly × AEA AI Portfolio Dashboard - Type Definitions
// ============================================================================

// Company Data Types
export interface Company {
  rank: number
  name: string
  cohort: Cohort
  investmentGroup: InvestmentGroup
  revenue: number
  ebitda: number
  scores: CompanyScores
  quadrant: Quadrant
  track: Track
  trackDescription: string
  implementationYear: string
  implementationQuarter: string
  valueTheme: ValueTheme
  platformClassification: PlatformClassification
  replicationPotential: number
  replicationCount: number
  adjustedPriority: number
  adjustedEbitda: number
  peNativeScore: number
  portfolioAdjustedPriority: number
}

export interface CompanyScores {
  ebitdaImpact: number
  revenueEnablement: number
  riskReduction: number
  orgCapacity: number
  dataReadiness: number
  techInfrastructure: number
  timelineFit: number
  valueScore: number
  readinessScore: number
  priorityScore: number
}

// Enums
export type Cohort = 'Industrial' | 'Services' | 'Consumer' | 'Healthcare' | 'Logistics'
export type InvestmentGroup = 'Small Business' | 'Middle Market' | 'Elevate'
export type Quadrant = 'Champion' | 'Quick Win' | 'Strategic' | 'Foundation'
export type Track = 'T1' | 'T2' | 'T3'
export type ValueTheme = 'Revenue Growth' | 'Margin Expansion' | 'Cost Cutting'
export type PlatformClassification = 'Platform' | 'Hybrid' | 'Point'

// Use Case Data Types (from JSON assessments)
export interface UseCase {
  id: string
  companyName: string
  useCaseName: string
  function: string
  subFunction: string
  description: string
  aiPrimitives: string[]
  targetFriction: string
  humanCheckpoint: string
  benefits: UseCaseBenefits
  formulas: UseCaseFormulas
  effort: UseCaseEffort
  priority: UseCasePriority
}

export interface UseCaseBenefits {
  costBenefit: number
  riskBenefit: number
  revenueBenefit: number
  cashFlowBenefit: number
  totalAnnualValue: number
  probabilityOfSuccess: number
}

export interface UseCaseFormulas {
  cost: ParsedFormula
  risk: ParsedFormula
  revenue: ParsedFormula
  cashFlow: ParsedFormula
}

export interface ParsedFormula {
  rawFormula: string
  hasImpact: boolean
  formulaType: string
  components: FormulaComponent[]
  assumptions: FormulaAssumptions
  calculatedValue: number
}

export interface FormulaComponent {
  type: string
  value: number
  context: string
}

export interface FormulaAssumptions {
  laborHours?: number
  hourlyRate?: number
  efficiencyFactor?: number
  adoptionFactor?: number
  confidenceFactor?: number
  reductionRate?: number
  automationRate?: number
  deflectionRate?: number
  recoveryRate?: number
  liftRate?: number
  appointments?: number
  days?: number
  dailyRevenue?: number
  dailyCash?: number
  frictionCost?: number
  reworkCost?: number
  exposure?: number
  wasteAmount?: number
  transactionValue?: number
  [key: string]: number | undefined
}

export interface UseCaseEffort {
  runsPerMonth: number
  monthlyTokens: number
  inputTokensPerRun: number
  outputTokensPerRun: number
  annualTokenCost: number
  timeToValueMonths: number
  effortScore: number
  dataReadiness: number
  integrationComplexity: number
  changeManagement: number
}

export interface UseCasePriority {
  tier: 'Critical' | 'High' | 'Medium'
  priorityScore: number
  valueScore: number
  ttvScore: number
  effortScore: number
  recommendedPhase: string
}

// Friction Points
export interface FrictionPoint {
  companyName: string
  function: string
  subFunction: string
  severity: 'Critical' | 'High' | 'Medium'
  frictionPoint: string
  primaryDriverImpact: string
  estimatedAnnualCost: number
}

// KPIs
export interface KPI {
  companyName: string
  function: string
  subFunction: string
  kpiName: string
  baselineValue: string
  targetValue: string
  industryBenchmark: string
  direction: '↑' | '↓'
  timeframe: string
  measurementMethod: string
}

// Strategic Themes
export interface StrategicTheme {
  companyName: string
  strategicTheme: string
  primaryDriver: string
  secondaryDriver: string
  currentState: string
  targetState: string
}

// Executive Summary
export interface ExecutiveSummary {
  companyName: string
  generatedAt: string
  summary: string
  totalAnnualValue: number
  totalCostBenefit: number
  totalRiskBenefit: number
  totalRevenueBenefit: number
  totalCashFlowBenefit: number
  totalMonthlyTokens: number
  valuePerMillionTokens: number
  topUseCases: TopUseCase[]
  benefitDistribution: BenefitDistribution
}

export interface TopUseCase {
  rank: number
  useCase: string
  annualValue: number
  monthlyTokens: number
  priorityScore: number
}

export interface BenefitDistribution {
  cost: number
  risk: number
  revenue: number
  cashFlow: number
}

// Dashboard Stats
export interface PortfolioStats {
  totalCompanies: number
  totalRevenue: number
  totalEbitda: number
  totalEbitdaOpportunity: number
  quadrantDistribution: QuadrantDistribution
  trackDistribution: TrackDistribution
  cohortDistribution: CohortDistribution
  valueThemeDistribution: ValueThemeDistribution
}

export interface QuadrantDistribution {
  champion: number
  quickWin: number
  strategic: number
  foundation: number
}

export interface TrackDistribution {
  t1: number
  t2: number
  t3: number
}

export interface CohortDistribution {
  industrial: number
  services: number
  consumer: number
  healthcare: number
  logistics: number
}

export interface ValueThemeDistribution {
  revenueGrowth: number
  marginExpansion: number
  costCutting: number
}

// What-If Analysis
export interface WhatIfScenario {
  id: string
  name: string
  description: string
  createdAt: string
  modifiedAssumptions: Partial<FormulaAssumptions>
  results: WhatIfResults
}

export interface WhatIfResults {
  totalOriginalValue: number
  totalNewValue: number
  totalDelta: number
  deltaPercent: number
  byFormulaType: {
    cost: FormulaTypeResult
    risk: FormulaTypeResult
    revenue: FormulaTypeResult
    cashFlow: FormulaTypeResult
  }
  byCompany: Record<string, CompanyWhatIfResult>
}

export interface FormulaTypeResult {
  original: number
  new: number
  delta: number
  count: number
}

export interface CompanyWhatIfResult {
  original: number
  new: number
  delta: number
}

// User Session
export interface UserSession {
  id: string
  createdAt: string
  lastUpdatedAt: string
  scenarios: WhatIfScenario[]
  filters: DashboardFilters
  preferences: UserPreferences
}

export interface DashboardFilters {
  cohort?: Cohort[]
  quadrant?: Quadrant[]
  track?: Track[]
  investmentGroup?: InvestmentGroup[]
  valueTheme?: ValueTheme[]
  minEbitda?: number
  maxEbitda?: number
  minRevenue?: number
  maxRevenue?: number
  searchQuery?: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultView: 'overview' | 'companies' | 'usecases'
  chartType: 'bar' | 'line' | 'area'
  showTooltips: boolean
  compactMode: boolean
}

// AI Chat
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    sources?: string[]
    charts?: ChartConfig[]
    tables?: TableConfig[]
  }
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area'
  data: any[]
  xKey: string
  yKeys: string[]
  title: string
}

export interface TableConfig {
  columns: { key: string; label: string }[]
  data: any[]
  title: string
}

// Report Export
export interface ReportConfig {
  title: string
  subtitle: string
  sections: ReportSection[]
  branding: {
    logo: string
    primaryColor: string
    secondaryColor: string
  }
  generatedAt: string
  generatedBy: string
}

export interface ReportSection {
  id: string
  title: string
  type: 'summary' | 'chart' | 'table' | 'text' | 'metrics'
  content: any
}

// Framework Calculations (for HyperFormula)
export interface FrameworkCalculations {
  valueReadiness: {
    valueScore: (ebitdaImpact: number, revEnable: number, riskReduce: number) => number
    readinessScore: (orgCap: number, dataReady: number, techInfra: number, timeline: number) => number
    adjustedEbitda: (ebitda: number, valueScore: number) => number
    priorityScore: (ebitda: number, valueScore: number, readinessScore: number) => number
  }
  portfolioAmplification: {
    portfolioAdjustedPriority: (adjustedPriority: number, replicationCount: number) => number
  }
  holdPeriod: {
    assignTrack: (peNativeScore: number, timeToValue: number) => Track
  }
}

// Helper type for editable cells
export interface EditableCell {
  value: number | string
  isEditing: boolean
  originalValue: number | string
  formula?: string
  dependents?: string[]
}
