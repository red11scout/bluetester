import HyperFormula from 'hyperformula'
import type {
  FormulaAssumptions,
  ParsedFormula,
  WhatIfResults,
  Company,
  UseCase,
  Track,
  Quadrant,
} from './types'

// ============================================================================
// HyperFormula Calculation Engine
// ============================================================================

// Initialize HyperFormula with custom configuration
const hfConfig = {
  licenseKey: 'gpl-v3',
  precisionRounding: 2,
  useColumnIndex: true,
  useStats: false,
}

let hfInstance: HyperFormula | null = null

export function getHyperFormulaInstance(): HyperFormula {
  if (!hfInstance) {
    hfInstance = HyperFormula.buildEmpty(hfConfig)
  }
  return hfInstance
}

// ============================================================================
// Framework 1: Value-Readiness Matrix Calculations
// ============================================================================

/**
 * Calculate Value Score
 * Value Score = (EBITDA_Impact × 0.50) + (Rev_Enable × 0.25) + (Risk_Reduce × 0.25)
 */
export function calculateValueScore(
  ebitdaImpact: number,
  revenueEnablement: number,
  riskReduction: number
): number {
  return ebitdaImpact * 0.5 + revenueEnablement * 0.25 + riskReduction * 0.25
}

/**
 * Calculate Readiness Score
 * Readiness Score = (Org_Cap × 0.35) + (Data_Ready × 0.35) + (Tech_Infra × 0.20) + (Timeline × 0.10)
 */
export function calculateReadinessScore(
  orgCapacity: number,
  dataReadiness: number,
  techInfrastructure: number,
  timelineFit: number
): number {
  return (
    orgCapacity * 0.35 +
    dataReadiness * 0.35 +
    techInfrastructure * 0.20 +
    timelineFit * 0.10
  )
}

/**
 * Calculate Adjusted EBITDA
 * Adjusted EBITDA ($M) = Est_EBITDA × 0.15 × (VALUE_SCORE / 7)
 * Based on Bain 5-25% benchmark, using 15% conservative midpoint
 */
export function calculateAdjustedEbitda(
  ebitda: number,
  valueScore: number
): number {
  return ebitda * 0.15 * (valueScore / 7)
}

/**
 * Calculate Priority Score
 * Priority Score = Est_EBITDA × ((VALUE × 0.5) + (READINESS × 0.5))
 */
export function calculatePriorityScore(
  ebitda: number,
  valueScore: number,
  readinessScore: number
): number {
  return ebitda * ((valueScore * 0.5 + readinessScore * 0.5) / 10)
}

/**
 * Calculate PE-Native Score
 */
export function calculatePeNativeScore(
  valueScore: number,
  readinessScore: number
): number {
  return valueScore * 0.5 + readinessScore * 0.5
}

/**
 * Determine Quadrant Assignment
 */
export function determineQuadrant(
  valueScore: number,
  readinessScore: number
): Quadrant {
  const highValue = valueScore >= 7
  const highReadiness = readinessScore >= 7

  if (highValue && highReadiness) return 'Champion'
  if (!highValue && highReadiness) return 'Quick Win'
  if (highValue && !highReadiness) return 'Strategic'
  return 'Foundation'
}

// ============================================================================
// Framework 2: Portfolio Amplification Calculations
// ============================================================================

/**
 * Calculate Portfolio-Adjusted Priority
 * Portfolio-Adjusted Priority = Adjusted_Priority × (1 + (Replication_Count × 0.1))
 */
export function calculatePortfolioAdjustedPriority(
  adjustedPriority: number,
  replicationCount: number
): number {
  return adjustedPriority * (1 + replicationCount * 0.1)
}

/**
 * Determine Platform Classification based on Replication Potential
 */
export function determinePlatformClassification(
  replicationPotential: number
): 'Platform' | 'Hybrid' | 'Point' {
  if (replicationPotential >= 7) return 'Platform'
  if (replicationPotential >= 5) return 'Hybrid'
  return 'Point'
}

// ============================================================================
// Framework 3: Hold Period Value Capture Calculations
// ============================================================================

/**
 * Determine Track Assignment
 * Track 1: EBITDA Accelerators (0-12 months)
 * Track 2: Growth Enablers (6-24 months)
 * Track 3: Exit Multiplier Plays (12-36 months)
 */
export function determineTrack(
  peNativeScore: number,
  timeToValueMonths: number,
  valueScore: number,
  readinessScore: number
): Track {
  // High readiness + high PE score + fast implementation = T1
  if (readinessScore >= 7 && peNativeScore >= 7 && timeToValueMonths <= 9) {
    return 'T1'
  }

  // High value but needs more time or readiness work = T2
  if (valueScore >= 6 || (peNativeScore >= 6 && timeToValueMonths <= 18)) {
    return 'T2'
  }

  // Long-term strategic plays = T3
  return 'T3'
}

// ============================================================================
// What-If Analysis Calculations
// ============================================================================

/**
 * Recalculate a cost formula with modified assumptions
 */
