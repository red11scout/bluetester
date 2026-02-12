import { utils, writeFile } from 'xlsx'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { Company, WhatIfScenario } from './types'

// BlueAlly brand colors for exports
const BRAND = {
  primary: '#0066CC',
  secondary: '#003D7A',
  accent: '#00A3E0',
  navy: '#1E3A5F',
  light: '#F8FAFC'
}

// Export portfolio data to Excel
export async function exportToExcel(
  companies: Company[],
  filename: string = 'BlueAlly_AEA_Portfolio_Analysis'
) {
  const workbook = utils.book_new()

  // Sheet 1: Executive Summary
  const summaryData = [
    ['BlueAlly × AEA AI Portfolio Value Acceleration Dashboard'],
    ['Generated:', new Date().toLocaleString()],
    [''],
    ['Portfolio Overview'],
    ['Total Companies', companies.length],
    ['Total Revenue', `$${(companies.reduce((sum, c) => sum + c.revenue, 0) / 1000).toFixed(1)}B`],
    ['Total EBITDA', `$${companies.reduce((sum, c) => sum + c.ebitda, 0).toFixed(0)}M`],
    ['Total AI Opportunity', `$${companies.reduce((sum, c) => sum + c.adjustedEbitda, 0).toFixed(0)}M`],
    [''],
    ['Quadrant Distribution'],
    ['Champions', companies.filter(c => c.quadrant === 'Champion').length],
    ['Quick Wins', companies.filter(c => c.quadrant === 'Quick Win').length],
    ['Strategic', companies.filter(c => c.quadrant === 'Strategic').length],
    ['Foundations', companies.filter(c => c.quadrant === 'Foundation').length],
    [''],
    ['Track Distribution'],
    ['T1 - EBITDA Accelerators', companies.filter(c => c.track === 'T1').length],
    ['T2 - Growth Enablers', companies.filter(c => c.track === 'T2').length],
    ['T3 - Exit Multipliers', companies.filter(c => c.track === 'T3').length],
  ]
  const summarySheet = utils.aoa_to_sheet(summaryData)
  utils.book_append_sheet(workbook, summarySheet, 'Executive Summary')

  // Sheet 2: Company Details
  const companyHeaders = [
    'Company',
    'Cohort',
    'Investment Group',
    'Revenue ($M)',
    'EBITDA ($M)',
    'Value Score',
    'Readiness Score',
    'Quadrant',
    'Track',
    'Platform Classification',
    'Adjusted EBITDA ($M)',
    'Implementation Quarter'
  ]
  const companyData = companies.map(c => [
    c.name,
    c.cohort,
    c.investmentGroup,
    c.revenue,
    c.ebitda,
    c.scores.valueScore.toFixed(2),
    c.scores.readinessScore.toFixed(2),
    c.quadrant,
    c.track,
    c.platformClassification,
    c.adjustedEbitda.toFixed(2),
    c.implementationQuarter
  ])
  const companySheet = utils.aoa_to_sheet([companyHeaders, ...companyData])
  utils.book_append_sheet(workbook, companySheet, 'Company Details')

  // Sheet 3: Cohort Analysis
  const cohorts = ['Industrial', 'Services', 'Consumer', 'Healthcare', 'Logistics']
  const cohortData = cohorts.map(cohort => {
    const cohortCompanies = companies.filter(c => c.cohort === cohort)
    return [
      cohort,
      cohortCompanies.length,
      `$${(cohortCompanies.reduce((sum, c) => sum + c.revenue, 0)).toFixed(0)}M`,
      `$${cohortCompanies.reduce((sum, c) => sum + c.ebitda, 0).toFixed(0)}M`,
      `$${cohortCompanies.reduce((sum, c) => sum + c.adjustedEbitda, 0).toFixed(0)}M`,
      (cohortCompanies.reduce((sum, c) => sum + c.scores.valueScore, 0) / cohortCompanies.length || 0).toFixed(2),
      (cohortCompanies.reduce((sum, c) => sum + c.scores.readinessScore, 0) / cohortCompanies.length || 0).toFixed(2)
    ]
  })
  const cohortHeaders = ['Cohort', 'Companies', 'Revenue', 'EBITDA', 'AI Opportunity', 'Avg Value', 'Avg Readiness']
  const cohortSheet = utils.aoa_to_sheet([cohortHeaders, ...cohortData])
  utils.book_append_sheet(workbook, cohortSheet, 'Cohort Analysis')

  // Sheet 4: Framework Formulas
  const formulaData = [
    ['Framework 1: Value-Readiness Matrix'],
    ['Value Score = EBITDA Impact (50%) + Revenue Enable (25%) + Risk Reduce (25%)'],
    ['Readiness Score = Org Capacity (35%) + Data Quality (35%) + Tech Infrastructure (20%) + Timeline Fit (10%)'],
    [''],
    ['Framework 2: Portfolio Amplification'],
    ['Portfolio-Adjusted Priority = (PE-Native Score × EBITDA Impact) × (1 + (Replication Count × 0.1))'],
    [''],
    ['Framework 3: Hold Period Value Capture'],
    ['Track 1: EBITDA Accelerators - 0-12 months, 40-50% of investment'],
    ['Track 2: Growth Enablers - 6-24 months, 30-40% of investment'],
    ['Track 3: Exit Multipliers - 12-36 months, 15-25% of investment'],
  ]
  const formulaSheet = utils.aoa_to_sheet(formulaData)
  utils.book_append_sheet(workbook, formulaSheet, 'Framework Formulas')

  // Sheet 5: Champions Deep Dive
  const champions = companies.filter(c => c.quadrant === 'Champion')
    .sort((a, b) => b.adjustedEbitda - a.adjustedEbitda)
  const champHeaders = ['Rank', 'Company', 'Cohort', 'EBITDA ($M)', 'AI Opportunity ($M)', 'Track', 'Priority']
  const champData = champions.map((c, i) => [
    i + 1,
    c.name,
    c.cohort,
    c.ebitda.toFixed(0),
    c.adjustedEbitda.toFixed(1),
    c.track,
    c.adjustedEbitda >= 50 ? 'Critical' : c.adjustedEbitda >= 20 ? 'High' : 'Standard'
  ])
  const champSheet = utils.aoa_to_sheet([champHeaders, ...champData])
  utils.book_append_sheet(workbook, champSheet, 'Champions')

  // Write file
  writeFile(workbook, `${filename}.xlsx`)
}

