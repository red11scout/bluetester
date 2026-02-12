/**
 * BlueAlly AEA Portfolio - Use Case Data Loader
 *
 * Extracts and transforms data from 54 JSON assessment files into
 * structured data for the dashboard and Excel export.
 */

import fs from 'fs'
import path from 'path'

// ============================================================================
// Type Definitions
// ============================================================================

export interface RawAssessment {
  companyName: string
  generatedAt: string
  analysis: {
    steps: RawStep[]
    summary: string
    executiveDashboard: RawExecutiveDashboard
  }
}

export interface RawStep {
  step: number
  title: string
  content: string
  data: any[] | null
}

export interface RawExecutiveDashboard {
  topUseCases: Array<{
    rank: number
    useCase: string
    annualValue: number
    monthlyTokens: number
    priorityScore: number
  }>
  totalAnnualValue: number
  totalCostBenefit: number
  totalRiskBenefit: number
  totalMonthlyTokens: number
  totalRevenueBenefit: number
  totalCashFlowBenefit: number
  valuePerMillionTokens: number
}

// Extracted & Transformed Types
export interface ExtractedCompany {
  name: string
  overview: string
  revenue: number
  ebitda: number
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
}

export interface ExtractedFrictionPoint {
  companyName: string
  function: string
  subFunction: string
  severity: string
  frictionPoint: string
  primaryDriverImpact: string
  estimatedAnnualCost: string
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
  ttvScore: number
  effortScorePriority: number
  recommendedPhase: string
}

export interface PortfolioData {
  companies: ExtractedCompany[]
  strategicThemes: ExtractedStrategicTheme[]
  kpis: ExtractedKPI[]
  frictionPoints: ExtractedFrictionPoint[]
  useCases: ExtractedUseCase[]
  totals: {
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
}

// ============================================================================
// Parsing Utilities
// ============================================================================

function parseMoneyString(str: string): number {
  if (!str || str === '$0' || str.toLowerCase().includes('no ')) return 0
  const cleaned = str.replace(/[$,]/g, '').replace(/M$/i, '000000').replace(/K$/i, '000')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

function extractRevenueFromOverview(overview: string): number {
  // Look for patterns like "$950M", "generates $X in annual revenue"
  const patterns = [
    /generates?\s+\$?([\d,.]+)\s*[MB]?(?:illion)?\s+(?:in\s+)?(?:annual\s+)?revenue/i,
    /\$?([\d,.]+)\s*[MB]?(?:illion)?\s+(?:in\s+)?(?:annual\s+)?revenue/i,
    /revenue\s+of\s+\$?([\d,.]+)\s*[MB]?/i,
    /\$?([\d,.]+)\s*M\s+(?:in\s+)?(?:annual\s+)?revenue/i
  ]

  for (const pattern of patterns) {
    const match = overview.match(pattern)
    if (match) {
      let value = parseFloat(match[1].replace(/,/g, ''))
      // Check for million/billion indicators
      if (overview.toLowerCase().includes('billion') || match[0].includes('B')) {
        value *= 1000
      }
      return value
    }
  }
  return 0
}

function extractEbitdaFromOverview(overview: string): number {
  // Try to extract EBITDA or estimate from revenue (typically 10-15% for mid-market)
  const ebitdaPattern = /ebitda\s+of\s+\$?([\d,.]+)\s*[MB]?/i
  const match = overview.match(ebitdaPattern)
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''))
  }
  // Estimate at 10% of revenue if not explicitly stated
  const revenue = extractRevenueFromOverview(overview)
  return revenue * 0.10
}

function extractEmployeesFromOverview(overview: string): number {
  const patterns = [
    /([\d,]+)\s+employees/i,
    /workforce\s+of\s+([\d,]+)/i,
    /staff\s+of\s+([\d,]+)/i
  ]

  for (const pattern of patterns) {
    const match = overview.match(pattern)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10)
    }
  }
  return 0
}

function getStepData<T>(assessment: RawAssessment, stepNumber: number): T[] {
  const step = assessment.analysis.steps.find(s => s.step === stepNumber)
  return (step?.data as T[]) || []
}

// ============================================================================
// Main Extraction Functions
// ============================================================================

