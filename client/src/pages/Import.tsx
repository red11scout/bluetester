import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import WorkshopStepper from "@/components/WorkshopStepper";

export default function Import() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [researchReportId, setResearchReportId] = useState("");
  const [cognitionAnalysisId, setCognitionAnalysisId] = useState("");
  const [importStatus, setImportStatus] = useState<{ research: string; cognition: string }>({
    research: "idle",
    cognition: "idle",
  });

  const { data: workshop, isLoading } = useQuery({
    queryKey: [`/api/workshops/${id}`],
  });

  const importResearch = useMutation({
    mutationFn: async () => {
      setImportStatus((prev) => ({ ...prev, research: "loading" }));
      const res = await apiRequest("POST", `/api/workshops/${id}/import/research`, {
        reportId: researchReportId,
      });
      return res.json();
    },
    onSuccess: () => {
      setImportStatus((prev) => ({ ...prev, research: "done" }));
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}`] });
    },
    onError: () => {
      setImportStatus((prev) => ({ ...prev, research: "error" }));
    },
  });

  const importCognition = useMutation({
    mutationFn: async () => {
      setImportStatus((prev) => ({ ...prev, cognition: "loading" }));
      const res = await apiRequest("POST", `/api/workshops/${id}/import/cognition`, {
        analysisId: cognitionAnalysisId,
      });
      return res.json();
    },
    onSuccess: () => {
      setImportStatus((prev) => ({ ...prev, cognition: "done" }));
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}`] });
    },
    onError: () => {
      setImportStatus((prev) => ({ ...prev, cognition: "error" }));
    },
  });

  const reconcile = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/workshops/${id}/reconcile`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}`] });
    },
  });

  if (isLoading) return <div className="p-10 text-center text-slate-500">Loading...</div>;

  const w = workshop as any;

  return (
    <div className="min-h-screen bg-background">
      <WorkshopStepper currentStep={1} workshopId={id!} companyName={w?.companyName} />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Import & Reconcile Data</h2>
        <p className="text-slate-600 mb-8">
          Pull analysis data from both ResearchApp and CognitionTwo, then reconcile into unified use cases.
        </p>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* ResearchApp Import */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-slate-900 mb-1">ResearchApp</h3>
            <p className="text-sm text-slate-500 mb-4">Financial impact analysis & workflows</p>

            <input
              type="text"
              value={researchReportId}
              onChange={(e) => setResearchReportId(e.target.value)}
              placeholder="Report ID from ResearchApp"
              className="w-full px-3 py-2 rounded-lg border text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <button
              onClick={() => importResearch.mutate()}
              disabled={!researchReportId || importStatus.research === "loading"}
              className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-primary disabled:opacity-50"
            >
              {importStatus.research === "loading" ? "Importing..." :
               importStatus.research === "done" ? "Imported" : "Import"}
            </button>

            {w?.researchAppReportId && (
              <p className="mt-2 text-xs text-green-600">Linked: {w.researchAppReportId}</p>
            )}
          </div>

          {/* CognitionTwo Import */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-semibold text-slate-900 mb-1">CognitionTwo</h3>
            <p className="text-sm text-slate-500 mb-4">Cognitive analysis & agentic patterns</p>

            <input
              type="text"
              value={cognitionAnalysisId}
              onChange={(e) => setCognitionAnalysisId(e.target.value)}
              placeholder="Analysis ID from CognitionTwo"
              className="w-full px-3 py-2 rounded-lg border text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <button
              onClick={() => importCognition.mutate()}
              disabled={!cognitionAnalysisId || importStatus.cognition === "loading"}
              className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-primary disabled:opacity-50"
            >
              {importStatus.cognition === "loading" ? "Importing..." :
               importStatus.cognition === "done" ? "Imported" : "Import"}
            </button>

            {w?.cognitionTwoAnalysisId && (
              <p className="mt-2 text-xs text-green-600">Linked: {w.cognitionTwoAnalysisId}</p>
            )}
          </div>
        </div>

        {/* Reconcile Button */}
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-2">Reconcile Use Cases</h3>
          <p className="text-sm text-slate-500 mb-4">
            AI will merge use cases from both sources, matching by title/description similarity and combining complementary fields.
          </p>

          <button
            onClick={() => reconcile.mutate()}
            disabled={!w?.researchAppReportId && !w?.cognitionTwoAnalysisId}
            className="py-2.5 px-6 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}
          >
            {reconcile.isPending ? "Reconciling..." : "Run Reconciliation Agent"}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Back to Hub
          </button>
          <button
            onClick={() => navigate(`/workshop/${id}/survey`)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
          >
            Next: Readiness Survey
          </button>
        </div>
      </main>
    </div>
  );
}
