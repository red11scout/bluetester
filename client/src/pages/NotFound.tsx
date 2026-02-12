import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-600 mb-6">Page not found</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-primary"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