export function recalculateCostFormula(
  formula: ParsedFormula,
  modifiedAssumptions: Partial<FormulaAssumptions>
): { originalValue: number; newValue: number; delta: number; deltaPercent: number } {
  if (!formula.hasImpact) {
    return { originalValue: 0, newValue: 0, delta: 0, deltaPercent: 0 }
  }

  const assumptions = { ...formula.assumptions, ...modifiedAssumptions }

  // Get key values
  const laborHours = assumptions.laborHours || 0
  const hourlyRate = assumptions.hourlyRate || modifiedAssumptions.hourlyRate || 100
  const efficiencyFactor = assumptions.efficiencyFactor || 0.90
  const adoptionFactor = assumptions.adoptionFactor || 0.75

  // Calculate labor component
  let laborComponent = 0
  if (laborHours > 0 && hourlyRate > 0) {
    const timeSavingsRate =
      assumptions.timeSavingsRate ||
      assumptions.automationRate ||
      assumptions.deflectionRate ||
      0.5
    laborComponent = laborHours * hourlyRate * timeSavingsRate * efficiencyFactor * adoptionFactor
  }

  // Calculate friction cost reduction
  let frictionComponent = 0
  if (assumptions.frictionCost && assumptions.frictionCost > 0) {
    const automationRate = assumptions.automationRate || 0.75
    frictionComponent = assumptions.frictionCost * automationRate * efficiencyFactor * adoptionFactor
  }

  // Calculate waste reduction
  let wasteComponent = 0
  if (assumptions.wasteAmount && assumptions.wasteAmount > 0) {
    const reductionRate = assumptions.reductionRate || 0.60
    wasteComponent = assumptions.wasteAmount * reductionRate * efficiencyFactor * adoptionFactor
  }

  const newValue = laborComponent + frictionComponent + wasteComponent
  const originalValue = formula.calculatedValue || 0

  return {
    originalValue,
    newValue: Math.round(newValue),
    delta: Math.round(newValue - originalValue),
    deltaPercent: originalValue > 0 ? ((newValue - originalValue) / originalValue) * 100 : 0,
  }
}

/**
 * Recalculate a revenue formula with modified assumptions
 */
export function recalculateRevenueFormula(
  formula: ParsedFormula,
  modifiedAssumptions: Partial<FormulaAssumptions>
): { originalValue: number; newValue: number; delta: number; deltaPercent: number } {
  if (!formula.hasImpact) {
    return { originalValue: 0, newValue: 0, delta: 0, deltaPercent: 0 }
  }

  const assumptions = { ...formula.assumptions, ...modifiedAssumptions }

  const appointments = assumptions.appointments || 0
  const liftRate = assumptions.liftRate || 0.03
  const closeRate = 0.68 // Default close rate
  const transactionValue = assumptions.transactionValue || 4800
  const efficiencyFactor = assumptions.efficiencyFactor || 0.95
  const adoptionFactor = assumptions.adoptionFactor || 0.75

  let newValue = 0

  // Revenue from conversion lift
  if (appointments > 0) {
    newValue = appointments * liftRate * closeRate * transactionValue * efficiencyFactor * adoptionFactor
  }

  // Revenue from recovered leads
  if (assumptions.recoveryRate && assumptions.recoveryRate > 0) {
    const nonCloseRate = 1 - closeRate
    newValue += appointments * nonCloseRate * assumptions.recoveryRate * transactionValue * efficiencyFactor * adoptionFactor
  }

  const originalValue = formula.calculatedValue || 0

  return {
    originalValue,
    newValue: Math.round(newValue),
    delta: Math.round(newValue - originalValue),
    deltaPercent: originalValue > 0 ? ((newValue - originalValue) / originalValue) * 100 : 0,
  }
}

/**
 * Recalculate a risk formula with modified assumptions
 */
export function recalculateRiskFormula(
  formula: ParsedFormula,
  modifiedAssumptions: Partial<FormulaAssumptions>
): { originalValue: number; newValue: number; delta: number; deltaPercent: number } {
  if (!formula.hasImpact) {
    return { originalValue: 0, newValue: 0, delta: 0, deltaPercent: 0 }
  }

  const assumptions = { ...formula.assumptions, ...modifiedAssumptions }

  const exposure = assumptions.exposure || assumptions.reworkCost || 0
  const reductionRate = assumptions.reductionRate || 0.50
  const confidenceFactor = assumptions.confidenceFactor || 0.80
  const adoptionFactor = assumptions.adoptionFactor || 0.75

  const newValue = exposure * reductionRate * confidenceFactor * adoptionFactor
  const originalValue = formula.calculatedValue || 0

  return {
    originalValue,
    newValue: Math.round(newValue),
    delta: Math.round(newValue - originalValue),
    deltaPercent: originalValue > 0 ? ((newValue - originalValue) / originalValue) * 100 : 0,
  }
}

/**
 * Recalculate a cash flow formula with modified assumptions
 */