// Export scenario comparison to Excel
export async function exportScenarioToExcel(
  scenarios: WhatIfScenario[],
  filename: string = 'BlueAlly_WhatIf_Analysis'
) {
  const workbook = utils.book_new()

  // Scenario Summary
  const headers = ['Scenario', 'Efficiency', 'Adoption', 'Confidence', 'Total Impact ($M)', 'Change']
  const data = scenarios.map(s => [
    s.name,
    `${((s.modifiedAssumptions.efficiencyFactor || 0.9) * 100).toFixed(0)}%`,
    `${((s.modifiedAssumptions.adoptionFactor || 0.75) * 100).toFixed(0)}%`,
    `${((s.modifiedAssumptions.confidenceFactor || 0.8) * 100).toFixed(0)}%`,
    s.results?.totalNewValue?.toFixed(1) || 'N/A',
    s.results?.deltaPercent ? `${s.results.deltaPercent > 0 ? '+' : ''}${s.results.deltaPercent.toFixed(1)}%` : 'Baseline'
  ])

  const sheet = utils.aoa_to_sheet([headers, ...data])
  utils.book_append_sheet(workbook, sheet, 'Scenario Comparison')

  writeFile(workbook, `${filename}.xlsx`)
}

// Generate shareable HTML report
export function generateHTMLReport(
  companies: Company[],
  title: string = 'Portfolio Analysis Report'
): string {
  const champions = companies.filter(c => c.quadrant === 'Champion')
  const totalEbitda = companies.reduce((sum, c) => sum + c.adjustedEbitda, 0)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | BlueAlly × AEA</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, ${BRAND.light} 0%, #E8F4FC 100%);
      color: ${BRAND.navy};
      line-height: 1.6;
      padding: 40px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    .header {
      background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 100%);
      color: white;
      padding: 40px;
      border-radius: 16px;
      margin-bottom: 32px;
      box-shadow: 0 10px 40px rgba(0, 102, 204, 0.2);
    }
    .header h1 { font-size: 2.5rem; margin-bottom: 8px; }
    .header p { opacity: 0.9; font-size: 1.1rem; }
    .logo { font-weight: 700; font-size: 1.5rem; margin-bottom: 16px; }
    .logo span { color: ${BRAND.accent}; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }
    .metric-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .metric-card h3 { color: #64748B; font-size: 0.875rem; margin-bottom: 8px; }
    .metric-card .value { font-size: 2rem; font-weight: 700; color: ${BRAND.primary}; }
    .section {
      background: white;
      padding: 32px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .section h2 {
      color: ${BRAND.navy};
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid ${BRAND.accent};
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #E2E8F0; }
    th { background: ${BRAND.light}; font-weight: 600; color: ${BRAND.navy}; }
    tr:hover { background: #F8FAFC; }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-champion { background: #ECFDF5; color: #059669; }
    .badge-quickwin { background: #EFF6FF; color: #2563EB; }
    .badge-strategic { background: #FEF3C7; color: #D97706; }
    .badge-foundation { background: #F1F5F9; color: #64748B; }
    .footer {
      text-align: center;
      padding: 32px;
      color: #64748B;
      font-size: 0.875rem;
    }
    .footer a { color: ${BRAND.primary}; text-decoration: none; }
    @media (max-width: 768px) {
      body { padding: 16px; }
      .header { padding: 24px; }
      .header h1 { font-size: 1.75rem; }
      .metrics { grid-template-columns: 1fr 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <div class="logo">Blue<span>Ally</span></div>
      <h1>${title}</h1>
      <p>AI Portfolio Value Acceleration Analysis | Generated ${new Date().toLocaleDateString()}</p>
    </header>

    <div class="metrics">
      <div class="metric-card">
        <h3>Total Companies</h3>
        <div class="value">${companies.length}</div>
      </div>
      <div class="metric-card">
        <h3>Champions</h3>
        <div class="value">${champions.length}</div>
      </div>
      <div class="metric-card">
        <h3>EBITDA Opportunity</h3>
        <div class="value">$${totalEbitda.toFixed(0)}M</div>
      </div>
      <div class="metric-card">
        <h3>Platform Plays</h3>
        <div class="value">${companies.filter(c => c.platformClassification === 'Platform').length}</div>
      </div>
    </div>

    <div class="section">
      <h2>Top Champions</h2>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Cohort</th>
            <th>EBITDA ($M)</th>
            <th>AI Opportunity ($M)</th>
            <th>Track</th>
            <th>Quadrant</th>
          </tr>
        </thead>
        <tbody>
          ${champions.slice(0, 10).map(c => `
            <tr>
              <td><strong>${c.name}</strong></td>
              <td>${c.cohort}</td>
              <td>$${c.ebitda.toFixed(0)}M</td>
              <td>$${c.adjustedEbitda.toFixed(1)}M</td>
              <td>${c.track}</td>
              <td><span class="badge badge-champion">${c.quadrant}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Cohort Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Cohort</th>
            <th>Companies</th>
            <th>Total EBITDA</th>
            <th>AI Opportunity</th>
            <th>Avg Readiness</th>
          </tr>
        </thead>
        <tbody>
          ${['Industrial', 'Services', 'Consumer', 'Healthcare', 'Logistics'].map(cohort => {
            const cohortCompanies = companies.filter(c => c.cohort === cohort)
            const totalEb = cohortCompanies.reduce((sum, c) => sum + c.ebitda, 0)
            const totalAdj = cohortCompanies.reduce((sum, c) => sum + c.adjustedEbitda, 0)
            const avgReadiness = cohortCompanies.reduce((sum, c) => sum + c.scores.readinessScore, 0) / cohortCompanies.length
            return `
              <tr>
                <td><strong>${cohort}</strong></td>
                <td>${cohortCompanies.length}</td>
                <td>$${totalEb.toFixed(0)}M</td>
                <td>$${totalAdj.toFixed(0)}M</td>
                <td>${avgReadiness.toFixed(1)}/10</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Framework Summary</h2>
      <p style="margin-bottom: 16px;">This analysis uses the Three Framework Approach for PE AI value acceleration:</p>
      <ul style="margin-left: 24px;">
        <li><strong>Value-Readiness Matrix:</strong> Identifies Champions (18), Quick Wins (7), Strategic (6), and Foundations (23)</li>
        <li><strong>Portfolio Amplification:</strong> ${companies.filter(c => c.platformClassification === 'Platform').length} Platform Play opportunities for cross-portfolio deployment</li>
        <li><strong>Hold Period Value Capture:</strong> ${companies.filter(c => c.track === 'T1').length} companies in Track 1 for Year 1 EBITDA acceleration</li>
      </ul>
    </div>

    <footer class="footer">
      <p>Generated by <a href="#">BlueAlly AI Portfolio Dashboard</a> | Powered by Claude AI</p>
      <p style="margin-top: 8px;">&copy; ${new Date().getFullYear()} BlueAlly. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>
`
}

// Download HTML report
export function downloadHTMLReport(companies: Company[], title?: string) {
  const html = generateHTMLReport(companies, title)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  saveAs(blob, `BlueAlly_Portfolio_Report_${new Date().toISOString().split('T')[0]}.html`)
}

// Export dashboard as PDF
export async function exportToPDF(elementId: string, filename: string = 'BlueAlly_Dashboard') {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Element not found:', elementId)
    return
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  })

  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [canvas.width, canvas.height]
  })

  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
  pdf.save(`${filename}.pdf`)
}

// Copy to clipboard utility
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy:', error)
    return false
  }
}

// Generate shareable link (would integrate with backend in production)
export function generateShareableLink(config: Record<string, any>): string {
  const encoded = btoa(JSON.stringify(config))
  return `${window.location.origin}/share?config=${encoded}`
}
