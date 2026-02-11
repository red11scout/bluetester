import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [facilitatorName, setFacilitatorName] = useState("");

  const { data: workshops = [], isLoading } = useQuery({
    queryKey: ["/api/workshops"],
  });

  const createWorkshop = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/workshops", {
        companyName,
        industry,
        facilitatorName,
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/workshops"] });
      navigate(`/workshop/${data.id}/import`);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                 style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}>
              AC
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">BlueAlly AI Catalyst</h1>
              <p className="text-xs text-slate-500">AI Use Case Workshop Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            AI Use Case Workshop Platform
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Import research data, challenge assumptions, validate benefits, prioritize use cases,
            and visualize AI-powered workflows — all in one guided workshop experience.
          </p>
        </div>

        {/* Create New Workshop */}
        <div className="bg-white rounded-xl border shadow-sm p-8 mb-10 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-slate-900 mb-6">Start New Workshop</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Nations Roof"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Commercial Roofing"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facilitator</label>
              <input
                type="text"
                value={facilitatorName}
                onChange={(e) => setFacilitatorName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button
              onClick={() => createWorkshop.mutate()}
              disabled={!companyName || createWorkshop.isPending}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}
            >
              {createWorkshop.isPending ? "Creating..." : "Create Workshop"}
            </button>
          </div>
        </div>

        {/* Existing Workshops */}
        <div>
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Recent Workshops</h3>

          {isLoading ? (
            <p className="text-slate-500">Loading...</p>
          ) : (workshops as any[]).length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-slate-500">
              No workshops yet. Create one above to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(workshops as any[]).map((w: any) => (
                <div
                  key={w.id}
                  onClick={() => navigate(`/workshop/${w.id}/import`)}
                  className="bg-white rounded-xl border shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">{w.companyName}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      w.status === "completed" ? "bg-green-100 text-green-700" :
                      w.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {w.status === "in_progress" ? "In Progress" : w.status}
                    </span>
                  </div>
                  {w.industry && (
                    <p className="text-sm text-slate-500 mb-2">{w.industry}</p>
                  )}
                  <p className="text-xs text-slate-400">
                    {new Date(w.createdAt).toLocaleDateString()}
                    {w.facilitatorName && ` | ${w.facilitatorName}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workshop Steps Legend */}
        <div className="mt-12 bg-white rounded-xl border p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Workshop Flow</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { num: 1, label: "Import & Reconcile", desc: "Pull data from both apps" },
              { num: 2, label: "Readiness Survey", desc: "4-dimension AI readiness assessment" },
              { num: 3, label: "Challenge", desc: "AI challenges assumptions" },
              { num: 4, label: "Validate", desc: "Verify benefits vs benchmarks" },
              { num: 5, label: "Prioritize", desc: "2x2 Impact vs Feasibility" },
              { num: 6, label: "Visualize", desc: "Current vs AI workflows" },
              { num: 7, label: "Data Lineage", desc: "Sources, governance, observability" },
              { num: 8, label: "Decide", desc: "Dashboard & export" },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                     style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}>
                  {step.num}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{step.label}</p>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
