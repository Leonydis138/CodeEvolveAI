import { pgTable, text, serial, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Code samples table
export const codeSamples = pgTable("code_samples", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  language: text("language").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Code sample relations
export const codeSamplesRelations = relations(codeSamples, ({ many }) => ({
  optimizations: many(optimizations),
}));

// Optimization records table
export const optimizations = pgTable("optimizations", {
  id: serial("id").primaryKey(),
  sampleId: integer("sample_id").notNull().references(() => codeSamples.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // "performance", "security", "readability"
  optimizedContent: text("optimized_content").notNull(),
  improvements: jsonb("improvements").notNull(), // metrics about the optimization
  domainKnowledge: text("domain_knowledge"), // which domain knowledge was applied
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Optimization relations
export const optimizationsRelations = relations(optimizations, ({ one }) => ({
  codeSample: one(codeSamples, {
    fields: [optimizations.sampleId],
    references: [codeSamples.id],
  }),
}));

// Domain knowledge table
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  active: boolean("active").default(true).notNull(),
  algorithms: jsonb("algorithms").notNull(), // array of algorithms this domain knows
  learningAccuracy: integer("learning_accuracy").notNull(), // percentage
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Research papers table 
export const researchPapers = pgTable("research_papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  keyConcepts: jsonb("key_concepts").default([]),
  rigorEvaluation: text("rigor_evaluation"),
  connections: jsonb("connections").default([]),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Knowledge extraction table to track insights from research papers
export const knowledgeExtractions = pgTable("knowledge_extractions", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => researchPapers.id, { onDelete: 'cascade' }),
  domainId: integer("domain_id").notNull().references(() => domains.id),
  technique: text("technique").notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence").notNull(), // percentage of confidence in the extraction
  applied: boolean("applied").default(false).notNull(), // whether this knowledge has been applied
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for knowledge extractions
export const knowledgeExtractionsRelations = relations(knowledgeExtractions, ({ one }) => ({
  paper: one(researchPapers, {
    fields: [knowledgeExtractions.paperId],
    references: [researchPapers.id],
  }),
  domain: one(domains, {
    fields: [knowledgeExtractions.domainId],
    references: [domains.id],
  }),
}))

// Insert schemas
export const insertCodeSampleSchema = createInsertSchema(codeSamples).omit({
  id: true,
  createdAt: true,
});

export const insertOptimizationSchema = createInsertSchema(optimizations).omit({
  id: true,
  createdAt: true,
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
});

export const insertResearchPaperSchema = createInsertSchema(researchPapers).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeExtractionSchema = createInsertSchema(knowledgeExtractions).omit({
  id: true,
  createdAt: true,
});

// Types
export type CodeSample = typeof codeSamples.$inferSelect;
export type InsertCodeSample = z.infer<typeof insertCodeSampleSchema>;

export type Optimization = typeof optimizations.$inferSelect;
export type InsertOptimization = z.infer<typeof insertOptimizationSchema>;

export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;

export type ResearchPaper = typeof researchPapers.$inferSelect;
export type InsertResearchPaper = z.infer<typeof insertResearchPaperSchema>;

export type KnowledgeExtraction = typeof knowledgeExtractions.$inferSelect;
export type InsertKnowledgeExtraction = z.infer<typeof insertKnowledgeExtractionSchema>;

// Analysis Request/Response types
export const codeAnalysisRequestSchema = z.object({
  code: z.string().min(1),
  filename: z.string().min(1),
  language: z.string().min(1),
  optimizationTypes: z.array(z.enum(["performance", "security", "readability"])),
  applicableDomains: z.array(z.string()).optional(),
});

export type CodeAnalysisRequest = z.infer<typeof codeAnalysisRequestSchema>;

// Research Paper Analysis Request/Response types
export const paperAnalysisRequestSchema = z.object({
  content: z.string().min(1),
  title: z.string().min(1),
  summarize: z.boolean().default(true),
  extractConcepts: z.boolean().default(true),
  evaluateRigor: z.boolean().default(true),
  findConnections: z.boolean().default(true),
});

export type PaperAnalysisRequest = z.infer<typeof paperAnalysisRequestSchema>;

export type PaperAnalysisResult = {
  summary?: string;
  key_concepts?: string[];
  rigor_evaluation?: string;
  connections?: string[];
  recommendation: string;
};

export type AnalysisResult = {
  originalCode: string;
  optimizedCode: string;
  filename: string;
  language: string;
  metrics: {
    performanceScore: number;
    securityScore: number;
    readabilityScore: number;
    improvementPercentage: number;
    optimizedLines: number[];
  };
  insights: {
    type: string;
    description: string;
    appliedTechnique: string;
    impact: string;
  }[];
  domains: {
    name: string;
    algorithms: string[];
  }[];
};

// Dashboard stats type
export type DashboardStats = {
  performanceScore: number;
  securityScore: number;
  readabilityScore: number;
  recentOptimizations: Array<{
    id: number;
    filename: string;
    type: string;
    date: string;
    improvement: string;
    domain: string;
  }>;
  domains: Array<{
    name: string;
    algorithmsApplied: number;
    recentApplications: Array<{
      technique: string;
      description: string;
    }>;
    learningAccuracy: number;
  }>;
};