export function recalculateCashFlowFormula(
  formula: ParsedFormula,
  modifiedAssumptions: Partial<FormulaAssumptions>
): { originalValue: number; newValue: number; delta: number; deltaPercent: number } {
  if (!formula.hasImpact) {
    return { originalValue: 0, newValue: 0, delta: 0, deltaPercent: 0 }
  }

  const assumptions = { ...formula.assumptions, ...modifiedAssumptions }

  const days = assumptions.days || 0
  const dailyRevenue = assumptions.dailyRevenue || assumptions.dailyCash || 0
  const efficiencyFactor = assumptions.efficiencyFactor || 0.85
  const adoptionFactor = assumptions.adoptionFactor || 0.75

  const newValue = days * dailyRevenue * efficiencyFactor * adoptionFactor
  const originalValue = formula.calculatedValue || 0

  return {
    originalValue,
    newValue: Math.round(newValue),
    delta: Math.round(newValue - originalValue),
    deltaPercent: originalValue > 0 ? ((newValue - originalValue) / originalValue) * 100 : 0,
  }
}

/**
 * Run a complete What-If scenario across all use cases
 */
export function runWhatIfScenario(
  useCases: UseCase[],
  modifiedAssumptions: Partial<FormulaAssumptions>
): WhatIfResults {
  const results: WhatIfResults = {
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
  }

  for (const uc of useCases) {
    // Cost formula
    if (uc.formulas.cost?.hasImpact) {
      const costResult = recalculateCostFormula(uc.formulas.cost, modifiedAssumptions)
      results.byFormulaType.cost.original += costResult.originalValue
      results.byFormulaType.cost.new += costResult.newValue
      results.byFormulaType.cost.delta += costResult.delta
      results.byFormulaType.cost.count++
    }

    // Risk formula
    if (uc.formulas.risk?.hasImpact) {
      const riskResult = recalculateRiskFormula(uc.formulas.risk, modifiedAssumptions)
      results.byFormulaType.risk.original += riskResult.originalValue
      results.byFormulaType.risk.new += riskResult.newValue
      results.byFormulaType.risk.delta += riskResult.delta
      results.byFormulaType.risk.count++
    }

    // Revenue formula
    if (uc.formulas.revenue?.hasImpact) {
      const revenueResult = recalculateRevenueFormula(uc.formulas.revenue, modifiedAssumptions)
      results.byFormulaType.revenue.original += revenueResult.originalValue
      results.byFormulaType.revenue.new += revenueResult.newValue
      results.byFormulaType.revenue.delta += revenueResult.delta
      results.byFormulaType.revenue.count++
    }

    // Cash flow formula
    if (uc.formulas.cashFlow?.hasImpact) {
      const cashFlowResult = recalculateCashFlowFormula(uc.formulas.cashFlow, modifiedAssumptions)
      results.byFormulaType.cashFlow.original += cashFlowResult.originalValue
      results.byFormulaType.cashFlow.new += cashFlowResult.newValue
      results.byFormulaType.cashFlow.delta += cashFlowResult.delta
      results.byFormulaType.cashFlow.count++
    }

    // By company aggregation
    if (!results.byCompany[uc.companyName]) {
      results.byCompany[uc.companyName] = { original: 0, new: 0, delta: 0 }
    }

    const companyOriginal = uc.benefits.totalAnnualValue
    const companyNew =
      (uc.formulas.cost?.hasImpact ? recalculateCostFormula(uc.formulas.cost, modifiedAssumptions).newValue : 0) +
      (uc.formulas.risk?.hasImpact ? recalculateRiskFormula(uc.formulas.risk, modifiedAssumptions).newValue : 0) +
      (uc.formulas.revenue?.hasImpact ? recalculateRevenueFormula(uc.formulas.revenue, modifiedAssumptions).newValue : 0) +
      (uc.formulas.cashFlow?.hasImpact ? recalculateCashFlowFormula(uc.formulas.cashFlow, modifiedAssumptions).newValue : 0)

    results.byCompany[uc.companyName].original += companyOriginal
    results.byCompany[uc.companyName].new += companyNew
    results.byCompany[uc.companyName].delta += companyNew - companyOriginal
  }

  // Calculate totals
  results.totalOriginalValue =
    results.byFormulaType.cost.original +
    results.byFormulaType.risk.original +
    results.byFormulaType.revenue.original +
    results.byFormulaType.cashFlow.original

  results.totalNewValue =
    results.byFormulaType.cost.new +
    results.byFormulaType.risk.new +
    results.byFormulaType.revenue.new +
    results.byFormulaType.cashFlow.new

  results.totalDelta = results.totalNewValue - results.totalOriginalValue
  results.deltaPercent = results.totalOriginalValue > 0
    ? (results.totalDelta / results.totalOriginalValue) * 100
    : 0

  return results
}

// ============================================================================
// Formatting Utilities
// ============================================================================

export function formatCurrency(value: number, abbreviated = true): string {
  if (abbreviated) {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`
    }
  }
  return `$${value.toLocaleString()}`
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

export function formatNumber(value: number, abbreviated = true): string {
  if (abbreviated) {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(1)}B`
    }
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)}M`
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`
    }
  }
  return value.toLocaleString()
}
