import { useState, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import WorkshopStepper from "@/components/WorkshopStepper";

interface SurveyQuestion {
  id: string;
  category: string;
  question: string;
  hint: string;
  weight: number;
  useCaseIds: string[];
}

interface DimensionTemplate {
  id: string;
  workshopId: string;
  dimension: string;
  questions: SurveyQuestion[];
}

const DIMENSION_META: Record<string, { label: string; color: string; desc: string }> = {
  skills: { label: "Skills Assessment", color: "#001278", desc: "AI/ML expertise, technical proficiency, training, change readiness" },
  data: { label: "Data Readiness", color: "#02a2fd", desc: "Data availability, quality, governance, integration, architecture" },
  infrastructure: { label: "Infrastructure", color: "#36bf78", desc: "Compute & storage, networking, DevOps/MLOps, AI infrastructure" },
  governance: { label: "Governance Framework", color: "#7c3aed", desc: "AI policies, compliance, risk management, accountability, ethics" },
};

const MATURITY_LABELS: Record<number, string> = {
  1: "Ad hoc",
  2: "Initial",
  3: "Defined",
  4: "Managed",
  5: "Optimized",
};

export default function Survey() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [activeDimension, setActiveDimension] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { maturityLevel: number; notes: string }>>({});

  const { data: workshop } = useQuery({
    queryKey: [`/api/workshops/${id}`],
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: [`/api/workshops/${id}/survey`],
  });

  const { data: existingScores } = useQuery({
    queryKey: [`/api/workshops/${id}/survey/scores`],
  });

  const w = workshop as any;
  const surveyTemplates = (templates || []) as DimensionTemplate[];
  const hasTemplates = surveyTemplates.length > 0;

  const generateMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/workshops/${id}/survey/generate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}/survey`] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) => apiRequest("PUT", `/api/workshops/${id}/survey/responses`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workshops/${id}/survey/scores`] });
    },
  });

  // Calculate real-time dimension scores
  const dimensionScores = useMemo(() => {
    const scores: Record<string, { total: number; weightedTotal: number; count: number; weightedCount: number }> = {};

    for (const tpl of surveyTemplates) {
      const dim = tpl.dimension;
      scores[dim] = { total: 0, weightedTotal: 0, count: 0, weightedCount: 0 };

      for (const q of tpl.questions) {
        const answer = answers[q.id];
        if (answer && answer.maturityLevel > 0) {
          scores[dim].total += answer.maturityLevel;
          scores[dim].weightedTotal += answer.maturityLevel * (q.weight || 1);
          scores[dim].count += 1;
          scores[dim].weightedCount += q.weight || 1;
        }
      }
    }

    const result: Record<string, number> = {};
    for (const [dim, s] of Object.entries(scores)) {
      result[dim] = s.weightedCount > 0 ? Math.round((s.weightedTotal / s.weightedCount) * 10) / 10 : 0;
    }
    result.overall = Object.values(result).filter(v => v > 0).length > 0
      ? Math.round(Object.values(result).reduce((a, b) => a + b, 0) / Object.values(result).filter(v => v > 0).length * 10) / 10
      : 0;

    return result;
  }, [answers, surveyTemplates]);

  const totalAnswered = Object.values(answers).filter(a => a.maturityLevel > 0).length;
  const totalQuestions = surveyTemplates.reduce((sum, t) => sum + t.questions.length, 0);
  const isComplete = totalAnswered === totalQuestions && totalQuestions > 0;

  function handleAnswer(questionId: string, maturityLevel: number) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || { notes: "" }), maturityLevel },
    }));
  }

  function handleNotes(questionId: string, notes: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...(prev[questionId] || { maturityLevel: 0 }), notes },
    }));
  }

  async function handleSave() {
    const responseArray = Object.entries(answers).map(([questionId, a]) => ({
      questionId,
      maturityLevel: a.maturityLevel,
      notes: a.notes,
    }));

    const dimScores = {
      skills: dimensionScores.skills || 0,
      data: dimensionScores.data || 0,
      infrastructure: dimensionScores.infrastructure || 0,
      governance: dimensionScores.governance || 0,
      overall: dimensionScores.overall || 0,
    };

    await saveMutation.mutateAsync({
      templateId: surveyTemplates[0]?.id || "",
      responses: responseArray,
      dimensionScores: dimScores,
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkshopStepper currentStep={2} workshopId={id!} companyName={w?.companyName} />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Readiness Survey</h2>
        <p className="text-slate-600 mb-8">
          AI-generated 4-dimension survey tailored to your company's use cases.
          Rate each question on a 1-5 maturity scale.
        </p>

        {/* Score Overview + Radar */}
        {hasTemplates && (
          <div className="grid gap-4 md:grid-cols-5 mb-8">
            {Object.entries(DIMENSION_META).map(([key, meta]) => (
              <div key={key} className="bg-white rounded-xl border p-4 text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ backgroundColor: meta.color }} />
                <p className="text-xs text-slate-500 mb-1">{meta.label}</p>
                <p className="text-2xl font-bold" style={{ color: meta.color }}>
                  {dimensionScores[key] || "—"}
                </p>
                <p className="text-[10px] text-slate-400">/ 5.0</p>
              </div>
            ))}
            <div className="bg-white rounded-xl border p-4 text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-2 bg-slate-800" />
              <p className="text-xs text-slate-500 mb-1">Overall</p>
              <p className="text-2xl font-bold text-slate-900">
                {dimensionScores.overall || "—"}
              </p>
              <p className="text-[10px] text-slate-400">/ 5.0</p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {hasTemplates && (
          <div className="bg-white rounded-xl border p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Progress</span>
              <span className="text-sm font-medium text-slate-900">{totalAnswered} / {totalQuestions} answered</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0}%`,
                  background: "linear-gradient(90deg, #001278, #02a2fd)",
                }}
              />
            </div>
          </div>
        )}

        {/* Generate button (no templates yet) */}
        {!hasTemplates && (
          <div className="bg-white rounded-xl border p-8 mb-8 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}>
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Generate AI-Tailored Survey</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              The Survey Generation Agent will create questions specific to your company's
              reconciled use cases across 4 readiness dimensions.
            </p>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="py-2.5 px-6 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}
            >
              {generateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Survey...
                </span>
              ) : "Generate Survey"}
            </button>
            {generateMutation.isError && (
              <p className="text-sm text-red-600 mt-3">
                {(generateMutation.error as any)?.message || "Failed to generate survey"}
              </p>
            )}
          </div>
        )}

        {/* Dimension tabs + questions */}
        {hasTemplates && (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {surveyTemplates.map((tpl) => {
                const meta = DIMENSION_META[tpl.dimension] || { label: tpl.dimension, color: "#666" };
                const answeredInDim = tpl.questions.filter(q => answers[q.id]?.maturityLevel > 0).length;
                const isActive = activeDimension === tpl.dimension;
                return (
                  <button
                    key={tpl.dimension}
                    onClick={() => setActiveDimension(isActive ? null : tpl.dimension)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap border transition-all ${
                      isActive
                        ? "text-white border-transparent shadow-md"
                        : "text-slate-700 bg-white border-slate-200 hover:border-slate-300"
                    }`}
                    style={isActive ? { backgroundColor: meta.color } : {}}
                  >
                    <div className={`w-2 h-2 rounded-full ${isActive ? "bg-white" : ""}`} style={!isActive ? { backgroundColor: meta.color } : {}} />
                    {meta.label}
                    <span className={`text-xs ${isActive ? "text-white/70" : "text-slate-400"}`}>
                      {answeredInDim}/{tpl.questions.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Questions for active dimension (or show all) */}
            {surveyTemplates
              .filter((tpl) => !activeDimension || tpl.dimension === activeDimension)
              .map((tpl) => {
                const meta = DIMENSION_META[tpl.dimension] || { label: tpl.dimension, color: "#666" };
                return (
                  <div key={tpl.dimension} className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: meta.color }} />
                      <h3 className="text-lg font-semibold text-slate-900">{meta.label}</h3>
                      <span className="text-xs text-slate-400">{meta.desc}</span>
                    </div>

                    <div className="space-y-4">
                      {tpl.questions.map((q, idx) => {
                        const answer = answers[q.id];
                        const selected = answer?.maturityLevel || 0;
                        return (
                          <div key={q.id} className="bg-white rounded-xl border p-5">
                            <div className="flex items-start gap-3 mb-3">
                              <span
                                className="text-xs font-mono px-2 py-0.5 rounded text-white shrink-0 mt-0.5"
                                style={{ backgroundColor: meta.color }}
                              >
                                {q.id}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900 mb-1">{q.question}</p>
                                {q.hint && (
                                  <p className="text-xs text-slate-400 italic">{q.hint}</p>
                                )}
                                {q.weight > 1 && (
                                  <span className="inline-block mt-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                    Critical (2x weight)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Maturity level selector */}
                            <div className="flex gap-2 mb-3">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <button
                                  key={level}
                                  onClick={() => handleAnswer(q.id, level)}
                                  className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium border transition-all ${
                                    selected === level
                                      ? "text-white border-transparent shadow-sm"
                                      : "text-slate-600 bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                  }`}
                                  style={selected === level ? { backgroundColor: meta.color } : {}}
                                >
                                  <div className="text-lg font-bold">{level}</div>
                                  <div className={`${selected === level ? "text-white/70" : "text-slate-400"}`}>
                                    {MATURITY_LABELS[level]}
                                  </div>
                                </button>
                              ))}
                            </div>

                            {/* Notes */}
                            <input
                              type="text"
                              placeholder="Optional notes..."
                              value={answer?.notes || ""}
                              onChange={(e) => handleNotes(q.id, e.target.value)}
                              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

            {/* Save */}
            <div className="bg-white rounded-xl border p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Save Survey Responses</h3>
                  <p className="text-sm text-slate-500">
                    {isComplete
                      ? "All questions answered. Ready to save."
                      : `${totalQuestions - totalAnswered} questions remaining.`}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending || totalAnswered === 0}
                  className="py-2.5 px-6 rounded-lg text-sm font-medium text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}
                >
                  {saveMutation.isPending ? "Saving..." : "Save Responses"}
                </button>
              </div>
              {saveMutation.isSuccess && (
                <p className="text-sm text-green-600 mt-3">Responses saved successfully.</p>
              )}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate(`/workshop/${id}/import`)}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Back
          </button>
          <button
            onClick={() => navigate(`/workshop/${id}/challenge`)}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
          >
            Next: Challenge Assumptions
          </button>
        </div>
      </main>
    </div>
  );
}
