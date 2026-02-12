import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WorkshopStepper from "@/components/WorkshopStepper";

export default function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: workshop } = useQuery({ queryKey: [`/api/workshops/${id}`] });
  const { data: matrixData } = useQuery({ queryKey: [`/api/workshops/${id}/matrix`] });

  const w = workshop as any;
  const synthesis = w?.workshopSynthesis as any;
  const hasSynthesis = !!synthesis?.executiveSummary;
  const priorities = (matrixData || []) as any[];
  const validation = w?.validationResults as any;
  const useCases = (w?.reconciledUseCases || []) as any[];

  const runMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/workshops/${id}/synthesize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}`] });
    },
  });

  const quickWinCount = priorities.filter((p: any) => p.quadrant === "quick_win").length;
  const totalValue = validation?.totalValidatedValue || synthesis?.totalEstimatedValue || 0;

  return (
    <div className="min-h-screen bg-background">
      <WorkshopStepper currentStep={8} workshopId={id!} companyName={w?.companyName} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Decision Dashboard</h2>
        <p className="text-slate-600 mb-8">
          Executive summary, top recommendations, implementation roadmap, and export options.
        </p>

        {/* Generate synthesis if needed */}
        {!hasSynthesis && (
          <div className="bg-white rounded-xl border p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #001278, #36bf78)" }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Generate Workshop Synthesis</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              The Synthesis Agent combines all previous agent outputs into an executive summary,
              recommendations, roadmap, and risk register.
            </p>
            <button
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
              className="py-2.5 px-6 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}
            >
              {runMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Synthesis...
                </span>
              ) : "Generate Synthesis"}
            </button>
            {runMutation.isError && (
              <p className="text-sm text-red-600 mt-3">
                {(runMutation.error as any)?.message || "Failed to generate synthesis"}
              </p>
            )}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs text-slate-500 mb-1">Total Use Cases</p>
            <p className="text-2xl font-bold" style={{ color: "#001278" }}>{useCases.length || "—"}</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs text-slate-500 mb-1">Quick Wins</p>
            <p className="text-2xl font-bold" style={{ color: "#36bf78" }}>{quickWinCount || "—"}</p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs text-slate-500 mb-1">Est. Annual Value</p>
            <p className="text-2xl font-bold" style={{ color: "#02a2fd" }}>
              {totalValue > 0 ? `$${(totalValue / 1000000).toFixed(1)}M` : "$—"}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-5">
            <p className="text-xs text-slate-500 mb-1">Avg Confidence</p>
            <p className="text-2xl font-bold" style={{ color: "#7c3aed" }}>
              {validation?.averageConfidence ? `${validation.averageConfidence}%` : "—"}
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        {synthesis?.executiveSummary && (
          <div className="bg-white rounded-xl border p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-3">Executive Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {synthesis.executiveSummary}
            </p>
          </div>
        )}

        {/* Top Recommendations */}
        {synthesis?.topRecommendations?.length > 0 && (
          <div className="bg-white rounded-xl border p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Top Recommendations</h3>
            <div className="space-y-3">
              {synthesis.topRecommendations.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: i < 2 ? "#001278" : i < 4 ? "#02a2fd" : "#36bf78" }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm text-slate-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Wins */}
        {synthesis?.topQuickWins?.length > 0 && (
          <div className="bg-green-50 rounded-xl border border-green-200 p-6 mb-8">
            <h3 className="font-semibold text-green-800 mb-3">Start Now: Quick Wins</h3>
            <div className="space-y-2">
              {synthesis.topQuickWins.map((qw: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {qw}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Implementation Roadmap */}
        {synthesis?.implementationRoadmap && (
          <div className="bg-white rounded-xl border p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Implementation Roadmap</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { period: "30 Days", items: synthesis.implementationRoadmap.thirtyDay, color: "#36bf78" },
                { period: "60 Days", items: synthesis.implementationRoadmap.sixtyDay, color: "#02a2fd" },
                { period: "90 Days", items: synthesis.implementationRoadmap.ninetyDay, color: "#001278" },
              ].map((phase) => (
                <div key={phase.period} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: phase.color }} />
                    <span style={{ color: phase.color }}>{phase.period}</span>
                  </h4>
                  <ul className="space-y-2">
                    {(phase.items || []).map((item: string, i: number) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-slate-300 mt-0.5">-</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Register */}
        {synthesis?.riskRegister?.length > 0 && (
          <div className="bg-white rounded-xl border p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Risk Register</h3>
            <div className="space-y-3">
              {synthesis.riskRegister.map((risk: any, i: number) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      risk.likelihood === "high" ? "bg-red-50 text-red-700" :
                      risk.likelihood === "medium" ? "bg-amber-50 text-amber-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {risk.likelihood?.toUpperCase()} LIKELIHOOD
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      risk.impact === "high" ? "bg-red-50 text-red-700" :
                      risk.impact === "medium" ? "bg-amber-50 text-amber-700" :
                      "bg-blue-50 text-blue-700"
                    }`}>
                      {risk.impact?.toUpperCase()} IMPACT
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">{risk.risk}</p>
                  <p className="text-xs text-slate-500">Mitigation: {risk.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resource Requirements */}
        {synthesis?.resourceRequirements?.length > 0 && (
          <div className="bg-white rounded-xl border p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-3">Resource Requirements</h3>
            <div className="space-y-2">
              {synthesis.resourceRequirements.map((req: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="text-slate-300 mt-0.5">-</span>
                  {req}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">Export & Share</h3>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                const res = await fetch(`/api/workshops/${id}/export/pdf`, { method: "POST" });
                const html = await res.text();
                const blob = new Blob([html], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank");
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Export Report (HTML/Print)
            </button>
            <button
              onClick={async () => {
                const res = await fetch(`/api/workshops/${id}/export/xlsx`, { method: "POST" });
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${w?.companyName || "Workshop"}_Report.xlsx`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ backgroundColor: "#36bf78" }}
            >
              Export Excel
            </button>
            <button
              onClick={async () => {
                const reportUrl = `${window.location.origin}/api/workshops/${id}/export/pdf`;
                await navigator.clipboard.writeText(reportUrl);
                alert("Report link copied to clipboard!");
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Copy Share Link
            </button>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/workshop/${id}/lineage`)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
          >
            Back to Workshop Hub
          </button>
        </div>
      </main>
    </div>
  );
}
