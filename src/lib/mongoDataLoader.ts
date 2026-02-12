/**
 * MongoDB Data Loader for BlueAlly AEA Portfolio
 *
 * Connects to MongoDB and extracts all 54 assessment documents,
 * transforming them into the PortfolioData structure for Excel generation.
 */

import { MongoClient } from 'mongodb'
import type {
  ExtractedCompany,
  ExtractedStrategicTheme,
  ExtractedKPI,
  ExtractedFrictionPoint,
  ExtractedUseCase,
  PortfolioData,
  PortfolioTotals
} from './portfolioTypes'

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gs18mdg:BULL11scout%3D%3D@drewai.l9vsfb.mongodb.net/?appName=DrewAI'
const DB_NAME = 'PEFirms'
const COLLECTION_NAME = 'AEA'

// ============================================================================
// Type Definitions for Raw MongoDB Documents
// ============================================================================

interface RawAssessment {
  companyName: string
  generatedAt: string
  analysis: {
    steps: RawStep[]
    summary: string
    executiveDashboard: {
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
  }
}

interface RawStep {
  step: number
  title: string
  content: string
  data: any[] | null
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

function extractRevenueFromOverview(overview: string): number | null {
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
      if (overview.toLowerCase().includes('billion') || match[0].includes('B')) {
        value *= 1000
      }
      return value
    }
  }
  return null
}

function extractEbitdaFromOverview(overview: string): number | null {
  const ebitdaPattern = /ebitda\s+of\s+\$?([\d,.]+)\s*[MB]?/i
  const match = overview.match(ebitdaPattern)
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''))
  }
  return null
}

function extractEmployeesFromOverview(overview: string): number {
  const patterns = [
    /(\d{1,3}(?:,\d{3})*)\s+employees/i,
    /employing\s+(?:approximately\s+)?(\d{1,3}(?:,\d{3})*)/i
  ]

  for (const pattern of patterns) {
    const match = overview.match(pattern)
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10)
    }
  }
  return 0
}

// ============================================================================
// Data Extraction Functions
// ============================================================================

function extractStrategicThemes(companyName: string, step: RawStep): ExtractedStrategicTheme[] {
  const themes: ExtractedStrategicTheme[] = []
  if (!step.data) return themes

  step.data.forEach((theme, idx) => {
    themes.push({
      companyName,
      themeIndex: idx + 1,
      strategicTheme: theme.strategicTheme || theme['Strategic Theme'] || '',
      currentState: theme.currentState || theme['Current State'] || '',
      targetState: theme.targetState || theme['Target State'] || '',
      primaryDriver: theme.primaryDriver || theme['Primary Driver'] || '',
      secondaryDriver: theme.secondaryDriver || theme['Secondary Driver'] || ''
    })
  })

  return themes
}

function extractKPIs(companyName: string, step: RawStep): ExtractedKPI[] {
  const kpis: ExtractedKPI[] = []
  if (!step.data) return kpis

  step.data.forEach(kpi => {
    kpis.push({
      companyName,
      function: kpi.Function || kpi.function || '',
      subFunction: kpi['Sub-Function'] || kpi.subFunction || '',
      kpiName: kpi['KPI Name'] || kpi.kpiName || '',
      baselineValue: kpi['Baseline Value'] || kpi.baselineValue || '',
      targetValue: kpi['Target Value'] || kpi.targetValue || '',
      industryBenchmark: kpi['Industry Benchmark'] || kpi.industryBenchmark || '',
      direction: kpi.Direction || kpi.direction || '',
      timeframe: kpi.Timeframe || kpi.timeframe || '',
      measurementMethod: kpi['Measurement Method'] || kpi.measurementMethod || ''
    })
  })

  return kpis
}

function extractFrictionPoints(companyName: string, step: RawStep): ExtractedFrictionPoint[] {
  const frictionPoints: ExtractedFrictionPoint[] = []
  if (!step.data) return frictionPoints

  step.data.forEach(fp => {
    frictionPoints.push({
      companyName,
      function: fp.Function || fp.function || '',
      subFunction: fp['Sub-Function'] || fp.subFunction || '',
      severity: fp.Severity || fp.severity || 'Medium',
      frictionPoint: fp['Friction Point'] || fp.frictionPoint || '',
      primaryDriverImpact: fp['Primary Driver Impact'] || fp.primaryDriverImpact || '',
      estimatedAnnualCost: fp['Estimated Annual Cost'] || fp.estimatedAnnualCost || '$0'
    })
  })

  return frictionPoints
}

