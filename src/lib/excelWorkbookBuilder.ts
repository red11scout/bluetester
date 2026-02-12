/**
 * ExcelJS Workbook Builder for BlueAlly AEA Portfolio
 *
 * Creates a professional Excel workbook with:
 * - Live formulas that recalculate when assumptions change
 * - Named ranges for all editable parameters
 * - Conditional formatting
 * - Sheet protection (Assumptions sheet editable, others locked)
 * - Professional styling and formatting
 */

import ExcelJS from 'exceljs'
import type {
  ExtractedCompany,
  ExtractedStrategicTheme,
  ExtractedKPI,
  ExtractedFrictionPoint,
  ExtractedUseCase,
  PortfolioData
} from './portfolioTypes'

// ============================================================================
// Constants and Styling
// ============================================================================

const COLORS = {
  primary: '0066CC',
  secondary: '003D7A',
  accent: '00A3E0',
  navy: '1E3A5F',
  white: 'FFFFFF',
  lightGray: 'F8FAFC',
  mediumGray: 'E2E8F0',
  darkGray: '64748B',
  green: '10B981',
  lightGreen: 'D1FAE5',
  amber: 'F59E0B',
  lightAmber: 'FEF3C7',
  red: 'EF4444',
  lightRed: 'FEE2E2',
  purple: '8B5CF6',
  blue: '3B82F6'
}

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: COLORS.primary }
}

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: COLORS.white },
  size: 11
}

const ASSUMPTION_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: COLORS.lightGreen }
}

// ============================================================================
// Assumptions Sheet (The Heart of the Calculation Engine)
// ============================================================================

