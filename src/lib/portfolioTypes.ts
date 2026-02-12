/**
 * BlueAlly AEA Portfolio - Type Definitions
 *
 * These types are used by both the server-side data extraction
 * and the browser-side dashboard components.
 */

// Extracted & Transformed Types for Dashboard
export interface ExtractedCompany {
  name: string
  overview: string
  revenue: number | null
  ebitda: number | null
  employees: number
  totalAnnualValue: number
  totalCostBenefit: number
  totalRevenueBenefit: number
  totalRiskBenefit: number
  totalCashFlowBenefit: number
  totalMonthlyTokens: number
  valuePerMillionTokens: number
}

export interface ExtractedStrategicTheme {
  companyName: string
  themeIndex: number
  strategicTheme: string
  currentState: string
  targetState: string
  primaryDriver: string
  secondaryDriver: string
}

export interface ExtractedKPI {
  companyName: string
  function: string
  subFunction: string
  kpiName: string
  baselineValue: string
  targetValue: string
  industryBenchmark: string
  direction: string
  timeframe: string
  measurementMethod: string
  // Aliases for compatibility
  name?: string
  baseline?: string
  target?: string
}

export interface ExtractedFrictionPoint {
  companyName: string
  function: string
  subFunction: string
  severity: string
  frictionPoint: string
  primaryDriverImpact: string
  estimatedAnnualCost: string
  // Aliases for compatibility
  name?: string
  estimatedCost?: string
}

export interface ExtractedUseCase {
  companyName: string
  id: string
  useCaseName: string
  function: string
  subFunction: string
  description: string
  aiPrimitives: string[]
  targetFriction: string
  humanCheckpoint: string
  // Benefits (Step 5)
  costFormula: string
  costBenefit: number
  revenueFormula: string
  revenueBenefit: number
  riskFormula: string
  riskBenefit: number
  cashFlowFormula: string
  cashFlowBenefit: number
  totalAnnualValue: number
  probabilityOfSuccess: number
  // Effort (Step 6)
  runsPerMonth: number
  monthlyTokens: number
  monthlyInputTokens?: number
  monthlyOutputTokens?: number
  inputTokensPerRun: number
  outputTokensPerRun: number
  annualTokenCost: number
  timeToValueMonths: number
  effortScore: number
  dataReadiness: number
  integrationComplexity: number
  changeManagement: number
  // Priority (Step 7)
  priorityTier: string
  priorityScore: number
  valueScore: number
  readinessScore?: number
  ttvScore: number
  effortScorePriority: number
  recommendedPhase: string
  phase?: string
  quadrant?: string
  track?: string
}

export interface PortfolioTotals {
  totalCompanies: number
  totalUseCases: number
  totalAnnualValue: number
  totalCostBenefit: number
  totalRevenueBenefit: number
  totalRiskBenefit: number
  totalCashFlowBenefit: number
  avgValuePerCompany: number
  criticalUseCases: number
  highUseCases: number
  mediumUseCases: number
}

export interface PortfolioData {
  companies: ExtractedCompany[]
  strategicThemes: ExtractedStrategicTheme[]
  kpis: ExtractedKPI[]
  frictionPoints: ExtractedFrictionPoint[]
  useCases: ExtractedUseCase[]
  totals: PortfolioTotals
}
