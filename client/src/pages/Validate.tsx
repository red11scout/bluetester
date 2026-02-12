import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WorkshopStepper from "@/components/WorkshopStepper";

export default function Validate() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: workshop } = useQuery({ queryKey: [`/api/workshops/${id}`] });

  const w = workshop as any;
  const validationResults = w?.validationResults as any;
  const hasValidations = validationResults?.validations?.length > 0;

  const runMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/workshops/${id}/validate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}`] });
    },
  });

  const validations = (validationResults?.validations || []) as any[];
  const totalOriginal = validationResults?.totalOriginalValue || 0;
  const totalValidated = validationResults?.totalValidatedValue || 0;
  const avgConfidence = validationResults?.averageConfidence || 0;
  const overallDiscount = totalOriginal > 0 ? Math.round((1 - totalValidated / totalOriginal) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <WorkshopStepper currentStep={4} workshopId={id!} companyName={w?.companyName} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Validate Benefits</h2>
        <p className="text-slate-600 mb-8">
          AI verifies financial projections against industry benchmarks and survey readiness scores.
          View risk-adjusted benefit estimates.
        </p>

        {/* Summary cards */}
        {hasValidations && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Original Portfolio</p>
              <p className="text-xl font-bold text-slate-900">${(totalOriginal / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Validated Portfolio</p>
              <p className="text-xl font-bold" style={{ color: "#36bf78" }}>${(totalValidated / 1000000).toFixed(1)}M</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Risk Adjustment</p>
              <p className="text-xl font-bold text-amber-600">-{overallDiscount}%</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Avg Confidence</p>
              <p className="text-xl font-bold" style={{ color: "#02a2fd" }}>{avgConfidence}%</p>
            </div>
          </div>
        )}

        {/* Run button */}
        {!hasValidations && (
          <div className="bg-white rounded-xl border p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-green-50">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Run Benefit Validation Agent</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Cross-references benefit claims with survey maturity scores, industry case studies,
              and applies risk-adjusted discount factors.
            </p>
            <button
              onClick={() => runMutation.mutate()}
              disabled={runMutation.isPending}
              className="py-2.5 px-6 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #36bf78, #02a2fd)" }}
            >
              {runMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running Validation Agent...
                </span>
              ) : "Run Validation Agent"}
            </button>
            {runMutation.isError && (
              <p className="text-sm text-red-600 mt-3">
                {(runMutation.error as any)?.message || "Failed to run validation agent"}
              </p>
            )}
          </div>
        )}

        {/* Validation results */}
        {hasValidations && (
          <div className="space-y-4 mb-8">
            {validations.map((v: any, idx: number) => {
              const discount = v.originalBenefit > 0
                ? Math.round((1 - v.validatedBenefit / v.originalBenefit) * 100)
                : 0;
              const confidenceColor = v.confidenceLevel >= 80 ? "#36bf78" : v.confidenceLevel >= 60 ? "#f59e0b" : "#ef4444";

              return (
                <div key={v.useCaseId || idx} className="bg-white rounded-xl border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded text-white" style={{ backgroundColor: "#001278" }}>
                        {v.useCaseId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Confidence</span>
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${v.confidenceLevel}%`, backgroundColor: confidenceColor }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: confidenceColor }}>
                        {v.confidenceLevel}%
                      </span>
                    </div>
                  </div>

                  {/* Value comparison */}
                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400 mb-1 uppercase">Original Benefit</p>
                      <p className="text-lg font-bold text-slate-900">
                        ${(v.originalBenefit / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-[10px] text-green-600 mb-1 uppercase">Validated Benefit</p>
                      <p className="text-lg font-bold text-green-700">
                        ${(v.validatedBenefit / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-[10px] text-amber-600 mb-1 uppercase">Adjustment</p>
                      <p className="text-lg font-bold text-amber-700">-{discount}%</p>
                    </div>
                  </div>

                  {v.adjustmentReason && (
                    <p className="text-sm text-slate-600 mb-2">{v.adjustmentReason}</p>
                  )}

                  {v.benchmarkSource && (
                    <p className="text-xs text-slate-400 mb-2">Source: {v.benchmarkSource}</p>
                  )}

                  {v.riskFlags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {v.riskFlags.map((flag: string, i: number) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                          {flag}
                        </span>
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
            onClick={() => navigate(`/workshop/${id}/challenge`)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/workshop/${id}/prioritize`)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
          >
            Next: Prioritize
          </button>
        </div>
      </main>
    </div>
  );
}