function createAssumptionsSheet(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet('Assumptions', {
    properties: { tabColor: { argb: COLORS.green } }
  })

  // Set column widths
  sheet.columns = [
    { width: 35 },
    { width: 15 },
    { width: 60 }
  ]

  // Title
  sheet.mergeCells('A1:C1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = 'CALCULATION ASSUMPTIONS'
  titleCell.font = { bold: true, size: 16, color: { argb: COLORS.navy } }
  titleCell.alignment = { horizontal: 'center' }

  sheet.getCell('A2').value = 'Modify these values to update all calculations throughout the workbook'
  sheet.getCell('A2').font = { italic: true, color: { argb: COLORS.darkGray } }
  sheet.mergeCells('A2:C2')

  // Headers
  const headerRow = sheet.getRow(4)
  headerRow.values = ['PARAMETER', 'VALUE', 'DESCRIPTION']
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { horizontal: 'center' }
  })

  // Multiplier Factors Section
  let row = 5
  sheet.getCell(`A${row}`).value = 'MULTIPLIER FACTORS'
  sheet.getCell(`A${row}`).font = { bold: true, color: { argb: COLORS.navy } }
  sheet.mergeCells(`A${row}:C${row}`)
  row++

  // Efficiency Factor (B6)
  sheet.getCell(`A${row}`).value = 'Efficiency Factor'
  sheet.getCell(`B${row}`).value = 0.90
  sheet.getCell(`B${row}`).numFmt = '0%'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Implementation achievability (0-100%)'
  row++

  // Adoption Factor (B7)
  sheet.getCell(`A${row}`).value = 'Adoption Factor'
  sheet.getCell(`B${row}`).value = 0.75
  sheet.getCell(`B${row}`).numFmt = '0%'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Level 2 data maturity adjustment (0-100%)'
  row++

  // Confidence Factor (B8)
  sheet.getCell(`A${row}`).value = 'Confidence Factor'
  sheet.getCell(`B${row}`).value = 0.80
  sheet.getCell(`B${row}`).numFmt = '0%'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Risk confidence level (0-100%)'
  row++

  // Revenue Efficiency (B9)
  sheet.getCell(`A${row}`).value = 'Revenue Efficiency'
  sheet.getCell(`B${row}`).value = 0.95
  sheet.getCell(`B${row}`).numFmt = '0%'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Revenue capture efficiency (0-100%)'
  row += 2

  // Labor Rates Section
  sheet.getCell(`A${row}`).value = 'LABOR RATES ($/hour)'
  sheet.getCell(`A${row}`).font = { bold: true, color: { argb: COLORS.navy } }
  sheet.mergeCells(`A${row}:C${row}`)
  row++

  // Executive Rate (B12)
  sheet.getCell(`A${row}`).value = 'Executive Rate'
  sheet.getCell(`B${row}`).value = 395
  sheet.getCell(`B${row}`).numFmt = '$#,##0'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Physician/executive fully-loaded cost'
  row++

  // Manager Rate (B13)
  sheet.getCell(`A${row}`).value = 'Manager Rate'
  sheet.getCell(`B${row}`).value = 150
  sheet.getCell(`B${row}`).numFmt = '$#,##0'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Senior specialist fully-loaded cost'
  row++

  // Specialist Rate (B14)
  sheet.getCell(`A${row}`).value = 'Specialist Rate'
  sheet.getCell(`B${row}`).value = 100
  sheet.getCell(`B${row}`).numFmt = '$#,##0'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Operations staff fully-loaded cost'
  row++

  // Analyst Rate (B15)
  sheet.getCell(`A${row}`).value = 'Analyst Rate'
  sheet.getCell(`B${row}`).value = 85
  sheet.getCell(`B${row}`).numFmt = '$#,##0'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Back-office staff fully-loaded cost'
  row += 2

  // Token Costs Section
  sheet.getCell(`A${row}`).value = 'TOKEN COSTS'
  sheet.getCell(`A${row}`).font = { bold: true, color: { argb: COLORS.navy } }
  sheet.mergeCells(`A${row}:C${row}`)
  row++

  // Input Token Cost (B18)
  sheet.getCell(`A${row}`).value = 'Input Token Cost ($/M)'
  sheet.getCell(`B${row}`).value = 3.00
  sheet.getCell(`B${row}`).numFmt = '$#,##0.00'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Claude API input tokens per million'
  row++

  // Output Token Cost (B19)
  sheet.getCell(`A${row}`).value = 'Output Token Cost ($/M)'
  sheet.getCell(`B${row}`).value = 15.00
  sheet.getCell(`B${row}`).numFmt = '$#,##0.00'
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Claude API output tokens per million'
  row += 2

  // Framework Thresholds Section
  sheet.getCell(`A${row}`).value = 'FRAMEWORK THRESHOLDS'
  sheet.getCell(`A${row}`).font = { bold: true, color: { argb: COLORS.navy } }
  sheet.mergeCells(`A${row}:C${row}`)
  row++

  // Value Threshold (B22)
  sheet.getCell(`A${row}`).value = 'Value Threshold'
  sheet.getCell(`B${row}`).value = 7
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Minimum for Champion/Strategic quadrant (0-10)'
  row++

  // Readiness Threshold (B23)
  sheet.getCell(`A${row}`).value = 'Readiness Threshold'
  sheet.getCell(`B${row}`).value = 3
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Minimum data readiness for Champion/Quick Win (1-5)'
  row++

  // T1 TTV Threshold (B24)
  sheet.getCell(`A${row}`).value = 'T1 TTV Threshold (months)'
  sheet.getCell(`B${row}`).value = 9
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Maximum time-to-value for Track 1 assignment'
  row++

  // T2 TTV Threshold (B25)
  sheet.getCell(`A${row}`).value = 'T2 TTV Threshold (months)'
  sheet.getCell(`B${row}`).value = 18
  sheet.getCell(`B${row}`).fill = ASSUMPTION_FILL
  sheet.getCell(`C${row}`).value = 'Maximum time-to-value for Track 2 assignment'

  // Define Named Ranges
  workbook.definedNames.add('EfficiencyFactor', "'Assumptions'!$B$6")
  workbook.definedNames.add('AdoptionFactor', "'Assumptions'!$B$7")
  workbook.definedNames.add('ConfidenceFactor', "'Assumptions'!$B$8")
  workbook.definedNames.add('RevenueEfficiency', "'Assumptions'!$B$9")
  workbook.definedNames.add('ExecutiveRate', "'Assumptions'!$B$12")
  workbook.definedNames.add('ManagerRate', "'Assumptions'!$B$13")
  workbook.definedNames.add('SpecialistRate', "'Assumptions'!$B$14")
  workbook.definedNames.add('AnalystRate', "'Assumptions'!$B$15")
  workbook.definedNames.add('InputTokenCost', "'Assumptions'!$B$18")
  workbook.definedNames.add('OutputTokenCost', "'Assumptions'!$B$19")
  workbook.definedNames.add('ValueThreshold', "'Assumptions'!$B$22")
  workbook.definedNames.add('ReadinessThreshold', "'Assumptions'!$B$23")
  workbook.definedNames.add('T1Threshold', "'Assumptions'!$B$24")
  workbook.definedNames.add('T2Threshold', "'Assumptions'!$B$25")

  return sheet
}

