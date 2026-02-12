import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =========================================================================
// WORKSHOPS — One per client engagement
// =========================================================================

export const workshops = pgTable("workshops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  industry: text("industry").default(""),
  facilitatorName: text("facilitator_name").default(""),
  workshopDate: timestamp("workshop_date").defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // draft | in_progress | completed

  // Imported data references
  researchAppReportId: varchar("research_app_report_id"),
  cognitionTwoAnalysisId: varchar("cognition_two_analysis_id"),

  // Raw imported data (stored for reference)
  researchAppData: jsonb("research_app_data"),
  cognitionTwoData: jsonb("cognition_two_data"),

  // Reconciled & enriched data
  reconciledUseCases: jsonb("reconciled_use_cases"), // ReconciledUseCase[]
  challengeResults: jsonb("challenge_results"),
  validationResults: jsonb("validation_results"),
  prioritizationMatrix: jsonb("prioritization_matrix"),
  workflowMaps: jsonb("workflow_maps"),
  dataLineage: jsonb("data_lineage"),
  workshopSynthesis: jsonb("workshop_synthesis"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertWorkshopSchema = createInsertSchema(workshops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type Workshop = typeof workshops.$inferSelect;

// =========================================================================
// SURVEY TEMPLATES — AI-generated per workshop
// =========================================================================

export const surveyTemplates = pgTable("survey_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workshopId: varchar("workshop_id").notNull(),
  dimension: varchar("dimension", { length: 30 }).notNull(), // skills | data | infrastructure | governance
  questions: jsonb("questions").notNull(), // SurveyQuestion[]
  generatedBy: varchar("generated_by", { length: 10 }).default("ai"), // ai | manual
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSurveyTemplateSchema = createInsertSchema(surveyTemplates).omit({
  id: true,
  createdAt: true,
});

export type InsertSurveyTemplate = z.infer<typeof insertSurveyTemplateSchema>;
export type SurveyTemplate = typeof surveyTemplates.$inferSelect;

// =========================================================================
// SURVEY RESPONSES — Client answers
// =========================================================================

export const surveyResponses = pgTable("survey_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workshopId: varchar("workshop_id").notNull(),
  templateId: varchar("template_id").notNull(),
  responses: jsonb("responses").notNull(), // SurveyAnswer[]
  dimensionScores: jsonb("dimension_scores"), // { skills, data, infrastructure, governance }
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).omit({
  id: true,
});

export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;
export type SurveyResponse = typeof surveyResponses.$inferSelect;

// =========================================================================
// USE CASE PRIORITIES — 2x2 matrix scoring
// =========================================================================

export const useCasePriorities = pgTable("use_case_priorities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workshopId: varchar("workshop_id").notNull(),
  useCaseId: varchar("use_case_id").notNull(),
  useCaseTitle: text("use_case_title").default(""),
  impactScore: real("impact_score").notNull().default(0), // 0-10 (Value axis)
  feasibilityScore: real("feasibility_score").notNull().default(0), // 0-10 (Readiness axis)
  quadrant: varchar("quadrant", { length: 20 }).default("deprioritize"), // quick_win | strategic | fill_in | deprioritize
  surveyAlignment: jsonb("survey_alignment"), // Which dimensions affect this score
  overrideReason: text("override_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUseCasePrioritySchema = createInsertSchema(useCasePriorities).omit({
  id: true,
  createdAt: true,
});

export type InsertUseCasePriority = z.infer<typeof insertUseCasePrioritySchema>;
export type UseCasePriority = typeof useCasePriorities.$inferSelect;

// =========================================================================
// CHALLENGE LOG — Audit trail of AI challenges
// =========================================================================

export const challengeLog = pgTable("challenge_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workshopId: varchar("workshop_id").notNull(),
  useCaseId: varchar("use_case_id").default(""),
  challengeType: varchar("challenge_type", { length: 20 }).notNull(), // assumption | kpi | friction | benefit
  originalValue: jsonb("original_value"),
  challengedValue: jsonb("challenged_value"),
  evidence: text("evidence"), // Research citations
  severity: varchar("severity", { length: 10 }).default("medium"), // low | medium | high
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending | accepted | rejected
  respondedBy: varchar("responded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChallengeLogSchema = createInsertSchema(challengeLog).omit({
  id: true,
  createdAt: true,
});

export type InsertChallengeLog = z.infer<typeof insertChallengeLogSchema>;
export type ChallengeLog = typeof challengeLog.$inferSelect;

// =========================================================================
// TYPESCRIPT INTERFACES
// =========================================================================

export interface SurveyQuestion {
  id: string;
  category: string;
  question: string;
  hint: string;
  weight: number; // 1-2
  platformImpact: string[]; // Which use cases this question affects
  useCaseIds: string[]; // Linked use case IDs
}

export interface SurveyAnswer {
  questionId: string;
  maturityLevel: number; // 1-5
  notes: string;
}

export interface DimensionScores {
  skills: number;
  data: number;
  infrastructure: number;
  governance: number;
  overall: number;
}

export interface ReconciledUseCase {
  // Identity
  id: string;
  title: string;
  description: string;
  businessFunction: string;
  subFunction: string;

  // From ResearchApp
  frictionPoint?: string;
  aiPrimitives?: string[];
  hitlCheckpoint?: string;
  strategicTheme?: string;
  revenueBenefit?: number;
  costBenefit?: number;
  cashFlowBenefit?: number;
  riskBenefit?: number;
  totalAnnualValue?: number;
  threeYearNPV?: number;
  priorityScore?: number;
  tokenCost?: number;
  timeToValue?: number;
  dataReadiness?: number;
  effortScore?: number;

  // From CognitionTwo
  agenticPattern?: string;
  horizon?: "H1" | "H2" | "H3";
  horizonLabel?: string;
  businessValue?: number;
  implementationRisk?: number;
  trustTaxPercent?: number;
  lcoai?: number;
  legacyProcessSteps?: string[];
  legacyPainPoints?: string[];
  legacyAnnualCost?: number;
  legacyTranslationTax?: string;
  legacyContextSwitching?: string;
  legacyTimeConsumed?: string;
  agenticPatternRationale?: string;
  agenticAutomationLevel?: "full" | "assisted" | "supervised";
  agenticPrimitives?: string[];
  agenticHitlCheckpoints?: string[];
  agenticTransformSteps?: string[];

  // Workshop additions (from AI Catalyst agents)
  impactScore?: number;
  feasibilityScore?: number;
  quadrant?: string;
  surveyDimensionImpact?: string[];
  challengeFlags?: string[];
  validatedBenefit?: number;
  confidenceLevel?: number;
  dataLineageInfo?: {
    dataSources: string[];
    inputs: string[];
    outputs: string[];
    explainability: string;
    observability: string;
    governance: string;
  };
}

export interface WorkflowStep {
  stepNumber: number;
  stepId: string;
  stepName: string;
  description: string;
  actor: { type: "human" | "system" | "ai_agent"; name: string; role: string };
  duration: { value: number; unit: "minutes" | "hours" | "days"; variability: string };
  systems: string[];
  dataSources: string[];
  isBottleneck: boolean;
  isFrictionPoint: boolean;
  isDecisionPoint: boolean;
  painPoints: string[];
  connectedTo: string[];
}

export interface TargetWorkflowStep extends WorkflowStep {
  isAIEnabled: boolean;
  isHumanInTheLoop: boolean;
  aiCapabilities: string[];
  agentType: string;
  model: string;
  automationLevel: "full" | "assisted" | "supervised" | "manual";
}

export interface WorkflowMap {
  useCaseId: string;
  useCaseTitle: string;
  agenticPattern: string;
  patternRationale: string;
  currentStateWorkflow: WorkflowStep[];
  targetStateWorkflow: TargetWorkflowStep[];
  comparisonMetrics: {
    timeReduction: { before: string; after: string; improvement: string };
    costReduction: { before: string; after: string; improvement: string };
    qualityImprovement: { before: string; after: string; improvement: string };
    throughputIncrease: { before: string; after: string; improvement: string };
  };
}

export interface WorkshopSynthesis {
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
}
