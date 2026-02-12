#!/usr/bin/env ts-node
/**
 * BlueAlly AEA Portfolio - Executive Excel Workbook Generator
 *
 * Generates a world-class executive Excel workbook with:
 * - 8 professionally designed sheets with LIVE FORMULAS
 * - All formulas tied to editable Assumptions sheet
 * - Named ranges for easy formula references
 * - Conditional formatting and sheet protection
 * - All use cases from 54 portfolio companies
 *
 * Uses ExcelJS for proper formula support (not XLSX which only does static values)
 */

import * as path from 'path'
import { loadFromMongoDB } from '../lib/mongoDataLoader'
import { createExecutiveWorkbook } from '../lib/excelWorkbookBuilder'

const OUTPUT_DIR = '/Users/drewgodwin/Desktop/blueally-aea-dashboard'

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('=' .repeat(70))
  console.log('BlueAlly AEA Portfolio - Excel Workbook Generator')
  console.log('Using ExcelJS with LIVE FORMULAS')
  console.log('=' .repeat(70))
  console.log()

  // Step 1: Load data from MongoDB
  console.log('Step 1: Loading data from MongoDB...')
  const data = await loadFromMongoDB()

  console.log(`  - Loaded ${data.totals.totalCompanies} companies`)
  console.log(`  - Loaded ${data.totals.totalUseCases} use cases`)
  console.log(`  - Loaded ${data.kpis.length} KPIs`)
  console.log(`  - Loaded ${data.frictionPoints.length} friction points`)
  console.log(`  - Loaded ${data.strategicThemes.length} strategic themes`)
  console.log(`  - Total Annual Value: $${(data.totals.totalAnnualValue / 1000000).toFixed(1)}M`)
  console.log()

  // Step 2: Create Excel workbook with live formulas
  console.log('Step 2: Creating Excel workbook with LIVE FORMULAS...')
  const workbook = await createExecutiveWorkbook(data)
  console.log()

  // Step 3: Write the file
  const outputPath = path.join(OUTPUT_DIR, 'AEA_Portfolio_AI_Assessment_Master.xlsx')
  console.log(`Step 3: Writing Excel file to: ${outputPath}`)
  await workbook.xlsx.writeFile(outputPath)

  console.log()
  console.log('=' .repeat(70))
  console.log('SUCCESS!')
  console.log('=' .repeat(70))
  console.log()
  console.log(`Excel workbook created: ${outputPath}`)
  console.log()
  console.log('FEATURES:')
  console.log('  - Live formulas that recalculate when you change assumptions')
  console.log('  - Named ranges for all assumption cells')
  console.log('  - Conditional formatting for Priority Tier and Quadrant')
  console.log('  - Sheet protection (Assumptions editable, others locked)')
  console.log()
  console.log('HOW TO TEST LIVE FORMULAS:')
  console.log('  1. Open the Excel file')
  console.log('  2. Go to the "Assumptions" sheet')
  console.log('  3. Change "Efficiency Factor" from 0.90 to 0.80')
  console.log('  4. Watch Cost/Revenue/Risk benefits recalculate on "Use Cases" sheet')
  console.log()
  console.log('SUMMARY:')
  console.log(`  - ${data.totals.totalCompanies} companies`)
  console.log(`  - ${data.totals.totalUseCases} use cases`)
  console.log(`  - ${data.kpis.length} KPIs`)
  console.log(`  - ${data.frictionPoints.length} friction points`)
  console.log(`  - ${data.strategicThemes.length} strategic themes`)
  console.log(`  - Total Annual Value: $${(data.totals.totalAnnualValue / 1000000).toFixed(1)}M`)
}

main().catch(error => {
  console.error('Error generating Excel workbook:', error)
  process.exit(1)
})