// ============================================================================
// Executive Dashboard Sheet
// ============================================================================

function createExecutiveDashboardSheet(
  workbook: ExcelJS.Workbook,
  data: PortfolioData
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet('Executive Dashboard', {
    properties: { tabColor: { argb: COLORS.primary } }
  })

  sheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 20 },
    { width: 20 },
    { width: 20 }
  ]

  // Title
  sheet.mergeCells('A1:E1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = 'BlueAlly × AEA AI Portfolio Value Acceleration Dashboard'
  titleCell.font = { bold: true, size: 18, color: { argb: COLORS.primary } }

  sheet.getCell('A2').value = `Generated: ${new Date().toLocaleString()}`
  sheet.getCell('A2').font = { italic: true, color: { argb: COLORS.darkGray } }

  // Portfolio Overview Section
  let row = 4
  sheet.getCell(`A${row}`).value = 'PORTFOLIO OVERVIEW'
  sheet.getCell(`A${row}`).font = { bold: true, size: 14, color: { argb: COLORS.navy } }
  row++

  // KPIs with formulas that reference Use Cases sheet
  sheet.getCell(`A${row}`).value = 'Total Companies'
  sheet.getCell(`B${row}`).value = data.totals.totalCompanies
  row++

  sheet.getCell(`A${row}`).value = 'Total Use Cases'
  sheet.getCell(`B${row}`).value = { formula: "COUNTA('Use Cases'!A:A)-1", result: data.totals.totalUseCases }
  row++

  sheet.getCell(`A${row}`).value = 'Total Annual Value ($M)'
  sheet.getCell(`B${row}`).value = { formula: "SUM('Use Cases'!M:M)", result: data.totals.totalAnnualValue / 1000000 }
  sheet.getCell(`B${row}`).numFmt = '$#,##0.0'
  row++

  sheet.getCell(`A${row}`).value = 'Average Value/Company ($M)'
  sheet.getCell(`B${row}`).value = { formula: `B${row-1}/${data.totals.totalCompanies}`, result: data.totals.avgValuePerCompany / 1000000 }
  sheet.getCell(`B${row}`).numFmt = '$#,##0.0'
  row += 2

  // Benefit Distribution with formulas
  sheet.getCell(`A${row}`).value = 'BENEFIT DISTRIBUTION'
  sheet.getCell(`A${row}`).font = { bold: true, size: 14, color: { argb: COLORS.navy } }
  row++

  sheet.getCell(`A${row}`).value = 'Cost Savings ($M)'
  sheet.getCell(`B${row}`).value = { formula: "SUM('Use Cases'!I:I)", result: data.totals.totalCostBenefit / 1000000 }
  sheet.getCell(`B${row}`).numFmt = '$#,##0.0'
  row++

  sheet.getCell(`A${row}`).value = 'Revenue Growth ($M)'
  sheet.getCell(`B${row}`).value = { formula: "SUM('Use Cases'!J:J)", result: data.totals.totalRevenueBenefit / 1000000 }
  sheet.getCell(`B${row}`).numFmt = '$#,##0.0'
  row++

  sheet.getCell(`A${row}`).value = 'Risk Reduction ($M)'
  sheet.getCell(`B${row}`).value = { formula: "SUM('Use Cases'!K:K)", result: data.totals.totalRiskBenefit / 1000000 }
  sheet.getCell(`B${row}`).numFmt = '$#,##0.0'
  row++

  sheet.getCell(`A${row}`).value = 'Cash Flow Acceleration ($M)'
  sheet.getCell(`B${row}`).value = { formula: "SUM('Use Cases'!L:L)", result: data.totals.totalCashFlowBenefit / 1000000 }
  sheet.getCell(`B${row}`).numFmt = '$#,##0.0'
  row += 2

  // Priority Breakdown
  sheet.getCell(`A${row}`).value = 'PRIORITY BREAKDOWN'
  sheet.getCell(`A${row}`).font = { bold: true, size: 14, color: { argb: COLORS.navy } }
  row++

  sheet.getCell(`A${row}`).value = 'Critical Priority'
  sheet.getCell(`B${row}`).value = { formula: "COUNTIF('Use Cases'!G:G,\"Critical\")", result: data.totals.criticalUseCases }
  row++

  sheet.getCell(`A${row}`).value = 'High Priority'
  sheet.getCell(`B${row}`).value = { formula: "COUNTIF('Use Cases'!G:G,\"High\")", result: data.totals.highUseCases }
  row++

  sheet.getCell(`A${row}`).value = 'Medium Priority'
  sheet.getCell(`B${row}`).value = { formula: "COUNTIF('Use Cases'!G:G,\"Medium\")", result: data.totals.mediumUseCases }
  row += 2

  // Top 10 Use Cases
  sheet.getCell(`A${row}`).value = 'TOP 10 USE CASES BY VALUE'
  sheet.getCell(`A${row}`).font = { bold: true, size: 14, color: { argb: COLORS.navy } }
  row++

  // Headers
  const headerRow = sheet.getRow(row)
  headerRow.values = ['Company', 'Use Case', 'Total Value ($M)', 'Priority', 'Phase']
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
  })
  row++

  // Top 10 use cases
  const topUseCases = [...data.useCases]
    .sort((a, b) => b.totalAnnualValue - a.totalAnnualValue)
    .slice(0, 10)

  topUseCases.forEach(uc => {
    sheet.getCell(`A${row}`).value = uc.companyName
    sheet.getCell(`B${row}`).value = uc.useCaseName
    sheet.getCell(`C${row}`).value = uc.totalAnnualValue / 1000000
    sheet.getCell(`C${row}`).numFmt = '$#,##0.0'
    sheet.getCell(`D${row}`).value = uc.priorityTier
    sheet.getCell(`E${row}`).value = uc.recommendedPhase
    row++
  })

  // Protect sheet
  sheet.protect('blueally', { selectLockedCells: true, selectUnlockedCells: true })

  return sheet
}

