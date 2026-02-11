import ExcelJS from "exceljs";
import type { Workshop } from "@shared/schema";

// =========================================================================
// EXCEL EXPORT
// =========================================================================

export async function generateExcelReport(workshop: Workshop): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "BlueAlly AI Catalyst";
  workbook.created = new Date();

  const w = workshop as any;
  const useCases = (w.reconciledUseCases || []) as any[];
  const synthesis = w.workshopSynthesis as any;
  const validation = w.validationResults as any;
  const lineages = (w.dataLineage || []) as any[];

  // --- Executive Summary sheet ---
  const summarySheet = workbook.addWorksheet("Executive Summary");
  summarySheet.columns = [
    { header: "Field", key: "field", width: 30 },
    { header: "Value", key: "value", width: 80 },
  ];
  styleHeader(summarySheet);

  summarySheet.addRows([
    { field: "Company", value: w.companyName },
    { field: "Industry", value: w.industry },
    { field: "Facilitator", value: w.facilitatorName },
    { field: "Workshop Date", value: w.workshopDate ? new Date(w.workshopDate).toLocaleDateString() : "N/A" },
    { field: "Total Use Cases", value: useCases.length },
    { field: "Status", value: w.status },
    { field: "", value: "" },
    { field: "Executive Summary", value: synthesis?.executiveSummary || "Not generated yet" },
  ]);

  if (synthesis?.topRecommendations?.length > 0) {
    summarySheet.addRow({ field: "", value: "" });
    summarySheet.addRow({ field: "Top Recommendations", value: "" });
    synthesis.topRecommendations.forEach((rec: string, i: number) => {
      summarySheet.addRow({ field: `  ${i + 1}.`, value: rec });
    });
  }

  // --- Use Cases sheet ---
  const ucSheet = workbook.addWorksheet("Use Cases");
  ucSheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Title", key: "title", width: 35 },
    { header: "Function", key: "fn", width: 20 },
    { header: "Annual Value", key: "value", width: 15 },
    { header: "Impact", key: "impact", width: 10 },
    { header: "Feasibility", key: "feasibility", width: 12 },
    { header: "Quadrant", key: "quadrant", width: 15 },
    { header: "Horizon", key: "horizon", width: 10 },
    { header: "Pattern", key: "pattern", width: 20 },
    { header: "Confidence", key: "confidence", width: 12 },
  ];
  styleHeader(ucSheet);

  for (const uc of useCases) {
    ucSheet.addRow({
      id: uc.id,
      title: uc.title,
      fn: uc.businessFunction,
      value: uc.totalAnnualValue ? `$${(uc.totalAnnualValue / 1000).toFixed(0)}K` : "N/A",
      impact: uc.impactScore ?? "—",
      feasibility: uc.feasibilityScore ?? "—",
      quadrant: formatQuadrant(uc.quadrant),
      horizon: uc.horizon || "—",
      pattern: uc.agenticPattern || "—",
      confidence: uc.confidenceLevel ? `${uc.confidenceLevel}%` : "—",
    });
  }

  // --- Validation sheet ---
  if (validation?.validations?.length > 0) {
    const valSheet = workbook.addWorksheet("Benefit Validation");
    valSheet.columns = [
      { header: "Use Case", key: "uc", width: 35 },
      { header: "Original Value", key: "original", width: 18 },
      { header: "Validated Value", key: "validated", width: 18 },
      { header: "Confidence", key: "confidence", width: 12 },
      { header: "Risk Flags", key: "flags", width: 40 },
    ];
    styleHeader(valSheet);

    for (const v of validation.validations) {
      valSheet.addRow({
        uc: v.useCaseTitle || v.useCaseId,
        original: `$${((v.originalValue || 0) / 1000).toFixed(0)}K`,
        validated: `$${((v.validatedValue || 0) / 1000).toFixed(0)}K`,
        confidence: `${v.confidenceLevel || 0}%`,
        flags: (v.riskFlags || []).join("; "),
      });
    }

    // Totals row
    valSheet.addRow({});
    valSheet.addRow({
      uc: "TOTAL",
      original: `$${((validation.totalOriginalValue || 0) / 1000000).toFixed(1)}M`,
      validated: `$${((validation.totalValidatedValue || 0) / 1000000).toFixed(1)}M`,
      confidence: `${validation.averageConfidence || 0}%`,
      flags: "",
    });
  }

  // --- Roadmap sheet ---
  if (synthesis?.implementationRoadmap) {
    const roadmapSheet = workbook.addWorksheet("Implementation Roadmap");
    roadmapSheet.columns = [
      { header: "Phase", key: "phase", width: 15 },
      { header: "Action Item", key: "item", width: 70 },
    ];
    styleHeader(roadmapSheet);

    const roadmap = synthesis.implementationRoadmap;
    for (const item of roadmap.thirtyDay || []) {
      roadmapSheet.addRow({ phase: "30 Days", item });
    }
    for (const item of roadmap.sixtyDay || []) {
      roadmapSheet.addRow({ phase: "60 Days", item });
    }
    for (const item of roadmap.ninetyDay || []) {
      roadmapSheet.addRow({ phase: "90 Days", item });
    }
  }

  // --- Risk Register sheet ---
  if (synthesis?.riskRegister?.length > 0) {
    const riskSheet = workbook.addWorksheet("Risk Register");
    riskSheet.columns = [
      { header: "Risk", key: "risk", width: 40 },
      { header: "Likelihood", key: "likelihood", width: 12 },
      { header: "Impact", key: "impact", width: 12 },
      { header: "Mitigation", key: "mitigation", width: 50 },
    ];
    styleHeader(riskSheet);

    for (const r of synthesis.riskRegister) {
      riskSheet.addRow({
        risk: r.risk,
        likelihood: r.likelihood?.toUpperCase(),
        impact: r.impact?.toUpperCase(),
        mitigation: r.mitigation,
      });
    }
  }

  // --- Data Lineage sheet ---
  if (lineages.length > 0) {
    const lineageSheet = workbook.addWorksheet("Data Lineage");
    lineageSheet.columns = [
      { header: "Use Case", key: "uc", width: 12 },
      { header: "Data Sources", key: "sources", width: 35 },
      { header: "Inputs", key: "inputs", width: 35 },
      { header: "Outputs", key: "outputs", width: 35 },
      { header: "Governance", key: "governance", width: 40 },
    ];
    styleHeader(lineageSheet);

    for (const l of lineages) {
      lineageSheet.addRow({
        uc: l.useCaseId,
        sources: (l.dataSources || []).join(", "),
        inputs: (l.inputs || []).join(", "),
        outputs: (l.outputs || []).join(", "),
        governance: l.governance || "",
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

// =========================================================================
// HTML REPORT (for print-to-PDF)
// =========================================================================

export function generateHTMLReport(workshop: Workshop): string {
  const w = workshop as any;
  const useCases = (w.reconciledUseCases || []) as any[];
  const synthesis = w.workshopSynthesis as any;
  const validation = w.validationResults as any;

  const quickWins = useCases.filter((uc: any) => uc.quadrant === "quick_win");
  const totalValue = validation?.totalValidatedValue || synthesis?.totalEstimatedValue || 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${w.companyName} — AI Catalyst Workshop Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; line-height: 1.6; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 28px; color: #001278; margin-bottom: 4px; }
    h2 { font-size: 20px; color: #001278; margin: 32px 0 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
    h3 { font-size: 16px; margin: 16px 0 8px; }
    p { margin-bottom: 8px; font-size: 14px; }
    .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
    .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; }
    .card-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; }
    .card-value { font-size: 24px; font-weight: 700; }
    .rec-item { display: flex; gap: 8px; margin: 6px 0; font-size: 14px; }
    .rec-num { width: 22px; height: 22px; border-radius: 50%; background: #001278; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 13px; }
    th { background: #001278; color: white; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .phase { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .phase-30 { background: #dcfce7; color: #166534; }
    .phase-60 { background: #dbeafe; color: #1e40af; }
    .phase-90 { background: #e0e7ff; color: #3730a3; }
    .risk-high { color: #dc2626; font-weight: 600; }
    .risk-medium { color: #d97706; }
    .risk-low { color: #2563eb; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <h1>${w.companyName}</h1>
  <p class="subtitle">AI Use Case Workshop Report &mdash; Generated by BlueAlly AI Catalyst</p>

  <div class="cards">
    <div class="card">
      <div class="card-label">Use Cases</div>
      <div class="card-value" style="color:#001278">${useCases.length}</div>
    </div>
    <div class="card">
      <div class="card-label">Quick Wins</div>
      <div class="card-value" style="color:#36bf78">${quickWins.length}</div>
    </div>
    <div class="card">
      <div class="card-label">Est. Annual Value</div>
      <div class="card-value" style="color:#02a2fd">${totalValue > 0 ? `$${(totalValue / 1000000).toFixed(1)}M` : "N/A"}</div>
    </div>
    <div class="card">
      <div class="card-label">Avg Confidence</div>
      <div class="card-value" style="color:#7c3aed">${validation?.averageConfidence ? `${validation.averageConfidence}%` : "N/A"}</div>
    </div>
  </div>

  ${synthesis?.executiveSummary ? `
  <h2>Executive Summary</h2>
  <p>${synthesis.executiveSummary}</p>
  ` : ""}

  ${synthesis?.topRecommendations?.length > 0 ? `
  <h2>Top Recommendations</h2>
  ${synthesis.topRecommendations.map((rec: string, i: number) => `
    <div class="rec-item"><div class="rec-num">${i + 1}</div><span>${rec}</span></div>
  `).join("")}
  ` : ""}

  <h2>Use Case Portfolio</h2>
  <table>
    <tr><th>ID</th><th>Title</th><th>Function</th><th>Annual Value</th><th>Quadrant</th><th>Horizon</th></tr>
    ${useCases.map((uc: any) => `
      <tr>
        <td>${uc.id}</td>
        <td>${uc.title}</td>
        <td>${uc.businessFunction}</td>
        <td>${uc.totalAnnualValue ? `$${(uc.totalAnnualValue / 1000).toFixed(0)}K` : "N/A"}</td>
        <td>${formatQuadrant(uc.quadrant)}</td>
        <td>${uc.horizon || "—"}</td>
      </tr>
    `).join("")}
  </table>

  ${synthesis?.implementationRoadmap ? `
  <h2>Implementation Roadmap</h2>
  <table>
    <tr><th>Phase</th><th>Action</th></tr>
    ${(synthesis.implementationRoadmap.thirtyDay || []).map((item: string) => `
      <tr><td><span class="phase phase-30">30 Days</span></td><td>${item}</td></tr>
    `).join("")}
    ${(synthesis.implementationRoadmap.sixtyDay || []).map((item: string) => `
      <tr><td><span class="phase phase-60">60 Days</span></td><td>${item}</td></tr>
    `).join("")}
    ${(synthesis.implementationRoadmap.ninetyDay || []).map((item: string) => `
      <tr><td><span class="phase phase-90">90 Days</span></td><td>${item}</td></tr>
    `).join("")}
  </table>
  ` : ""}

  ${synthesis?.riskRegister?.length > 0 ? `
  <h2>Risk Register</h2>
  <table>
    <tr><th>Risk</th><th>Likelihood</th><th>Impact</th><th>Mitigation</th></tr>
    ${synthesis.riskRegister.map((r: any) => `
      <tr>
        <td>${r.risk}</td>
        <td class="risk-${r.likelihood}">${r.likelihood?.toUpperCase()}</td>
        <td class="risk-${r.impact}">${r.impact?.toUpperCase()}</td>
        <td>${r.mitigation}</td>
      </tr>
    `).join("")}
  </table>
  ` : ""}

  ${synthesis?.resourceRequirements?.length > 0 ? `
  <h2>Resource Requirements</h2>
  <ul style="margin-left:20px;font-size:14px;">
    ${synthesis.resourceRequirements.map((r: string) => `<li>${r}</li>`).join("")}
  </ul>
  ` : ""}

  <div class="footer">
    BlueAlly AI Catalyst &mdash; ${w.companyName} Workshop Report &mdash; ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;
}

// =========================================================================
// HELPERS
// =========================================================================

function formatQuadrant(q: string | undefined): string {
  switch (q) {
    case "quick_win": return "Quick Win";
    case "strategic": return "Strategic Bet";
    case "fill_in": return "Fill-In";
    case "deprioritize": return "Deprioritize";
    default: return "—";
  }
}

function styleHeader(sheet: ExcelJS.Worksheet) {
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF001278" } };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 11 };
    cell.alignment = { vertical: "middle" };
  });
  headerRow.height = 24;
}
