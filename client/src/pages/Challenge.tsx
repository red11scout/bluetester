import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WorkshopStepper from "@/components/WorkshopStepper";

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  high: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  low: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
};

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  assumption: "Assumption",
  kpi: "KPI",
  friction: "Friction Point",
  benefit: "Benefit Claim",
};

export default function Challenge() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: workshop } = useQuery({ queryKey: [`/api/workshops/${id}`] });
  const { data: challenges } = useQuery({ queryKey: [`/api/workshops/${id}/challenges`] });

  const w = workshop as any;
  const challengeList = (challenges || []) as any[];
  const challengeResults = w?.challengeResults as any;
  const hasChallenges = challengeList.length > 0 || challengeResults;

  const runMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/workshops/${id}/challenge`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}/challenges`] });
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}`] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ logId, status }: { logId: string; status: string }) =>
      apiRequest("PUT", `/api/workshops/${id}/challenge/${logId}`, { status, respondedBy: "facilitator" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}/challenges`] });
    },
  });

  const highCount = challengeList.filter((c: any) => c.severity === "high").length;
  const mediumCount = challengeList.filter((c: any) => c.severity === "medium").length;
  const pendingCount = challengeList.filter((c: any) => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <WorkshopStepper currentStep={3} workshopId={id!} companyName={w?.companyName} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Challenge Assumptions</h2>
        <p className="text-slate-600 mb-8">
          AI researches and challenges every assumption, KPI, and friction point.
          Review each challenge and accept or reject.
        </p>

        {/* Summary cards */}
        {hasChallenges && (
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Total Challenges</p>
              <p className="text-2xl font-bold text-slate-900">{challengeList.length}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">High Severity</p>
              <p className="text-2xl font-bold text-red-600">{highCount}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Medium Severity</p>
              <p className="text-2xl font-bold text-amber-600">{mediumCount}</p>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <p className="text-xs text-slate-500 mb-1">Pending Review</p>
              <p className="text-2xl font-bold" style={{ color: "#02a2fd" }}>{pendingCount}</p>
            </div>
          </div>
        )}

        {/* Run button */}
        {!hasChallenges && (
          <div className="bg-white rounded-xl border p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-50">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Run Assumption Challenge Agent</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              The Challenge Agent will stress-test every financial projection, timeline, and data readiness
              assumption against industry benchmarks.
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
                  Running Challenge Agent...
                </span>
              ) : "Run Challenge Agent"}
            </button>
            {runMutation.isError && (
              <p className="text-sm text-red-600 mt-3">
                {(runMutation.error as any)?.message || "Failed to run challenge agent"}
              </p>
            )}
          </div>
        )}

        {/* Challenge list */}
        {challengeList.length > 0 && (
          <div className="space-y-4 mb-8">
            {challengeList.map((c: any) => {
              const colors = SEVERITY_COLORS[c.severity] || SEVERITY_COLORS.medium;
              const isResolved = c.status !== "pending";
              return (
                <div key={c.id} className={`bg-white rounded-xl border p-5 ${isResolved ? "opacity-70" : ""}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text} ${colors.border} border`}>
                        {c.severity?.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">{c.useCaseId}</span>
                      <span className="text-xs text-slate-400">
                        {CHALLENGE_TYPE_LABELS[c.challengeType] || c.challengeType}
                      </span>
                    </div>
                    {isResolved && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        c.status === "accepted" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {c.status === "accepted" ? "Accepted" : "Rejected"}
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-[10px] text-slate-400 mb-1 uppercase">Original Value</p>
                      <p className="text-sm font-medium text-slate-900">
                        {typeof c.originalValue === "number"
                          ? `$${c.originalValue.toLocaleString()}`
                          : JSON.stringify(c.originalValue)}
                      </p>
                    </div>
                    <div className={`rounded-lg p-3 ${colors.bg}`}>
                      <p className={`text-[10px] mb-1 uppercase ${colors.text}`}>Challenged Value</p>
                      <p className={`text-sm font-medium ${colors.text}`}>
                        {typeof c.challengedValue === "number"
                          ? `$${c.challengedValue.toLocaleString()}`
                          : JSON.stringify(c.challengedValue)}
                      </p>
                    </div>
                  </div>

                  {c.evidence && (
                    <p className="text-sm text-slate-600 mb-3 italic">{c.evidence}</p>
                  )}

                  {!isResolved && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondMutation.mutate({ logId: c.id, status: "accepted" })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 bg-green-50 border border-green-200 hover:bg-green-100"
                      >
                        Accept Challenge
                      </button>
                      <button
                        onClick={() => respondMutation.mutate({ logId: c.id, status: "rejected" })}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/workshop/${id}/survey`)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/workshop/${id}/validate`)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
          >
            Next: Validate Benefits
          </button>
        </div>
      </main>
    </div>
  );
}
