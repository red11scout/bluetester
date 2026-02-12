import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WorkshopStepper from "@/components/WorkshopStepper";

const QUADRANT_COLORS: Record<string, { bg: string; text: string; fill: string }> = {
  quick_win: { bg: "bg-green-50", text: "text-green-700", fill: "#36bf78" },
  strategic: { bg: "bg-amber-50", text: "text-amber-700", fill: "#f59e0b" },
  fill_in: { bg: "bg-blue-50", text: "text-blue-700", fill: "#02a2fd" },
  deprioritize: { bg: "bg-slate-50", text: "text-slate-500", fill: "#94a3b8" },
};

const QUADRANT_LABELS: Record<string, string> = {
  quick_win: "Quick Win",
  strategic: "Strategic Bet",
  fill_in: "Fill-In",
  deprioritize: "Deprioritize",
};

export default function Prioritize() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedUC, setSelectedUC] = useState<string | null>(null);

  const { data: workshop } = useQuery({ queryKey: [`/api/workshops/${id}`] });
  const { data: matrixData } = useQuery({ queryKey: [`/api/workshops/${id}/matrix`] });

  const w = workshop as any;
  const priorities = (matrixData || []) as any[];
  const hasPriorities = priorities.length > 0;

  const runMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/workshops/${id}/prioritize`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}/matrix`] });
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}`] });
    },
  });

  const quickWins = priorities.filter(p => p.quadrant === "quick_win");
  const strategic = priorities.filter(p => p.quadrant === "strategic");
  const fillIns = priorities.filter(p => p.quadrant === "fill_in");
  const deprioritized = priorities.filter(p => p.quadrant === "deprioritize");

  return (
    <div className="min-h-screen bg-background">
      <WorkshopStepper currentStep={5} workshopId={id!} companyName={w?.companyName} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">2x2 Prioritization Matrix</h2>
        <p className="text-slate-600 mb-8">
          Use cases scored on Impact (Value) vs Feasibility (Readiness).
        </p>

        {/* Summary cards */}
        {hasPriorities && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Quick Wins</p>
              <p className="text-2xl font-bold" style={{ color: "#36bf78" }}>{quickWins.length}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Strategic Bets</p>
              <p className="text-2xl font-bold text-amber-600">{strategic.length}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Fill-Ins</p>
              <p className="text-2xl font-bold" style={{ color: "#02a2fd" }}>{fillIns.length}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Deprioritized</p>
              <p className="text-2xl font-bold text-slate-400">{deprioritized.length}</p>
            </div>
          </div>
        )}

        {/* Run button */}
        {!hasPriorities && (
          <div className="bg-white rounded-xl border p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Run Prioritization Agent</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Scores each use case on Impact (value, strategic alignment, scope) and
              Feasibility (survey readiness, data readiness, complexity) to place in the 2x2 matrix.
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
                  Running Prioritization Agent...
                </span>
              ) : "Run Prioritization Agent"}
            </button>
            {runMutation.isError && (
              <p className="text-sm text-red-600 mt-3">
                {(runMutation.error as any)?.message || "Failed to run prioritization agent"}
              </p>
            )}
          </div>
        )}

        {/* 2x2 Matrix Scatter Plot */}
        {hasPriorities && (
          <div className="bg-white rounded-xl border p-6 mb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Impact vs Feasibility Matrix</h3>
            <div className="relative w-full" style={{ paddingBottom: "60%" }}>
              <div className="absolute inset-0">
                {/* Background quadrants */}
                <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                  {/* Quadrant backgrounds */}
                  <rect x="0" y="0" width="60" height="40" fill="#fef3c7" opacity="0.3" /> {/* Strategic */}
                  <rect x="60" y="0" width="40" height="40" fill="#dcfce7" opacity="0.3" /> {/* Quick Win */}
                  <rect x="0" y="40" width="60" height="60" fill="#f1f5f9" opacity="0.3" /> {/* Deprioritize */}
                  <rect x="60" y="40" width="40" height="60" fill="#dbeafe" opacity="0.3" /> {/* Fill-In */}

                  {/* Grid lines */}
                  <line x1="60" y1="0" x2="60" y2="100" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="40" x2="100" y2="40" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,2" />

                  {/* Axis lines */}
                  <line x1="0" y1="100" x2="100" y2="100" stroke="#94a3b8" strokeWidth="0.3" />
                  <line x1="0" y1="0" x2="0" y2="100" stroke="#94a3b8" strokeWidth="0.3" />

                  {/* Data points */}
                  {priorities.map((p: any) => {
                    const x = (p.feasibilityScore / 10) * 100;
                    const y = 100 - (p.impactScore / 10) * 100;
                    const colors = QUADRANT_COLORS[p.quadrant] || QUADRANT_COLORS.deprioritize;
                    const isSelected = selectedUC === p.useCaseId;
                    return (
                      <g key={p.useCaseId} onClick={() => setSelectedUC(isSelected ? null : p.useCaseId)} style={{ cursor: "pointer" }}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelected ? 3.5 : 2.5}
                          fill={colors.fill}
                          stroke={isSelected ? "#001278" : "white"}
                          strokeWidth={isSelected ? 0.8 : 0.5}
                          opacity={isSelected ? 1 : 0.85}
                        />
                        <text
                          x={x + 3}
                          y={y - 2}
                          fontSize="2.5"
                          fill="#475569"
                          fontWeight={isSelected ? "bold" : "normal"}
                        >
                          {p.useCaseId}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Quadrant labels */}
                <div className="absolute top-2 left-2 text-[10px] font-medium text-amber-600">Strategic Bets</div>
                <div className="absolute top-2 right-2 text-[10px] font-medium text-green-600">Quick Wins</div>
                <div className="absolute bottom-2 left-2 text-[10px] font-medium text-slate-400">Deprioritize</div>
                <div className="absolute bottom-2 right-2 text-[10px] font-medium text-blue-600">Fill-Ins</div>

                {/* Axis labels */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-medium text-slate-500 whitespace-nowrap">
                  Impact (Value) →
                </div>
                <div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-500">
                  Feasibility (Readiness) →
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected use case detail */}
        {selectedUC && hasPriorities && (() => {
          const p = priorities.find((pr: any) => pr.useCaseId === selectedUC);
          if (!p) return null;
          const colors = QUADRANT_COLORS[p.quadrant] || QUADRANT_COLORS.deprioritize;
          return (
            <div className="bg-white rounded-xl border p-5 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded text-white" style={{ backgroundColor: "#001278" }}>
                  {p.useCaseId}
                </span>
                <span className="text-sm font-medium text-slate-900">{p.useCaseTitle}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                  {QUADRANT_LABELS[p.quadrant]}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Impact Score: <span className="font-bold text-slate-900">{p.impactScore}/10</span></p>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.impactScore * 10}%`, backgroundColor: colors.fill }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-2">Feasibility Score: <span className="font-bold text-slate-900">{p.feasibilityScore}/10</span></p>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${p.feasibilityScore * 10}%`, backgroundColor: colors.fill }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Use case list by quadrant */}
        {hasPriorities && (
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {[
              { label: "Quick Wins", items: quickWins, quadrant: "quick_win" },
              { label: "Strategic Bets", items: strategic, quadrant: "strategic" },
              { label: "Fill-Ins", items: fillIns, quadrant: "fill_in" },
              { label: "Deprioritize", items: deprioritized, quadrant: "deprioritize" },
            ].map(({ label, items, quadrant }) => {
              const colors = QUADRANT_COLORS[quadrant];
              return (
                <div key={quadrant} className="bg-white rounded-xl border p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.fill }} />
                    <h4 className="font-medium text-slate-900">{label}</h4>
                    <span className="text-xs text-slate-400">({items.length})</span>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-slate-400">No use cases</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((p: any) => (
                        <button
                          key={p.useCaseId}
                          onClick={() => setSelectedUC(p.useCaseId)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                            selectedUC === p.useCaseId
                              ? `${colors.bg} ${colors.text} border-current`
                              : "bg-slate-50 text-slate-700 border-transparent hover:bg-slate-100"
                          }`}
                        >
                          <span className="font-mono text-xs mr-2">{p.useCaseId}</span>
                          {p.useCaseTitle || "—"}
                          <span className="float-right text-xs text-slate-400">
                            {p.impactScore}/{p.feasibilityScore}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/workshop/${id}/validate`)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/workshop/${id}/workflows`)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
          >
            Next: Workflow Maps
          </button>
        </div>
      </main>
    </div>
  );
}
