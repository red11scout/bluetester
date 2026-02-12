import type { Express } from "express";
import type { Server } from "http";
import { db } from "./db";
import { workshops, surveyTemplates, surveyResponses, useCasePriorities, challengeLog } from "@shared/schema";
import { eq } from "drizzle-orm";
import { runReconciliation, runSurveyGeneration, runChallengeAndValidation, runPrioritization, runWorkflowsAndLineage, runSynthesis } from "./agents/orchestrator";
import type { WorkshopContext } from "./agents/types";
import type { ReconciledUseCase } from "@shared/schema";
import { generateExcelReport, generateHTMLReport } from "./export-service";

export async function registerRoutes(server: Server, app: Express) {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "ai-catalyst", version: "1.0.0" });
  });

  // =========================================================================
  // WORKSHOP CRUD
  // =========================================================================

  app.post("/api/workshops", async (req, res) => {
    try {
      const { companyName, industry, facilitatorName } = req.body;
      if (!companyName) {
        return res.status(400).json({ error: "companyName is required" });
      }

      const [workshop] = await db.insert(workshops).values({
        companyName,
        industry: industry || "",
        facilitatorName: facilitatorName || "",
        status: "draft",
      }).returning();

      res.json(workshop);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workshops", async (_req, res) => {
    try {
      const all = await db.select().from(workshops).orderBy(workshops.createdAt);
      res.json(all);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workshops/:id", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      res.json(workshop);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/workshops/:id", async (req, res) => {
    try {
      await db.delete(workshops).where(eq(workshops.id, req.params.id));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // IMPORT FROM EXTERNAL APPS
  // =========================================================================

  app.post("/api/workshops/:id/import/research", async (req, res) => {
    try {
      const { reportId, apiUrl } = req.body;
      const baseUrl = apiUrl || process.env.RESEARCH_APP_URL || "https://smart-report-ai-claude-style.replit.app";

      const response = await fetch(`${baseUrl}/api/reports/${reportId}`);
      if (!response.ok) {
        return res.status(400).json({ error: `Failed to fetch from ResearchApp: ${response.statusText}` });
      }

      const reportData = await response.json();

      await db.update(workshops)
        .set({
          researchAppReportId: reportId,
          researchAppData: reportData,
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, req.params.id));

      res.json({ success: true, companyName: reportData.companyName });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workshops/:id/import/cognition", async (req, res) => {
    try {
      const { analysisId, apiUrl } = req.body;
      const baseUrl = apiUrl || process.env.COGNITION_APP_URL || "https://cognitive-analyis-with-claude.replit.app";

      const response = await fetch(`${baseUrl}/api/analyses/${analysisId}`);
      if (!response.ok) {
        return res.status(400).json({ error: `Failed to fetch from CognitionTwo: ${response.statusText}` });
      }

      const analysisData = await response.json();

      await db.update(workshops)
        .set({
          cognitionTwoAnalysisId: analysisId,
          cognitionTwoData: analysisData,
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, req.params.id));

      res.json({ success: true, companyName: analysisData.companyName || analysisData.organizationProfile?.companyName });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // RECONCILIATION (Agent 1)
  // =========================================================================

  app.post("/api/workshops/:id/reconcile", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const context: WorkshopContext = {
        workshopId: workshop.id,
        companyName: workshop.companyName,
        industry: workshop.industry || "",
        researchAppData: workshop.researchAppData,
        cognitionTwoData: workshop.cognitionTwoData,
        previousAgentOutputs: {},
      };

      const result = await runReconciliation(context);

      // Save reconciled use cases to workshop
      await db.update(workshops)
        .set({
          reconciledUseCases: result.structuredData.reconciledUseCases,
          status: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, req.params.id));

      res.json({
        success: true,
        useCaseCount: result.structuredData.reconciledUseCases.length,
        matchedCount: result.structuredData.matchedCount,
        conflicts: result.structuredData.conflicts,
        insights: result.insights,
        durationMs: result.durationMs,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workshops/:id/use-cases", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      res.json(workshop.reconciledUseCases || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // SURVEY (Agent 2)
  // =========================================================================

  app.post("/api/workshops/:id/survey/generate", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const useCases = (workshop.reconciledUseCases as ReconciledUseCase[]) || [];
      if (useCases.length === 0) {
        return res.status(400).json({ error: "No reconciled use cases found. Run import and reconciliation first." });
      }

      const context: WorkshopContext = {
        workshopId: workshop.id,
        companyName: workshop.companyName,
        industry: workshop.industry || "",
        reconciledUseCases: useCases,
        previousAgentOutputs: {},
      };

      const result = await runSurveyGeneration(context);

      // Save survey templates to DB (one row per dimension)
      for (const dim of result.structuredData.dimensions) {
        await db.insert(surveyTemplates).values({
          workshopId: workshop.id,
          dimension: dim.dimension,
          questions: dim.questions,
          generatedBy: "ai",
        });
      }

      res.json({
        success: true,
        totalQuestions: result.structuredData.totalQuestions,
        dimensions: result.structuredData.dimensions.map((d: any) => ({
          dimension: d.dimension,
          questionCount: d.questions.length,
        })),
        insights: result.insights,
        durationMs: result.durationMs,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workshops/:id/survey", async (req, res) => {
    try {
      const templates = await db.select().from(surveyTemplates).where(eq(surveyTemplates.workshopId, req.params.id));
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/workshops/:id/survey/responses", async (req, res) => {
    try {
      const { templateId, responses, dimensionScores } = req.body;

      const [saved] = await db.insert(surveyResponses).values({
        workshopId: req.params.id,
        templateId,
        responses,
        dimensionScores,
      }).returning();

      // Update workshop status
      await db.update(workshops)
        .set({
          status: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, req.params.id));

      res.json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workshops/:id/survey/scores", async (req, res) => {
    try {
      const allResponses = await db.select().from(surveyResponses).where(eq(surveyResponses.workshopId, req.params.id));
      const latest = allResponses[allResponses.length - 1];
      res.json(latest?.dimensionScores || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // CHALLENGE & VALIDATE (Agents 3 & 4)
  // =========================================================================

  app.post("/api/workshops/:id/challenge-and-validate", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const useCases = (workshop.reconciledUseCases as ReconciledUseCase[]) || [];
      if (useCases.length === 0) {
        return res.status(400).json({ error: "No reconciled use cases. Run reconciliation first." });
      }

      // Get survey scores if available
      const allResponses = await db.select().from(surveyResponses).where(eq(surveyResponses.workshopId, req.params.id));
      const latestResponse = allResponses[allResponses.length - 1];

      const context: WorkshopContext = {
        workshopId: workshop.id,
        companyName: workshop.companyName,
        industry: workshop.industry || "",
        reconciledUseCases: useCases,
        surveyDimensionScores: latestResponse?.dimensionScores as any,
        previousAgentOutputs: {},
      };

      const { challenge, validation } = await runChallengeAndValidation(context);

      // Save challenge results to challenge_log table
      for (const c of challenge.structuredData.challenges) {
        await db.insert(challengeLog).values({
          workshopId: workshop.id,
          useCaseId: c.useCaseId,
          challengeType: c.challengeType,
          originalValue: c.originalValue,
          challengedValue: c.challengedValue,
          evidence: c.evidence,
          severity: c.severity,
          status: "pending",
        });
      }

      // Save validation results to workshop
      await db.update(workshops)
        .set({
          challengeResults: challenge.structuredData,
          validationResults: validation.structuredData,
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, req.params.id));

      res.json({
        success: true,
        challenge: {
          totalChallenges: challenge.structuredData.totalChallenges,
          highSeverityCount: challenge.structuredData.highSeverityCount,
          insights: challenge.insights,
          durationMs: challenge.durationMs,
        },
        validation: {
          totalOriginalValue: validation.structuredData.totalOriginalValue,
          totalValidatedValue: validation.structuredData.totalValidatedValue,
          averageConfidence: validation.structuredData.averageConfidence,
          insights: validation.insights,
          durationMs: validation.durationMs,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workshops/:id/challenge", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const useCases = (workshop.reconciledUseCases as ReconciledUseCase[]) || [];
      const allResponses = await db.select().from(surveyResponses).where(eq(surveyResponses.workshopId, req.params.id));
      const latestResponse = allResponses[allResponses.length - 1];

      const context: WorkshopContext = {
        workshopId: workshop.id,
        companyName: workshop.companyName,
        industry: workshop.industry || "",
        reconciledUseCases: useCases,
        surveyDimensionScores: latestResponse?.dimensionScores as any,
        previousAgentOutputs: {},
      };

      const { challenge } = await runChallengeAndValidation(context);

      for (const c of challenge.structuredData.challenges) {
        await db.insert(challengeLog).values({
          workshopId: workshop.id,
          useCaseId: c.useCaseId,
          challengeType: c.challengeType,
          originalValue: c.originalValue,
          challengedValue: c.challengedValue,
          evidence: c.evidence,
          severity: c.severity,
          status: "pending",
        });
      }

      await db.update(workshops)
        .set({ challengeResults: challenge.structuredData, updatedAt: new Date() })
        .where(eq(workshops.id, req.params.id));

      res.json({
        success: true,
        totalChallenges: challenge.structuredData.totalChallenges,
        highSeverityCount: challenge.structuredData.highSeverityCount,
        insights: challenge.insights,
        durationMs: challenge.durationMs,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workshops/:id/validate", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const useCases = (workshop.reconciledUseCases as ReconciledUseCase[]) || [];
      const allResponses = await db.select().from(surveyResponses).where(eq(surveyResponses.workshopId, req.params.id));
      const latestResponse = allResponses[allResponses.length - 1];

      const context: WorkshopContext = {
        workshopId: workshop.id,
        companyName: workshop.companyName,
        industry: workshop.industry || "",
        reconciledUseCases: useCases,
        surveyDimensionScores: latestResponse?.dimensionScores as any,
        previousAgentOutputs: {},
      };

      const { validation } = await runChallengeAndValidation(context);

      await db.update(workshops)
        .set({ validationResults: validation.structuredData, updatedAt: new Date() })
        .where(eq(workshops.id, req.params.id));

      res.json({
        success: true,
        totalOriginalValue: validation.structuredData.totalOriginalValue,
        totalValidatedValue: validation.structuredData.totalValidatedValue,
        averageConfidence: validation.structuredData.averageConfidence,
        insights: validation.insights,
        durationMs: validation.durationMs,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workshops/:id/challenges", async (req, res) => {
    try {
      const challenges = await db.select().from(challengeLog).where(eq(challengeLog.workshopId, req.params.id));
      res.json(challenges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/workshops/:id/challenge/:logId", async (req, res) => {
    try {
      const { status, respondedBy } = req.body;
      const [updated] = await db.update(challengeLog)
        .set({ status, respondedBy })
        .where(eq(challengeLog.id, req.params.logId))
        .returning();
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // PRIORITIZATION (Agent 5)
  // =========================================================================

  app.post("/api/workshops/:id/prioritize", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const useCases = (workshop.reconciledUseCases as ReconciledUseCase[]) || [];
      if (useCases.length === 0) {
        return res.status(400).json({ error: "No reconciled use cases. Run reconciliation first." });
      }

      const allResponses = await db.select().from(surveyResponses).where(eq(surveyResponses.workshopId, req.params.id));
      const latestResponse = allResponses[allResponses.length - 1];

      const context: WorkshopContext = {
        workshopId: workshop.id,
        companyName: workshop.companyName,
        industry: workshop.industry || "",
        reconciledUseCases: useCases,
        surveyDimensionScores: latestResponse?.dimensionScores as any,
        previousAgentOutputs: {},
      };

      const result = await runPrioritization(context);

      // Save priorities to DB
      for (const p of result.structuredData.priorities) {
        await db.insert(useCasePriorities).values({
          workshopId: workshop.id,
          useCaseId: p.useCaseId,
          useCaseTitle: p.useCaseTitle,
          impactScore: p.impactScore,
          feasibilityScore: p.feasibilityScore,
          quadrant: p.quadrant,
          surveyAlignment: { impact: p.impactBreakdown, feasibility: p.feasibilityBreakdown },
        });
      }

      // Save matrix to workshop
      await db.update(workshops)
        .set({
          prioritizationMatrix: result.structuredData,
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, req.params.id));

      res.json({
        success: true,
        quickWinCount: result.structuredData.quickWinCount,
        strategicCount: result.structuredData.strategicCount,
        totalPrioritized: result.structuredData.priorities.length,
        insights: result.insights,
        durationMs: result.durationMs,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workshops/:id/matrix", async (req, res) => {
    try {
      const priorities = await db.select().from(useCasePriorities).where(eq(useCasePriorities.workshopId, req.params.id));
      res.json(priorities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/workshops/:id/matrix/:useCaseId", async (req, res) => {
    try {
      const { impactScore, feasibilityScore, overrideReason } = req.body;

      const quadrant = getQuadrant(impactScore, feasibilityScore);

      const [updated] = await db.update(useCasePriorities)
        .set({ impactScore, feasibilityScore, quadrant, overrideReason })
        .where(eq(useCasePriorities.useCaseId, req.params.useCaseId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // WORKFLOW VISUALIZATION (Agent 6)
  // =========================================================================

  app.post("/api/workshops/:id/workflows", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const useCases = (workshop.reconciledUseCases as ReconciledUseCase[]) || [];
      const allResponses = await db.select().from(surveyResponses).where(eq(surveyResponses.workshopId, req.params.id));
      const latestResponse = allResponses[allResponses.length - 1];

      const context: WorkshopContext = {
        workshopId: workshop.id,
        companyName: workshop.companyName,
        industry: workshop.industry || "",
        reconciledUseCases: useCases,
        surveyDimensionScores: latestResponse?.dimensionScores as any,
        previousAgentOutputs: {},
      };

      const { workflows, lineage } = await runWorkflowsAndLineage(context);

      await db.update(workshops)
        .set({
          workflowMaps: workflows.structuredData.workflows,
          dataLineage: lineage.structuredData.lineages,
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, req.params.id));

      res.json({
        success: true,
        workflowCount: workflows.structuredData.workflows.length,
        lineageCount: lineage.structuredData.lineages.length,
        workflowInsights: workflows.insights,
        lineageInsights: lineage.insights,
        durationMs: Math.max(workflows.durationMs, lineage.durationMs),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workshops/:id/workflows/:useCaseId", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      const maps = (workshop.workflowMaps as any[]) || [];
      const wf = maps.find((m: any) => m.useCaseId === req.params.useCaseId);
      res.json(wf || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // DATA LINEAGE (Agent 7)
  // =========================================================================

  app.post("/api/workshops/:id/data-lineage", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }
      res.json(workshop.dataLineage || []);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // SYNTHESIS & EXPORT (Agent 8)
  // =========================================================================

  app.post("/api/workshops/:id/synthesize", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const useCases = (workshop.reconciledUseCases as ReconciledUseCase[]) || [];
      const allResponses = await db.select().from(surveyResponses).where(eq(surveyResponses.workshopId, req.params.id));
      const latestResponse = allResponses[allResponses.length - 1];

      const context: WorkshopContext = {
        workshopId: workshop.id,
        companyName: workshop.companyName,
        industry: workshop.industry || "",
        reconciledUseCases: useCases,
        surveyDimensionScores: latestResponse?.dimensionScores as any,
        previousAgentOutputs: {},
      };

      // Load previous agent outputs into context
      if (workshop.challengeResults) {
        context.previousAgentOutputs["Assumption Challenge Agent"] = {
          agentName: "Assumption Challenge Agent",
          insights: [(workshop.challengeResults as any).summary || `${(workshop.challengeResults as any).totalChallenges || 0} challenges found`],
          confidence: 0.8,
          reasoning: "",
          durationMs: 0,
        };
      }
      if (workshop.validationResults) {
        context.previousAgentOutputs["Benefit Validation Agent"] = {
          agentName: "Benefit Validation Agent",
          insights: [`Validated value: $${(((workshop.validationResults as any).totalValidatedValue || 0) / 1000000).toFixed(1)}M`],
          confidence: 0.8,
          reasoning: "",
          durationMs: 0,
        };
      }
      if (workshop.prioritizationMatrix) {
        const matrix = workshop.prioritizationMatrix as any;
        context.previousAgentOutputs["Prioritization Agent"] = {
          agentName: "Prioritization Agent",
          insights: [`${matrix.quickWinCount || 0} quick wins, ${matrix.strategicCount || 0} strategic bets`],
          confidence: 0.85,
          reasoning: "",
          durationMs: 0,
        };
      }

      const result = await runSynthesis(context);

      await db.update(workshops)
        .set({
          workshopSynthesis: result.structuredData,
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(workshops.id, req.params.id));

      res.json({
        success: true,
        synthesis: result.structuredData,
        insights: result.insights,
        durationMs: result.durationMs,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workshops/:id/export/pdf", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const html = generateHTMLReport(workshop);
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Content-Disposition", `inline; filename="${workshop.companyName.replace(/\s+/g, "_")}_Workshop_Report.html"`);
      res.send(html);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workshops/:id/export/xlsx", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      const buffer = await generateExcelReport(workshop);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="${workshop.companyName.replace(/\s+/g, "_")}_Workshop_Report.xlsx"`);
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workshops/:id/share", async (req, res) => {
    try {
      const [workshop] = await db.select().from(workshops).where(eq(workshops.id, req.params.id));
      if (!workshop) {
        return res.status(404).json({ error: "Workshop not found" });
      }

      // Generate a shareable HTML report URL
      const html = generateHTMLReport(workshop);
      // Store as base64 for simple sharing (in production, store in S3/CDN)
      const shareId = workshop.id.slice(0, 8);
      res.json({
        success: true,
        shareUrl: `/api/workshops/${workshop.id}/export/pdf`,
        shareId,
        message: "Share the report URL to give others access to the HTML report.",
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

function getQuadrant(impact: number, feasibility: number): string {
  if (impact >= 6 && feasibility >= 6) return "quick_win";
  if (impact >= 6 && feasibility < 6) return "strategic";
  if (impact < 6 && feasibility >= 6) return "fill_in";
  return "deprioritize";
}
