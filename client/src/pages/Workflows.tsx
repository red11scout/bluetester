import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WorkshopStepper from "@/components/WorkshopStepper";

export default function Workflows() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<number>(0);

  const { data: workshop } = useQuery({ queryKey: [`/api/workshops/${id}`] });

  const w = workshop as any;
  const workflows = (w?.workflowMaps || []) as any[];
  const hasWorkflows = workflows.length > 0;
  const activeWF = workflows[selectedWorkflow];

  const runMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/workshops/${id}/workflows`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}`] });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <WorkshopStepper currentStep={6} workshopId={id!} companyName={w?.companyName} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Workflow Visualization</h2>
        <p className="text-slate-600 mb-8">
          Side-by-side current vs AI-automated process flows with improvement metrics.
        </p>

        {/* Run button */}
        {!hasWorkflows && (
          <div className="bg-white rounded-xl border p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #001278, #36bf78)" }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Generate Workflow Maps + Data Lineage</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Runs Workflow Visualization Agent and Data Lineage Agent in parallel.
              Generates current vs AI-automated process flows for each prioritized use case.
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
                  Generating Workflows...
                </span>
              ) : "Generate Workflow Maps"}
            </button>
            {runMutation.isError && (
              <p className="text-sm text-red-600 mt-3">
                {(runMutation.error as any)?.message || "Failed to generate workflows"}
              </p>
            )}
          </div>
        )}

        {/* Workflow selector tabs */}
        {hasWorkflows && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {workflows.map((wf: any, idx: number) => (
                <button
                  key={wf.useCaseId}
                  onClick={() => setSelectedWorkflow(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap border transition-all ${
                    idx === selectedWorkflow
                      ? "text-white border-transparent shadow-md"
                      : "text-slate-700 bg-white border-slate-200 hover:border-slate-300"
                  }`}
                  style={idx === selectedWorkflow ? { backgroundColor: "#001278" } : {}}
                >
                  <span className="font-mono text-xs mr-1">{wf.useCaseId}</span>
                  {wf.useCaseTitle}
                </button>
              ))}
            </div>

            {/* Comparison metrics */}
            {activeWF?.comparisonMetrics && (
              <div className="grid gap-3 md:grid-cols-4 mb-6">
                {Object.entries(activeWF.comparisonMetrics as Record<string, any>).map(([key, metric]: [string, any]) => {
                  const labels: Record<string, string> = {
                    timeReduction: "Time",
                    costReduction: "Cost",
                    qualityImprovement: "Quality",
                    throughputIncrease: "Throughput",
                  };
                  return (
                    <div key={key} className="bg-white rounded-xl border p-4">
                      <p className="text-[10px] text-slate-400 mb-2 uppercase">{labels[key] || key}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-red-500 line-through">{metric.before}</span>
                        <span className="text-slate-300">→</span>
                        <span className="text-green-600 font-medium">{metric.after}</span>
                      </div>
                      <p className="text-xs font-bold mt-1" style={{ color: "#36bf78" }}>{metric.improvement}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pattern badge */}
            {activeWF && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Pattern: {activeWF.agenticPattern}
                </span>
                {activeWF.patternRationale && (
                  <span className="text-xs text-slate-400">{activeWF.patternRationale}</span>
                )}
              </div>
            )}

            {/* Side-by-side workflow */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {/* Current State */}
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Current State
                </h3>
                <div className="space-y-3">
                  {(activeWF?.currentStateWorkflow || []).map((step: any, i: number) => (
                    <div key={i} className={`p-3 rounded-lg border ${step.isBottleneck ? "border-red-300 bg-red-50" : step.isFrictionPoint ? "border-amber-200 bg-amber-50" : "border-slate-200"}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                          step.isBottleneck ? "bg-red-200 text-red-700" : "bg-slate-200 text-slate-600"
                        }`}>
                          {step.stepNumber || i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{step.stepName}</p>
                          {step.description && <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {step.actor && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                {step.actor}
                              </span>
                            )}
                            {step.duration && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                {step.duration}
                              </span>
                            )}
                            {step.isBottleneck && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium">
                                BOTTLENECK
                              </span>
                            )}
                          </div>
                          {step.painPoints?.length > 0 && (
                            <div className="mt-1.5">
                              {step.painPoints.map((p: string, j: number) => (
                                <p key={j} className="text-[10px] text-red-500">- {p}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target State */}
              <div className="bg-white rounded-xl border p-5">
                <h3 className="font-semibold text-green-600 mb-4 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  AI-Automated State
                </h3>
                <div className="space-y-3">
                  {(activeWF?.targetStateWorkflow || []).map((step: any, i: number) => (
                    <div key={i} className={`p-3 rounded-lg border ${step.isAIEnabled ? "border-green-200 bg-green-50" : "border-slate-200"}`}>
                      <div className="flex items-start gap-2">
                        <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                          step.isAIEnabled ? "bg-green-200 text-green-700" : "bg-slate-200 text-slate-600"
                        }`}>
                          {step.stepNumber || i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{step.stepName}</p>
                          {step.description && <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {step.actor && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                step.isAIEnabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
                              }`}>
                                {step.actor}
                              </span>
                            )}
                            {step.duration && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-600">
                                {step.duration}
                              </span>
                            )}
                            {step.automationLevel && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-600">
                                {step.automationLevel}
                              </span>
                            )}
                            {step.agentType && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600">
                                {step.agentType}
                              </span>
                            )}
                          </div>
                          {step.aiCapabilities?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {step.aiCapabilities.map((cap: string, j: number) => (
                                <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                                  {cap}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/workshop/${id}/prioritize`)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/workshop/${id}/lineage`)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
          >
            Next: Data Lineage
          </button>
        </div>
      </main>
    </div>
  );
}