// ============================================================================
// Use Cases Sheet (Main Data with Formulas)
// ============================================================================

function createUseCasesSheet(
  workbook: ExcelJS.Workbook,
  data: PortfolioData
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet('Use Cases', {
    properties: { tabColor: { argb: COLORS.accent } }
  })

  // Headers
  const headers = [
    'Company', 'Use Case ID', 'Use Case Name', 'Function', 'Sub-Function',
    'AI Primitives', 'Priority Tier', 'Phase',
    'Cost Benefit ($M)', 'Revenue Benefit ($M)', 'Risk Benefit ($M)', 'Cash Flow Benefit ($M)',
    'Total Value ($M)', 'Probability', 'Time-to-Value', 'Effort Score',
    'Data Readiness', 'Priority Score', 'Value Score',
    'Quadrant', 'Track'
  ]

  // Set column widths
  sheet.columns = headers.map((h, i) => ({
    width: i === 0 ? 25 : i === 2 ? 40 : i === 5 ? 30 : 15
  }))

  // Add header row
  const headerRow = sheet.getRow(1)
  headerRow.values = headers
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
  })
  headerRow.height = 30

  // Add data rows with formulas
  data.useCases.forEach((uc, idx) => {
    const row = idx + 2

    // Static data
    sheet.getCell(`A${row}`).value = uc.companyName
    sheet.getCell(`B${row}`).value = uc.id
    sheet.getCell(`C${row}`).value = uc.useCaseName
    sheet.getCell(`D${row}`).value = uc.function
    sheet.getCell(`E${row}`).value = uc.subFunction
    sheet.getCell(`F${row}`).value = uc.aiPrimitives.join(', ')
    sheet.getCell(`G${row}`).value = uc.priorityTier
    sheet.getCell(`H${row}`).value = uc.recommendedPhase

    // Benefit values (these are the raw extracted values, but we display them with adjustment formulas)
    // In a full implementation, you'd have base values and multiply by assumptions
    // For now, we show the extracted values but reference assumptions for future flexibility
    const costBase = uc.costBenefit / 1000000
    const revBase = uc.revenueBenefit / 1000000
    const riskBase = uc.riskBenefit / 1000000
    const cashBase = uc.cashFlowBenefit / 1000000

    // Cost Benefit with formula referencing assumptions
    sheet.getCell(`I${row}`).value = {
      formula: `${costBase.toFixed(4)}*EfficiencyFactor*AdoptionFactor/(0.9*0.75)`,
      result: costBase
    }
    sheet.getCell(`I${row}`).numFmt = '$#,##0.00'

    // Revenue Benefit
    sheet.getCell(`J${row}`).value = {
      formula: `${revBase.toFixed(4)}*RevenueEfficiency*ConfidenceFactor/(0.95*0.80)`,
      result: revBase
    }
    sheet.getCell(`J${row}`).numFmt = '$#,##0.00'

    // Risk Benefit
    sheet.getCell(`K${row}`).value = {
      formula: `${riskBase.toFixed(4)}*ConfidenceFactor*AdoptionFactor/(0.80*0.75)`,
      result: riskBase
    }
    sheet.getCell(`K${row}`).numFmt = '$#,##0.00'

    // Cash Flow Benefit
    sheet.getCell(`L${row}`).value = {
      formula: `${cashBase.toFixed(4)}*EfficiencyFactor*AdoptionFactor/(0.90*0.75)`,
      result: cashBase
    }
    sheet.getCell(`L${row}`).numFmt = '$#,##0.00'

    // Total Value (sum of benefits)
    sheet.getCell(`M${row}`).value = {
      formula: `I${row}+J${row}+K${row}+L${row}`,
      result: (costBase + revBase + riskBase + cashBase)
    }
    sheet.getCell(`M${row}`).numFmt = '$#,##0.00'

    // Other metrics
    sheet.getCell(`N${row}`).value = uc.probabilityOfSuccess
    sheet.getCell(`N${row}`).numFmt = '0%'
    sheet.getCell(`O${row}`).value = uc.timeToValueMonths
    sheet.getCell(`P${row}`).value = uc.effortScore
    sheet.getCell(`Q${row}`).value = uc.dataReadiness
    sheet.getCell(`R${row}`).value = uc.priorityScore
    sheet.getCell(`S${row}`).value = uc.valueScore

    // Quadrant formula
    sheet.getCell(`T${row}`).value = {
      formula: `IF(AND(S${row}>=ValueThreshold,Q${row}>=ReadinessThreshold),"Champion",IF(AND(S${row}<ValueThreshold,Q${row}>=ReadinessThreshold),"Quick Win",IF(AND(S${row}>=ValueThreshold,Q${row}<ReadinessThreshold),"Strategic","Foundation")))`,
      result: getQuadrant(uc.valueScore, uc.dataReadiness)
    }

    // Track formula
    sheet.getCell(`U${row}`).value = {
      formula: `IF(O${row}<=T1Threshold,"T1",IF(O${row}<=T2Threshold,"T2","T3"))`,
      result: getTrack(uc.timeToValueMonths)
    }
  })

  // Add conditional formatting for Priority Tier
  sheet.addConditionalFormatting({
    ref: `G2:G${data.useCases.length + 1}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"Critical"'],
        priority: 1,
        style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightRed } } }
      },
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"High"'],
        priority: 2,
        style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightAmber } } }
      }
    ]
  })

  // Add conditional formatting for Quadrant
  sheet.addConditionalFormatting({
    ref: `T2:T${data.useCases.length + 1}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"Champion"'],
        priority: 1,
        style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightGreen } } }
      }
    ]
  })

  // Freeze header row
  sheet.views = [{ state: 'frozen', ySplit: 1 }]

  // Auto-filter
  sheet.autoFilter = {
    from: 'A1',
    to: `U${data.useCases.length + 1}`
  }

  // Protect sheet
  sheet.protect('blueally', { selectLockedCells: true, selectUnlockedCells: true, autoFilter: true, sort: true })

  return sheet
}

