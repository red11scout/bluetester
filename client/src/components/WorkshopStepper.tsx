import { useLocation } from "wouter";

interface WorkshopStepperProps {
  currentStep: number;
  workshopId: string;
  companyName?: string;
}

const STEPS = [
  { num: 1, label: "Import", path: "import" },
  { num: 2, label: "Survey", path: "survey" },
  { num: 3, label: "Challenge", path: "challenge" },
  { num: 4, label: "Validate", path: "validate" },
  { num: 5, label: "Prioritize", path: "prioritize" },
  { num: 6, label: "Visualize", path: "workflows" },
  { num: 7, label: "Lineage", path: "lineage" },
  { num: 8, label: "Dashboard", path: "dashboard" },
];

export default function WorkshopStepper({ currentStep, workshopId, companyName }: WorkshopStepperProps) {
  const [, navigate] = useLocation();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs cursor-pointer"
              style={{ background: "linear-gradient(135deg, #001278, #02a2fd)" }}
              onClick={() => navigate("/")}
            >
              AC
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900">
                {companyName || "Workshop"}
              </span>
              <span className="text-xs text-slate-400 ml-2">AI Catalyst</span>
            </div>
          </div>
        </div>

        {/* Step navigation */}
        <div className="flex items-center gap-1 pb-3 overflow-x-auto">
          {STEPS.map((step) => {
            const isActive = step.num === currentStep;
            const isCompleted = step.num < currentStep;

            return (
              <button
                key={step.num}
                onClick={() => navigate(`/workshop/${workshopId}/${step.path}`)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-white"
                    : isCompleted
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive ? "bg-white/20" :
                  isCompleted ? "bg-green-200" : "bg-slate-200"
                }`}>
                  {isCompleted ? "\u2713" : step.num}
                </span>
                {step.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