export function extractCompanyData(assessment: RawAssessment): ExtractedCompany {
  const overview = assessment.analysis.steps.find(s => s.step === 0)?.content || ''
  const dashboard = assessment.analysis.executiveDashboard

  return {
    name: assessment.companyName,
    overview: overview.substring(0, 500), // Truncate for display
    revenue: extractRevenueFromOverview(overview),
    ebitda: extractEbitdaFromOverview(overview),
    employees: extractEmployeesFromOverview(overview),
    totalAnnualValue: dashboard.totalAnnualValue,
    totalCostBenefit: dashboard.totalCostBenefit,
    totalRevenueBenefit: dashboard.totalRevenueBenefit,
    totalRiskBenefit: dashboard.totalRiskBenefit,
    totalCashFlowBenefit: dashboard.totalCashFlowBenefit,
    totalMonthlyTokens: dashboard.totalMonthlyTokens,
    valuePerMillionTokens: dashboard.valuePerMillionTokens
  }
}

export function extractStrategicThemes(assessment: RawAssessment): ExtractedStrategicTheme[] {
  const themes = getStepData<any>(assessment, 1)
  return themes.map((theme, index) => ({
    companyName: assessment.companyName,
    themeIndex: index + 1,
    strategicTheme: theme['Strategic Theme'] || '',
    currentState: theme['Current State'] || '',
    targetState: theme['Target State'] || '',
    primaryDriver: theme['Primary Driver'] || '',
    secondaryDriver: theme['Secondary Driver'] || ''
  }))
}

export function extractKPIs(assessment: RawAssessment): ExtractedKPI[] {
  const kpis = getStepData<any>(assessment, 2)
  return kpis.map(kpi => ({
    companyName: assessment.companyName,
    function: kpi['Function'] || '',
    subFunction: kpi['Sub-Function'] || '',
    kpiName: kpi['KPI Name'] || '',
    baselineValue: kpi['Baseline Value'] || '',
    targetValue: kpi['Target Value'] || '',
    industryBenchmark: kpi['Industry Benchmark'] || '',
    direction: kpi['Direction'] || '',
    timeframe: kpi['Timeframe'] || '',
    measurementMethod: kpi['Measurement Method'] || ''
  }))
}

export function extractFrictionPoints(assessment: RawAssessment): ExtractedFrictionPoint[] {
  const frictions = getStepData<any>(assessment, 3)
  return frictions.map(fp => ({
    companyName: assessment.companyName,
    function: fp['Function'] || '',
    subFunction: fp['Sub-Function'] || '',
    severity: fp['Severity'] || '',
    frictionPoint: fp['Friction Point'] || '',
    primaryDriverImpact: fp['Primary Driver Impact'] || '',
    estimatedAnnualCost: fp['Estimated Annual Cost ($)'] || '$0'
  }))
}

export function extractUseCases(assessment: RawAssessment): ExtractedUseCase[] {
  const step4 = getStepData<any>(assessment, 4) // Use Cases
  const step5 = getStepData<any>(assessment, 5) // Benefits
  const step6 = getStepData<any>(assessment, 6) // Effort
  const step7 = getStepData<any>(assessment, 7) // Priority

  return step4.map(uc => {
    const id = uc['ID']
    const benefits = step5.find((b: any) => b['ID'] === id) || {}
    const effort = step6.find((e: any) => e['ID'] === id) || {}
    const priority = step7.find((p: any) => p['ID'] === id) || {}

    return {
      companyName: assessment.companyName,
      id: id,
      useCaseName: uc['Use Case Name'] || '',
      function: uc['Function'] || '',
      subFunction: uc['Sub-Function'] || '',
      description: uc['Description'] || '',
      aiPrimitives: (uc['AI Primitives'] || '').split(',').map((p: string) => p.trim()),
      targetFriction: uc['Target Friction'] || '',
      humanCheckpoint: uc['Human-in-the-Loop Checkpoint'] || '',
      // Benefits
      costFormula: benefits['Cost Formula'] || 'No cost impact',
      costBenefit: parseMoneyString(benefits['Cost Benefit ($)'] || '0'),
      revenueFormula: benefits['Revenue Formula'] || 'No direct revenue impact',
      revenueBenefit: parseMoneyString(benefits['Revenue Benefit ($)'] || '0'),
      riskFormula: benefits['Risk Formula'] || 'No risk impact',
      riskBenefit: parseMoneyString(benefits['Risk Benefit ($)'] || '0'),
      cashFlowFormula: benefits['Cash Flow Formula'] || 'No cash flow impact',
      cashFlowBenefit: parseMoneyString(benefits['Cash Flow Benefit ($)'] || '0'),
      totalAnnualValue: parseMoneyString(benefits['Total Annual Value ($)'] || '0'),
      probabilityOfSuccess: benefits['Probability of Success'] || 0,
      // Effort
      runsPerMonth: effort['Runs/Month'] || 0,
      monthlyTokens: effort['Monthly Tokens'] || 0,
      inputTokensPerRun: effort['Input Tokens/Run'] || 0,
      outputTokensPerRun: effort['Output Tokens/Run'] || 0,
      annualTokenCost: parseMoneyString(effort['Annual Token Cost ($)'] || '0'),
      timeToValueMonths: effort['Time-to-Value (months)'] || 0,
      effortScore: effort['Effort Score (1-5)'] || 0,
      dataReadiness: effort['Data Readiness (1-5)'] || 0,
      integrationComplexity: effort['Integration Complexity (1-5)'] || 0,
      changeManagement: effort['Change Mgmt (1-5)'] || 0,
      // Priority
      priorityTier: priority['Priority Tier'] || 'Medium',
      priorityScore: priority['Priority Score (0-100)'] || 0,
      valueScore: priority['Value Score (0-40)'] || 0,
      ttvScore: priority['TTV Score (0-30)'] || 0,
      effortScorePriority: priority['Effort Score (0-30)'] || 0,
      recommendedPhase: priority['Recommended Phase'] || 'Q4'
    }
  })
}