// ============================================================================
// Company Master Sheet
// ============================================================================

function createCompanyMasterSheet(
  workbook: ExcelJS.Workbook,
  data: PortfolioData
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet('Company Master', {
    properties: { tabColor: { argb: COLORS.navy } }
  })

  const headers = [
    'Rank', 'Company', 'Revenue ($M)', 'EBITDA ($M)', 'Employees',
    'Use Cases', 'Total Value ($M)', 'Cost ($M)', 'Revenue ($M)',
    'Risk ($M)', 'Cash Flow ($M)', 'Critical Count', 'Avg Value Score'
  ]

  sheet.columns = headers.map((h, i) => ({ width: i === 1 ? 30 : 15 }))

  const headerRow = sheet.getRow(1)
  headerRow.values = headers
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
  })

  // Sort companies by total value
  const sortedCompanies = [...data.companies]
    .sort((a, b) => b.totalAnnualValue - a.totalAnnualValue)

  sortedCompanies.forEach((company, idx) => {
    const row = idx + 2
    const companyUseCases = data.useCases.filter(uc => uc.companyName === company.name)
    const criticalCount = companyUseCases.filter(uc => uc.priorityTier === 'Critical').length
    const avgValueScore = companyUseCases.length > 0
      ? companyUseCases.reduce((sum, uc) => sum + uc.valueScore, 0) / companyUseCases.length
      : 0

    sheet.getCell(`A${row}`).value = idx + 1
    sheet.getCell(`B${row}`).value = company.name
    sheet.getCell(`C${row}`).value = company.revenue
    sheet.getCell(`C${row}`).numFmt = '#,##0'
    sheet.getCell(`D${row}`).value = company.ebitda
    sheet.getCell(`D${row}`).numFmt = '#,##0'
    sheet.getCell(`E${row}`).value = company.employees
    sheet.getCell(`F${row}`).value = companyUseCases.length
    sheet.getCell(`G${row}`).value = company.totalAnnualValue / 1000000
    sheet.getCell(`G${row}`).numFmt = '$#,##0.0'
    sheet.getCell(`H${row}`).value = company.totalCostBenefit / 1000000
    sheet.getCell(`H${row}`).numFmt = '$#,##0.0'
    sheet.getCell(`I${row}`).value = company.totalRevenueBenefit / 1000000
    sheet.getCell(`I${row}`).numFmt = '$#,##0.0'
    sheet.getCell(`J${row}`).value = company.totalRiskBenefit / 1000000
    sheet.getCell(`J${row}`).numFmt = '$#,##0.0'
    sheet.getCell(`K${row}`).value = company.totalCashFlowBenefit / 1000000
    sheet.getCell(`K${row}`).numFmt = '$#,##0.0'
    sheet.getCell(`L${row}`).value = criticalCount
    sheet.getCell(`M${row}`).value = avgValueScore
    sheet.getCell(`M${row}`).numFmt = '0.0'
  })

  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  sheet.autoFilter = { from: 'A1', to: `M${data.companies.length + 1}` }
  sheet.protect('blueally', { selectLockedCells: true, autoFilter: true, sort: true })

  return sheet
}

