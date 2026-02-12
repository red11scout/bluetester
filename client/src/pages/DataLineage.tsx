import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import WorkshopStepper from "@/components/WorkshopStepper";

export default function DataLineage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [selectedUC, setSelectedUC] = useState<number>(0);

  const { data: workshop } = useQuery({ queryKey: [`/api/workshops/${id}`] });

  const w = workshop as any;
  const lineages = (w?.dataLineage || []) as any[];
  const hasLineage = lineages.length > 0;
  const active = lineages[selectedUC];

  return (
    <div className="min-h-screen bg-background">
      <WorkshopStepper currentStep={7} workshopId={id!} companyName={w?.companyName} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Data Lineage</h2>
        <p className="text-slate-600 mb-8">
          Data sources, inputs, outputs, explainability, observability, and governance for each use case.
        </p>

        {!hasLineage && (
          <div className="bg-white rounded-xl border p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #001278, #36bf78)" }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Lineage Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Data lineage is generated automatically when you run workflow visualization (Step 6).
              Both the Workflow and Data Lineage agents run in parallel.
            </p>
            <button
              onClick={() => navigate(`/workshop/${id}/workflows`)}
              className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}
            >
              Go to Workflow Visualization
            </button>
          </div>
        )}

        {hasLineage && (
          <>
            {/* Use case selector */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {lineages.map((l: any, idx: number) => (
                <button
                  key={l.useCaseId}
                  onClick={() => setSelectedUC(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-all ${
                    idx === selectedUC
                      ? "text-white border-transparent shadow-md"
                      : "text-slate-700 bg-white border-slate-200 hover:border-slate-300"
                  }`}
                  style={idx === selectedUC ? { backgroundColor: "#001278" } : {}}
                >
                  <span className="font-mono text-xs mr-1">{l.useCaseId}</span>
                </button>
              ))}
            </div>

            {active && (
              <div className="space-y-6">
                {/* Data Sources */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#001278" }} />
                    Data Sources
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(active.dataSources || []).map((src: string, i: number) => (
                      <span key={i} className="text-sm px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                        {src}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Inputs & Outputs side by side */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-white rounded-xl border p-6">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#02a2fd" }} />
                      Inputs
                    </h3>
                    <div className="space-y-2">
                      {(active.inputs || []).map((inp: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                          {inp}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border p-6">
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#36bf78" }} />
                      Outputs
                    </h3>
                    <div className="space-y-2">
                      {(active.outputs || []).map((out: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {out}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Explainability */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#7c3aed" }} />
                    Explainability
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{active.explainability}</p>
                </div>

                {/* Observability */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
                    Observability
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{active.observability}</p>
                </div>

                {/* Governance */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    Governance
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{active.governance}</p>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate(`/workshop/${id}/workflows`)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/workshop/${id}/dashboard`)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
          >
            Next: Decision Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
