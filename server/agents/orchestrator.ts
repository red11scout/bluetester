import type { WorkshopContext, AgentOutput, ReconciliationOutput, SurveyGenerationOutput, ChallengeOutput, ValidationOutput, PrioritizationOutput, WorkflowOutput, DataLineageOutput, SynthesisOutput } from "./types";
import { importReconciliationAgent } from "./import-agent";
import { surveyGenerationAgent } from "./survey-agent";
import { challengeAgent } from "./challenge-agent";
import { validationAgent } from "./validation-agent";
import { prioritizationAgent } from "./prioritization-agent";
import { workflowAgent } from "./workflow-agent";
import { lineageAgent } from "./lineage-agent";
import { synthesisAgent } from "./synthesis-agent";

/**
 * Workshop Agent Orchestration Pipeline
 *
 * Follows CognitionTwo's runAgentCrew() pattern:
 *
 * Sequential:  Agent 1 (Import Reconciliation)
 * Sequential:  Agent 2 (Survey Generation) — needs reconciled use cases
 *   [User fills survey — async break]
 * Parallel:    Agent 3 (Challenge) + Agent 4 (Validate) — both need survey + use cases
 * Sequential:  Agent 5 (Prioritize) — needs challenge + validation results
 * Parallel:    Agent 6 (Workflow) + Agent 7 (Data Lineage) — both need prioritized use cases
 * Sequential:  Agent 8 (Synthesis) — needs everything
 */

export async function runReconciliation(context: WorkshopContext): Promise<ReconciliationOutput> {
  console.log("[Orchestrator] Starting Import Reconciliation Agent...");
  const startTime = Date.now();

  const output = await importReconciliationAgent.execute(context) as ReconciliationOutput;
  context.previousAgentOutputs["Import Reconciliation Agent"] = output;

  console.log(
    `[Orchestrator] Reconciliation complete in ${Date.now() - startTime}ms. ` +
    `${output.structuredData?.reconciledUseCases?.length || 0} use cases reconciled.`
  );

  return output;
}

export async function runSurveyGeneration(context: WorkshopContext): Promise<SurveyGenerationOutput> {
  console.log("[Orchestrator] Starting Survey Generation Agent...");
  const startTime = Date.now();

  const output = await surveyGenerationAgent.execute(context) as SurveyGenerationOutput;
  context.previousAgentOutputs["Survey Generation Agent"] = output;

  console.log(
    `[Orchestrator] Survey generation complete in ${Date.now() - startTime}ms. ` +
    `${output.structuredData?.totalQuestions || 0} questions generated.`
  );

  return output;
}

export async function runChallengeAndValidation(
  context: WorkshopContext
): Promise<{ challenge: ChallengeOutput; validation: ValidationOutput }> {
  console.log("[Orchestrator] Starting Challenge + Validation Agents in parallel...");
  const startTime = Date.now();

  // Run agents 3 & 4 in parallel
  const [challengeOutput, validationOutput] = await Promise.all([
    challengeAgent.execute(context) as Promise<ChallengeOutput>,
    validationAgent.execute(context) as Promise<ValidationOutput>,
  ]);

  context.previousAgentOutputs["Assumption Challenge Agent"] = challengeOutput;
  context.previousAgentOutputs["Benefit Validation Agent"] = validationOutput;

  console.log(
    `[Orchestrator] Challenge + Validation complete in ${Date.now() - startTime}ms. ` +
    `${challengeOutput.structuredData.totalChallenges} challenges, ` +
    `${validationOutput.structuredData.validations.length} validations.`
  );

  return { challenge: challengeOutput, validation: validationOutput };
}

export async function runPrioritization(context: WorkshopContext): Promise<PrioritizationOutput> {
  console.log("[Orchestrator] Starting Prioritization Agent...");
  const startTime = Date.now();

  const output = await prioritizationAgent.execute(context) as PrioritizationOutput;
  context.previousAgentOutputs["Prioritization Agent"] = output;

  console.log(
    `[Orchestrator] Prioritization complete in ${Date.now() - startTime}ms. ` +
    `${output.structuredData.quickWinCount} quick wins, ${output.structuredData.strategicCount} strategic.`
  );

  return output;
}

export async function runWorkflowsAndLineage(
  context: WorkshopContext
): Promise<{ workflows: WorkflowOutput; lineage: DataLineageOutput }> {
  console.log("[Orchestrator] Starting Workflow + Data Lineage Agents in parallel...");
  const startTime = Date.now();

  const [workflowOutput, lineageOutput] = await Promise.all([
    workflowAgent.execute(context) as Promise<WorkflowOutput>,
    lineageAgent.execute(context) as Promise<DataLineageOutput>,
  ]);

  context.previousAgentOutputs["Workflow Visualization Agent"] = workflowOutput;
  context.previousAgentOutputs["Data Lineage Agent"] = lineageOutput;

  console.log(
    `[Orchestrator] Workflows + Lineage complete in ${Date.now() - startTime}ms. ` +
    `${workflowOutput.structuredData.workflows.length} workflows, ` +
    `${lineageOutput.structuredData.lineages.length} lineages.`
  );

  return { workflows: workflowOutput, lineage: lineageOutput };
}

export async function runSynthesis(context: WorkshopContext): Promise<SynthesisOutput> {
  console.log("[Orchestrator] Starting Workshop Synthesis Agent...");
  const startTime = Date.now();

  const output = await synthesisAgent.execute(context) as SynthesisOutput;
  context.previousAgentOutputs["Workshop Synthesis Agent"] = output;

  console.log(
    `[Orchestrator] Synthesis complete in ${Date.now() - startTime}ms. ` +
    `${output.structuredData.topRecommendations?.length || 0} recommendations.`
  );

  return output;
}