// ============================================================================
// KPI Baselines Sheet
// ============================================================================

function createKPISheet(
  workbook: ExcelJS.Workbook,
  data: PortfolioData
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet('KPI Baselines', {
    properties: { tabColor: { argb: COLORS.blue } }
  })

  const headers = [
    'Company', 'Function', 'Sub-Function', 'KPI Name',
    'Baseline', 'Target', 'Benchmark', 'Direction', 'Timeframe'
  ]

  sheet.columns = headers.map((h, i) => ({
    width: i === 0 ? 25 : i === 3 ? 40 : 15
  }))

  const headerRow = sheet.getRow(1)
  headerRow.values = headers
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
  })

  data.kpis.forEach((kpi, idx) => {
    const row = idx + 2
    sheet.getCell(`A${row}`).value = kpi.companyName
    sheet.getCell(`B${row}`).value = kpi.function
    sheet.getCell(`C${row}`).value = kpi.subFunction
    sheet.getCell(`D${row}`).value = kpi.kpiName
    sheet.getCell(`E${row}`).value = kpi.baselineValue
    sheet.getCell(`F${row}`).value = kpi.targetValue
    sheet.getCell(`G${row}`).value = kpi.industryBenchmark
    sheet.getCell(`H${row}`).value = kpi.direction
    sheet.getCell(`I${row}`).value = kpi.timeframe
  })

  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  sheet.autoFilter = { from: 'A1', to: `I${data.kpis.length + 1}` }
  sheet.protect('blueally', { selectLockedCells: true, autoFilter: true, sort: true })

  return sheet
}

// ============================================================================
// Friction Points Sheet
// ============================================================================