function extractUseCases(
  companyName: string,
  step4: RawStep,
  step5: RawStep,
  step6: RawStep,
  step7: RawStep
): ExtractedUseCase[] {
  const useCases: ExtractedUseCase[] = []
  if (!step4.data) return useCases

  // Build lookup maps for steps 5, 6, 7
  const step5Map = new Map<string, any>()
  const step6Map = new Map<string, any>()
  const step7Map = new Map<string, any>()

  if (step5.data) {
    step5.data.forEach(item => {
      const id = item.ID || item.id || item['Use Case ID']
      if (id) step5Map.set(id, item)
    })
  }

  if (step6.data) {
    step6.data.forEach(item => {
      const id = item.ID || item.id || item['Use Case ID']
      if (id) step6Map.set(id, item)
    })
  }

  if (step7.data) {
    step7.data.forEach(item => {
      const id = item.ID || item.id || item['Use Case ID']
      if (id) step7Map.set(id, item)
    })
  }

  step4.data.forEach(uc => {
    const id = uc.ID || uc.id || uc['Use Case ID'] || ''
    const benefit = step5Map.get(id) || {}
    const effort = step6Map.get(id) || {}
    const priority = step7Map.get(id) || {}

    // Parse AI primitives
    let aiPrimitives: string[] = []
    const primitivesRaw = uc['AI Primitives'] || uc.aiPrimitives || ''
    if (typeof primitivesRaw === 'string') {
      aiPrimitives = primitivesRaw.split(',').map((p: string) => p.trim()).filter(Boolean)
    } else if (Array.isArray(primitivesRaw)) {
      aiPrimitives = primitivesRaw
    }

    // Parse benefit values - handle both number and string formats
    const parseBenefitValue = (val: any): number => {
      if (typeof val === 'number') return val * 1000000 // Assume in millions
      if (typeof val === 'string') return parseMoneyString(val)
      return 0
    }

    useCases.push({
      companyName,
      id,
      useCaseName: uc['Use Case Name'] || uc.useCaseName || '',
      function: uc.Function || uc.function || '',
      subFunction: uc['Sub-Function'] || uc.subFunction || '',
      description: uc.Description || uc.description || '',
      aiPrimitives,
      targetFriction: uc['Target Friction Point'] || uc.targetFriction || '',
      humanCheckpoint: uc['Human-in-the-Loop Checkpoint'] || uc.humanCheckpoint || '',

      // Benefits (Step 5) - field names have ($) suffix in MongoDB
      costFormula: benefit['Cost Formula'] || benefit.costFormula || '',
      costBenefit: parseBenefitValue(benefit['Cost Benefit ($)'] || benefit['Cost Benefit'] || benefit.costBenefit),
      revenueFormula: benefit['Revenue Formula'] || benefit.revenueFormula || '',
      revenueBenefit: parseBenefitValue(benefit['Revenue Benefit ($)'] || benefit['Revenue Benefit'] || benefit.revenueBenefit),
      riskFormula: benefit['Risk Formula'] || benefit.riskFormula || '',
      riskBenefit: parseBenefitValue(benefit['Risk Benefit ($)'] || benefit['Risk Benefit'] || benefit.riskBenefit),
      cashFlowFormula: benefit['Cash Flow Formula'] || benefit.cashFlowFormula || '',
      cashFlowBenefit: parseBenefitValue(benefit['Cash Flow Benefit ($)'] || benefit['Cash Flow Benefit'] || benefit.cashFlowBenefit),
      totalAnnualValue: parseBenefitValue(benefit['Total Annual Value ($)'] || benefit['Total Annual Value'] || benefit.totalAnnualValue),
      probabilityOfSuccess: parseFloat(benefit['Probability of Success'] || benefit.probabilityOfSuccess) || 0.75,

      // Effort (Step 6) - handle various field name formats
      runsPerMonth: parseInt(effort['Runs/Month'] || effort.runsPerMonth) || 0,
      monthlyTokens: parseInt(effort['Monthly Tokens'] || effort.monthlyTokens) || 0,
      inputTokensPerRun: parseInt(effort['Input Tokens/Run'] || effort.inputTokensPerRun) || 0,
      outputTokensPerRun: parseInt(effort['Output Tokens/Run'] || effort.outputTokensPerRun) || 0,
      annualTokenCost: parseMoneyString(effort['Annual Token Cost ($)'] || effort['Annual Token Cost'] || ''),
      timeToValueMonths: parseInt(effort['Time-to-Value (months)'] || effort.timeToValueMonths) || 6,
      effortScore: parseInt(effort['Effort Score (1-5)'] || effort['Effort Score'] || effort.effortScore) || 3,
      dataReadiness: parseInt(effort['Data Readiness (1-5)'] || effort['Data Readiness'] || effort.dataReadiness) || 3,
      integrationComplexity: parseInt(effort['Integration Complexity (1-5)'] || effort['Integration Complexity'] || effort.integrationComplexity) || 3,
      changeManagement: parseInt(effort['Change Mgmt (1-5)'] || effort['Change Mgmt'] || effort.changeManagement) || 3,

      // Priority (Step 7) - handle various field name formats with (0-X) suffixes
      priorityTier: priority['Priority Tier'] || priority.priorityTier || 'Medium',
      priorityScore: parseInt(priority['Priority Score (0-100)'] || priority['Priority Score'] || priority.priorityScore) || 50,
      valueScore: parseInt(priority['Value Score (0-40)'] || priority['Value Score'] || priority.valueScore) || 5,
      ttvScore: parseInt(priority['TTV Score (0-30)'] || priority['TTV Score'] || priority.ttvScore) || 5,
      effortScorePriority: parseInt(priority['Effort Score (0-30)'] || priority['Effort Score'] || priority.effortScorePriority) || 5,
      recommendedPhase: priority['Recommended Phase'] || priority.recommendedPhase || 'Q2'
    })
  })

  return useCases
}

