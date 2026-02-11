import { db } from "./db";
import { workshops, surveyTemplates, surveyResponses, useCasePriorities, challengeLog } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Workshops
  getWorkshop(id: string): Promise<any>;
  getAllWorkshops(): Promise<any[]>;
  createWorkshop(data: any): Promise<any>;
  updateWorkshop(id: string, data: any): Promise<any>;
  deleteWorkshop(id: string): Promise<void>;

  // Survey
  getSurveyTemplates(workshopId: string): Promise<any[]>;
  createSurveyTemplate(data: any): Promise<any>;
  saveSurveyResponses(data: any): Promise<any>;
  getSurveyResponses(workshopId: string): Promise<any[]>;

  // Priorities
  getUseCasePriorities(workshopId: string): Promise<any[]>;
  upsertPriority(data: any): Promise<any>;

  // Challenge Log
  getChallenges(workshopId: string): Promise<any[]>;
  createChallenge(data: any): Promise<any>;
  updateChallengeStatus(id: string, status: string, respondedBy: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getWorkshop(id: string) {
    const [workshop] = await db.select().from(workshops).where(eq(workshops.id, id));
    return workshop || null;
  }

  async getAllWorkshops() {
    return db.select().from(workshops).orderBy(workshops.createdAt);
  }

  async createWorkshop(data: any) {
    const [workshop] = await db.insert(workshops).values(data).returning();
    return workshop;
  }

  async updateWorkshop(id: string, data: any) {
    const [workshop] = await db.update(workshops)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workshops.id, id))
      .returning();
    return workshop;
  }

  async deleteWorkshop(id: string) {
    await db.delete(workshops).where(eq(workshops.id, id));
  }

  async getSurveyTemplates(workshopId: string) {
    return db.select().from(surveyTemplates).where(eq(surveyTemplates.workshopId, workshopId));
  }

  async createSurveyTemplate(data: any) {
    const [template] = await db.insert(surveyTemplates).values(data).returning();
    return template;
  }

  async saveSurveyResponses(data: any) {
    const [response] = await db.insert(surveyResponses).values(data).returning();
    return response;
  }

  async getSurveyResponses(workshopId: string) {
    return db.select().from(surveyResponses).where(eq(surveyResponses.workshopId, workshopId));
  }

  async getUseCasePriorities(workshopId: string) {
    return db.select().from(useCasePriorities).where(eq(useCasePriorities.workshopId, workshopId));
  }

  async upsertPriority(data: any) {
    const [priority] = await db.insert(useCasePriorities).values(data).returning();
    return priority;
  }

  async getChallenges(workshopId: string) {
    return db.select().from(challengeLog).where(eq(challengeLog.workshopId, workshopId));
  }

  async createChallenge(data: any) {
    const [challenge] = await db.insert(challengeLog).values(data).returning();
    return challenge;
  }

  async updateChallengeStatus(id: string, status: string, respondedBy: string) {
    const [challenge] = await db.update(challengeLog)
      .set({ status, respondedBy })
      .where(eq(challengeLog.id, id))
      .returning();
    return challenge;
  }
}

export const storage = new DatabaseStorage();