function createFrictionPointsSheet(
  workbook: ExcelJS.Workbook,
  data: PortfolioData
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet('Friction Points', {
    properties: { tabColor: { argb: COLORS.amber } }
  })

  const headers = [
    'Company', 'Function', 'Sub-Function', 'Severity',
    'Friction Point', 'Driver Impact', 'Est. Annual Cost'
  ]

  sheet.columns = [
    { width: 25 }, { width: 18 }, { width: 18 }, { width: 12 },
    { width: 60 }, { width: 20 }, { width: 18 }
  ]

  const headerRow = sheet.getRow(1)
  headerRow.values = headers
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
  })

  // Sort by severity
  const severityOrder: Record<string, number> = { Critical: 0, High: 1, Medium: 2 }
  const sorted = [...data.frictionPoints].sort((a, b) =>
    (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2)
  )

  sorted.forEach((fp, idx) => {
    const row = idx + 2
    sheet.getCell(`A${row}`).value = fp.companyName
    sheet.getCell(`B${row}`).value = fp.function
    sheet.getCell(`C${row}`).value = fp.subFunction
    sheet.getCell(`D${row}`).value = fp.severity
    sheet.getCell(`E${row}`).value = fp.frictionPoint
    sheet.getCell(`F${row}`).value = fp.primaryDriverImpact
    sheet.getCell(`G${row}`).value = fp.estimatedAnnualCost
  })

  // Conditional formatting for severity
  sheet.addConditionalFormatting({
    ref: `D2:D${data.frictionPoints.length + 1}`,
    rules: [
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"Critical"'],
        priority: 1,
        style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightRed } } }
      },
      {
        type: 'cellIs',
        operator: 'equal',
        formulae: ['"High"'],
        priority: 2,
        style: { fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.lightAmber } } }
      }
    ]
  })

  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  sheet.autoFilter = { from: 'A1', to: `G${data.frictionPoints.length + 1}` }
  sheet.protect('blueally', { selectLockedCells: true, autoFilter: true, sort: true })

  return sheet
}

// ============================================================================
// Strategic Themes Sheet
// ============================================================================

function createStrategicThemesSheet(
  workbook: ExcelJS.Workbook,
  data: PortfolioData
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet('Strategic Themes', {
    properties: { tabColor: { argb: COLORS.purple } }
  })

  const headers = [
    'Company', 'Theme #', 'Strategic Theme',
    'Current State', 'Target State', 'Primary Driver', 'Secondary Driver'
  ]

  sheet.columns = [
    { width: 25 }, { width: 10 }, { width: 40 },
    { width: 50 }, { width: 50 }, { width: 15 }, { width: 15 }
  ]

  const headerRow = sheet.getRow(1)
  headerRow.values = headers
  headerRow.eachCell(cell => {
    cell.fill = HEADER_FILL
    cell.font = HEADER_FONT
  })

  data.strategicThemes.forEach((theme, idx) => {
    const row = idx + 2
    sheet.getCell(`A${row}`).value = theme.companyName
    sheet.getCell(`B${row}`).value = theme.themeIndex
    sheet.getCell(`C${row}`).value = theme.strategicTheme
    sheet.getCell(`D${row}`).value = theme.currentState
    sheet.getCell(`E${row}`).value = theme.targetState
    sheet.getCell(`F${row}`).value = theme.primaryDriver
    sheet.getCell(`G${row}`).value = theme.secondaryDriver
  })

  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  sheet.autoFilter = { from: 'A1', to: `G${data.strategicThemes.length + 1}` }
  sheet.protect('blueally', { selectLockedCells: true, autoFilter: true, sort: true })

  return sheet
}

// ============================================================================
// Data Dictionary Sheet
// ============================================================================