// ============================================================================
// Main Loader Function
// ============================================================================

export async function loadFromMongoDB(): Promise<PortfolioData> {
  console.log('Connecting to MongoDB...')
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log('Connected to MongoDB')

    const db = client.db(DB_NAME)
    const collection = db.collection<RawAssessment>(COLLECTION_NAME)

    // Fetch all assessments
    const assessments = await collection.find({}).toArray()
    console.log(`Found ${assessments.length} assessments`)

    const companies: ExtractedCompany[] = []
    const strategicThemes: ExtractedStrategicTheme[] = []
    const kpis: ExtractedKPI[] = []
    const frictionPoints: ExtractedFrictionPoint[] = []
    const useCases: ExtractedUseCase[] = []

    for (const assessment of assessments) {
      const companyName = assessment.companyName
      const steps = assessment.analysis?.steps || []
      const dashboard = assessment.analysis?.executiveDashboard

      // Get steps by number
      const step0 = steps.find(s => s.step === 0)
      const step1 = steps.find(s => s.step === 1)
      const step2 = steps.find(s => s.step === 2)
      const step3 = steps.find(s => s.step === 3)
      const step4 = steps.find(s => s.step === 4)
      const step5 = steps.find(s => s.step === 5)
      const step6 = steps.find(s => s.step === 6)
      const step7 = steps.find(s => s.step === 7)

      // Extract company info from Step 0
      const overview = step0?.content || ''
      const revenue = extractRevenueFromOverview(overview)
      const ebitda = extractEbitdaFromOverview(overview) || (revenue ? revenue * 0.1 : null)
      const employees = extractEmployeesFromOverview(overview)

      // Create company record
      companies.push({
        name: companyName,
        overview: overview.substring(0, 500),
        revenue,
        ebitda,
        employees,
        totalAnnualValue: dashboard?.totalAnnualValue || 0,
        totalCostBenefit: dashboard?.totalCostBenefit || 0,
        totalRevenueBenefit: dashboard?.totalRevenueBenefit || 0,
        totalRiskBenefit: dashboard?.totalRiskBenefit || 0,
        totalCashFlowBenefit: dashboard?.totalCashFlowBenefit || 0,
        totalMonthlyTokens: dashboard?.totalMonthlyTokens || 0,
        valuePerMillionTokens: dashboard?.valuePerMillionTokens || 0
      })

      // Extract Step 1: Strategic Themes
      if (step1) {
        strategicThemes.push(...extractStrategicThemes(companyName, step1))
      }

      // Extract Step 2: KPIs
      if (step2) {
        kpis.push(...extractKPIs(companyName, step2))
      }

      // Extract Step 3: Friction Points
      if (step3) {
        frictionPoints.push(...extractFrictionPoints(companyName, step3))
      }

      // Extract Steps 4-7: Use Cases with Benefits, Effort, Priority
      if (step4 && step5 && step6 && step7) {
        useCases.push(...extractUseCases(companyName, step4, step5, step6, step7))
      }
    }

    // Calculate totals
    const totals: PortfolioTotals = {
      totalCompanies: companies.length,
      totalUseCases: useCases.length,
      totalAnnualValue: useCases.reduce((sum, uc) => sum + uc.totalAnnualValue, 0),
      totalCostBenefit: useCases.reduce((sum, uc) => sum + uc.costBenefit, 0),
      totalRevenueBenefit: useCases.reduce((sum, uc) => sum + uc.revenueBenefit, 0),
      totalRiskBenefit: useCases.reduce((sum, uc) => sum + uc.riskBenefit, 0),
      totalCashFlowBenefit: useCases.reduce((sum, uc) => sum + uc.cashFlowBenefit, 0),
      avgValuePerCompany: useCases.reduce((sum, uc) => sum + uc.totalAnnualValue, 0) / companies.length,
      criticalUseCases: useCases.filter(uc => uc.priorityTier === 'Critical').length,
      highUseCases: useCases.filter(uc => uc.priorityTier === 'High').length,
      mediumUseCases: useCases.filter(uc => uc.priorityTier === 'Medium').length
    }

    console.log(`Extracted ${companies.length} companies, ${useCases.length} use cases`)
    console.log(`Total Annual Value: $${(totals.totalAnnualValue / 1000000).toFixed(1)}M`)

    return {
      companies,
      strategicThemes,
      kpis,
      frictionPoints,
      useCases,
      totals
    }
  } finally {
    await client.close()
    console.log('MongoDB connection closed')
  }
}

// Test function
export async function testMongoConnection(): Promise<boolean> {
  const client = new MongoClient(MONGODB_URI)
  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const collections = await db.listCollections().toArray()
    console.log('Available collections:', collections.map(c => c.name))
    return true
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    return false
  } finally {
    await client.close()
  }
}