// ============================================================================
// Main Load Function
// ============================================================================

export async function loadAllAssessments(assessmentsDir: string): Promise<PortfolioData> {
  const files = fs.readdirSync(assessmentsDir)
    .filter(f => f.startsWith('BlueAlly_AI_Assessment_') && f.endsWith('.json'))
    .sort()

  const companies: ExtractedCompany[] = []
  const strategicThemes: ExtractedStrategicTheme[] = []
  const kpis: ExtractedKPI[] = []
  const frictionPoints: ExtractedFrictionPoint[] = []
  const useCases: ExtractedUseCase[] = []

  for (const file of files) {
    const filePath = path.join(assessmentsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    const assessment: RawAssessment = JSON.parse(content)

    companies.push(extractCompanyData(assessment))
    strategicThemes.push(...extractStrategicThemes(assessment))
    kpis.push(...extractKPIs(assessment))
    frictionPoints.push(...extractFrictionPoints(assessment))
    useCases.push(...extractUseCases(assessment))
  }

  // Calculate totals
  const totalAnnualValue = useCases.reduce((sum, uc) => sum + uc.totalAnnualValue, 0)
  const totalCostBenefit = useCases.reduce((sum, uc) => sum + uc.costBenefit, 0)
  const totalRevenueBenefit = useCases.reduce((sum, uc) => sum + uc.revenueBenefit, 0)
  const totalRiskBenefit = useCases.reduce((sum, uc) => sum + uc.riskBenefit, 0)
  const totalCashFlowBenefit = useCases.reduce((sum, uc) => sum + uc.cashFlowBenefit, 0)

  return {
    companies,
    strategicThemes,
    kpis,
    frictionPoints,
    useCases,
    totals: {
      totalCompanies: companies.length,
      totalUseCases: useCases.length,
      totalAnnualValue,
      totalCostBenefit,
      totalRevenueBenefit,
      totalRiskBenefit,
      totalCashFlowBenefit,
      avgValuePerCompany: totalAnnualValue / companies.length,
      criticalUseCases: useCases.filter(uc => uc.priorityTier === 'Critical').length,
      highUseCases: useCases.filter(uc => uc.priorityTier === 'High').length,
      mediumUseCases: useCases.filter(uc => uc.priorityTier === 'Medium').length
    }
  }
}

// ============================================================================
// Static Data Export (for client-side use)
// ============================================================================

export function generateStaticDataFile(data: PortfolioData, outputPath: string): void {
  const output = `// Auto-generated portfolio data - DO NOT EDIT
// Generated at: ${new Date().toISOString()}

import type { ExtractedCompany, ExtractedStrategicTheme, ExtractedKPI, ExtractedFrictionPoint, ExtractedUseCase } from './useCaseLoader'

export const COMPANIES: ExtractedCompany[] = ${JSON.stringify(data.companies, null, 2)}

export const STRATEGIC_THEMES: ExtractedStrategicTheme[] = ${JSON.stringify(data.strategicThemes, null, 2)}

export const KPIS: ExtractedKPI[] = ${JSON.stringify(data.kpis, null, 2)}

export const FRICTION_POINTS: ExtractedFrictionPoint[] = ${JSON.stringify(data.frictionPoints, null, 2)}

export const USE_CASES: ExtractedUseCase[] = ${JSON.stringify(data.useCases, null, 2)}

export const PORTFOLIO_TOTALS = ${JSON.stringify(data.totals, null, 2)}
`

  fs.writeFileSync(outputPath, output, 'utf-8')
}
