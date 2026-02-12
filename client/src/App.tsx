import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Home from "@/pages/Home";
import Import from "@/pages/Import";
import Survey from "@/pages/Survey";
import Challenge from "@/pages/Challenge";
import Validate from "@/pages/Validate";
import Prioritize from "@/pages/Prioritize";
import Workflows from "@/pages/Workflows";
import DataLineage from "@/pages/DataLineage";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/workshop/:id/import" component={Import} />
        <Route path="/workshop/:id/survey" component={Survey} />
        <Route path="/workshop/:id/challenge" component={Challenge} />
        <Route path="/workshop/:id/validate" component={Validate} />
        <Route path="/workshop/:id/prioritize" component={Prioritize} />
        <Route path="/workshop/:id/workflows" component={Workflows} />
        <Route path="/workshop/:id/lineage" component={DataLineage} />
        <Route path="/workshop/:id/dashboard" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </QueryClientProvider>
  );
}

export default App;
