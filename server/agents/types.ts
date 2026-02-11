import type { ReconciledUseCase, DimensionScores } from "@shared/schema";

// =========================================================================
// AGENT INTERFACES — Extended from CognitionTwo's pattern
// =========================================================================

export interface WorkshopContext {
  workshopId: string;
  companyName: string;
  industry: string;

  // Raw imported data
  researchAppData?: any;
  cognitionTwoData?: any;

  // Reconciled use cases (after Agent 1)
  reconciledUseCases?: ReconciledUseCase[];

  // Survey results (after Agent 2 + user responses)
  surveyDimensionScores?: DimensionScores;

  // Previous agent outputs for chaining
  previousAgentOutputs: Record<string, AgentOutput>;
}

export interface AgentOutput {
  agentName: string;
  insights: string[];
  structuredData?: Record<string, any>;
  confidence: number;
  reasoning: string;
  durationMs: number;
}

export interface Agent {
  name: string;
  role: string;
  goal: string;
  execute(context: WorkshopContext): Promise<AgentOutput>;
}

// =========================================================================
// AGENT-SPECIFIC OUTPUT TYPES
// =========================================================================

export interface ReconciliationOutput extends AgentOutput {
  structuredData: {
    reconciledUseCases: ReconciledUseCase[];
    matchedCount: number;
    researchOnlyCount: number;
    cognitionOnlyCount: number;
    conflicts: Array<{
      useCaseId: string;
      field: string;
      researchValue: any;
      cognitionValue: any;
      resolvedValue: any;
    }>;
  };
}

export interface SurveyGenerationOutput extends AgentOutput {
  structuredData: {
    dimensions: Array<{
      dimension: string;
      questions: Array<{
        id: string;
        category: string;
        question: string;
        hint: string;
        weight: number;
        useCaseIds: string[];
      }>;
    }>;
    totalQuestions: number;
  };
}

export interface ChallengeOutput extends AgentOutput {
  structuredData: {
    challenges: Array<{
      useCaseId: string;
      challengeType: "assumption" | "kpi" | "friction" | "benefit";
      fieldName: string;
      originalValue: any;
      challengedValue: any;
      evidence: string;
      severity: "low" | "medium" | "high";
    }>;
    totalChallenges: number;
    highSeverityCount: number;
  };
}

export interface ValidationOutput extends AgentOutput {
  structuredData: {
    validations: Array<{
      useCaseId: string;
      originalBenefit: number;
      validatedBenefit: number;
      confidenceLevel: number;
      adjustmentReason: string;
      benchmarkSource: string;
      riskFlags: string[];
    }>;
    totalOriginalValue: number;
    totalValidatedValue: number;
    averageConfidence: number;
  };
}

export interface PrioritizationOutput extends AgentOutput {
  structuredData: {
    priorities: Array<{
      useCaseId: string;
      useCaseTitle: string;
      impactScore: number;
      feasibilityScore: number;
      quadrant: "quick_win" | "strategic" | "fill_in" | "deprioritize";
      impactBreakdown: {
        annualValueWeight: number;
        strategicAlignmentWeight: number;
        scopeWeight: number;
        benefitMixWeight: number;
        npvWeight: number;
      };
      feasibilityBreakdown: {
        surveyScoreWeight: number;
        dataReadinessWeight: number;
        complexityWeight: number;
        changeManagementWeight: number;
        infraAlignmentWeight: number;
      };
    }>;
    quickWinCount: number;
    strategicCount: number;
  };
}

export interface WorkflowOutput extends AgentOutput {
  structuredData: {
    workflows: Array<{
      useCaseId: string;
      useCaseTitle: string;
      agenticPattern: string;
      patternRationale: string;
      currentStateWorkflow: any[];
      targetStateWorkflow: any[];
      comparisonMetrics: {
        timeReduction: { before: string; after: string; improvement: string };
        costReduction: { before: string; after: string; improvement: string };
        qualityImprovement: { before: string; after: string; improvement: string };
        throughputIncrease: { before: string; after: string; improvement: string };
      };
    }>;
  };
}

export interface DataLineageOutput extends AgentOutput {
  structuredData: {
    lineages: Array<{
      useCaseId: string;
      dataSources: string[];
      inputs: string[];
      outputs: string[];
      explainability: string;
      observability: string;
      governance: string;
    }>;
  };
}

export interface SynthesisOutput extends AgentOutput {
  structuredData: {
    executiveSummary: string;
    topRecommendations: string[];
    implementationRoadmap: {
      thirtyDay: string[];
      sixtyDay: string[];
      ninetyDay: string[];
    };
    riskRegister: Array<{
      risk: string;
      likelihood: string;
      impact: string;
      mitigation: string;
    }>;
    resourceRequirements: string[];
    totalEstimatedValue: number;
    topQuickWins: string[];
  };
}