function createDataDictionarySheet(workbook: ExcelJS.Workbook): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet('Data Dictionary', {
    properties: { tabColor: { argb: COLORS.darkGray } }
  })

  sheet.columns = [
    { width: 30 },
    { width: 60 },
    { width: 30 }
  ]

  // Title
  sheet.mergeCells('A1:C1')
  sheet.getCell('A1').value = 'DATA DICTIONARY'
  sheet.getCell('A1').font = { bold: true, size: 16, color: { argb: COLORS.navy } }

  const entries = [
    ['', '', ''],
    ['FIELD', 'DESCRIPTION', 'SOURCE'],
    ['', '', ''],
    ['COMPANY FIELDS', '', ''],
    ['Company Name', 'Portfolio company name', 'JSON companyName'],
    ['Revenue ($M)', 'Annual revenue in millions', 'Extracted from Step 0 overview'],
    ['Est. EBITDA ($M)', 'Estimated EBITDA (10% of revenue if not stated)', 'Step 0 or calculated'],
    ['Employees', 'Number of employees', 'Extracted from Step 0'],
    ['', '', ''],
    ['USE CASE FIELDS', '', ''],
    ['Use Case ID', 'Unique identifier (UC-01 through UC-10)', 'Step 4 ID'],
    ['Use Case Name', 'Descriptive title', 'Step 4 Use Case Name'],
    ['Function', 'Business function (Sales, Procurement, etc.)', 'Step 4 Function'],
    ['AI Primitives', 'AI capabilities used', 'Step 4 AI Primitives'],
    ['', '', ''],
    ['BENEFIT FIELDS', '', ''],
    ['Cost Benefit', 'Annual cost savings (adjusted by assumptions)', 'Step 5 × Efficiency × Adoption'],
    ['Revenue Benefit', 'Annual revenue growth (adjusted)', 'Step 5 × RevEfficiency × Confidence'],
    ['Risk Benefit', 'Annual risk reduction (adjusted)', 'Step 5 × Confidence × Adoption'],
    ['Cash Flow Benefit', 'Annual cash flow improvement (adjusted)', 'Step 5 × Efficiency × Adoption'],
    ['Total Value', 'Sum of all benefit types', 'Calculated'],
    ['', '', ''],
    ['FRAMEWORK FIELDS', '', ''],
    ['Quadrant', 'Value-Readiness classification', 'Calculated from thresholds'],
    ['Track', 'Hold Period assignment (T1/T2/T3)', 'Calculated from TTV thresholds'],
    ['', '', ''],
    ['FORMULA REFERENCE', '', ''],
    ['Base Formula', '[Units] × [Rate] × [Efficiency] × [Adoption]', ''],
    ['Quadrant Logic', 'IF(Value≥7 AND Readiness≥3, Champion, ...)', ''],
    ['Track Logic', 'IF(TTV≤9, T1, IF(TTV≤18, T2, T3))', '']
  ]

  entries.forEach((entry, idx) => {
    const row = idx + 1
    sheet.getCell(`A${row}`).value = entry[0]
    sheet.getCell(`B${row}`).value = entry[1]
    sheet.getCell(`C${row}`).value = entry[2]

    if (entry[0].endsWith('FIELDS') || entry[0] === 'FORMULA REFERENCE') {
      sheet.getCell(`A${row}`).font = { bold: true, color: { argb: COLORS.navy } }
    }
    if (entry[0] === 'FIELD') {
      sheet.getRow(row).eachCell(cell => {
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
      })
    }
  })

  sheet.protect('blueally', { selectLockedCells: true })

  return sheet
}

// ============================================================================
// Helper Functions
// ============================================================================

function getQuadrant(valueScore: number, dataReadiness: number): string {
  const valueThreshold = 7
  const readinessThreshold = 3

  if (valueScore >= valueThreshold && dataReadiness >= readinessThreshold) return 'Champion'
  if (valueScore < valueThreshold && dataReadiness >= readinessThreshold) return 'Quick Win'
  if (valueScore >= valueThreshold && dataReadiness < readinessThreshold) return 'Strategic'
  return 'Foundation'
}

function getTrack(timeToValue: number): string {
  if (timeToValue <= 9) return 'T1'
  if (timeToValue <= 18) return 'T2'
  return 'T3'
}

// ============================================================================
// Main Builder Function
// ============================================================================

export async function createExecutiveWorkbook(data: PortfolioData): Promise<ExcelJS.Workbook> {
  console.log('Creating Excel workbook with live formulas...')

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'BlueAlly AI Portfolio Dashboard'
  workbook.created = new Date()
  workbook.modified = new Date()

  // Create sheets in order
  // IMPORTANT: Assumptions sheet must be created first so named ranges are available
  createAssumptionsSheet(workbook)
  createExecutiveDashboardSheet(workbook, data)
  createUseCasesSheet(workbook, data)
  createCompanyMasterSheet(workbook, data)
  createKPISheet(workbook, data)
  createFrictionPointsSheet(workbook, data)
  createStrategicThemesSheet(workbook, data)
  createDataDictionarySheet(workbook)

  console.log('Workbook created with 8 sheets')
  return workbook
}

export async function saveWorkbook(workbook: ExcelJS.Workbook, filePath: string): Promise<void> {
  await workbook.xlsx.writeFile(filePath)
  console.log(`✅ Excel workbook saved: ${filePath}`)
}
