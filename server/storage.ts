import { eq, desc, and, sql } from 'drizzle-orm';
import { json } from 'drizzle-orm/pg-core';
import { db } from './db';
import {
  codeSamples,
  optimizations,
  domains,
  researchPapers,
  knowledgeExtractions,
  type CodeSample,
  type InsertCodeSample,
  type Optimization,
  type InsertOptimization,
  type Domain,
  type InsertDomain,
  type ResearchPaper,
  type InsertResearchPaper,
  type KnowledgeExtraction,
  type InsertKnowledgeExtraction,
  type DashboardStats,
  type AnalysisResult
} from '@shared/schema';

// Storage interface
export interface IStorage {
  // Code samples
  getCodeSample(id: number): Promise<CodeSample | undefined>;
  getCodeSamples(): Promise<CodeSample[]>;
  createCodeSample(sample: InsertCodeSample): Promise<CodeSample>;
  
  // Optimizations
  getOptimization(id: number): Promise<Optimization | undefined>;
  getOptimizationsForSample(sampleId: number): Promise<Optimization[]>;
  getRecentOptimizations(limit: number): Promise<Optimization[]>;
  createOptimization(optimization: InsertOptimization): Promise<Optimization>;
  
  // Domains
  getDomain(id: number): Promise<Domain | undefined>;
  getDomainByName(name: string): Promise<Domain | undefined>;
  getDomains(): Promise<Domain[]>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  
  // Research papers
  getResearchPaper(id: number): Promise<ResearchPaper | undefined>;
  getResearchPapers(): Promise<ResearchPaper[]>;
  createResearchPaper(paper: InsertResearchPaper): Promise<ResearchPaper>;
  
  // Knowledge extractions
  getKnowledgeExtraction(id: number): Promise<KnowledgeExtraction | undefined>;
  getKnowledgeExtractionsForPaper(paperId: number): Promise<KnowledgeExtraction[]>;
  createKnowledgeExtraction(extraction: InsertKnowledgeExtraction): Promise<KnowledgeExtraction>;
  markKnowledgeExtractionAsApplied(id: number): Promise<KnowledgeExtraction>;
  
  // Dashboard data
  getDashboardStats(): Promise<DashboardStats>;
  
  // Analysis results
  getAnalysisResult(id: number): Promise<AnalysisResult | undefined>;
  saveAnalysisResult(result: AnalysisResult): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // In-memory storage for analysis results which aren't persisted to the database
  private analysisResults: Map<number, AnalysisResult>;
  private analysisResultId: number;
  
  constructor() {
    this.analysisResults = new Map<number, AnalysisResult>();
    this.analysisResultId = 0;
    
    // Seed initial domains if needed
    this.seedDomains();
  }
  
  // Code samples
  async getCodeSample(id: number): Promise<CodeSample | undefined> {
    const [sample] = await db.select().from(codeSamples).where(eq(codeSamples.id, id));
    return sample;
  }
  
  async getCodeSamples(): Promise<CodeSample[]> {
    return db.select().from(codeSamples).orderBy(desc(codeSamples.createdAt));
  }
  
  async createCodeSample(sample: InsertCodeSample): Promise<CodeSample> {
    const [newSample] = await db.insert(codeSamples).values(sample).returning();
    return newSample;
  }
  
  // Optimizations
  async getOptimization(id: number): Promise<Optimization | undefined> {
    const [optimization] = await db.select().from(optimizations).where(eq(optimizations.id, id));
    return optimization;
  }
  
  async getOptimizationsForSample(sampleId: number): Promise<Optimization[]> {
    return db.select().from(optimizations).where(eq(optimizations.sampleId, sampleId));
  }
  
  async getRecentOptimizations(limit: number): Promise<Optimization[]> {
    return db.select().from(optimizations).orderBy(desc(optimizations.createdAt)).limit(limit);
  }
  
  async createOptimization(optimization: InsertOptimization): Promise<Optimization> {
    const [newOptimization] = await db.insert(optimizations).values(optimization).returning();
    return newOptimization;
  }
  
  // Domains
  async getDomain(id: number): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain;
  }
  
  async getDomainByName(name: string): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.name, name));
    return domain;
  }
  
  async getDomains(): Promise<Domain[]> {
    return db.select().from(domains).where(eq(domains.active, true));
  }
  
  async createDomain(domain: InsertDomain): Promise<Domain> {
    const [newDomain] = await db.insert(domains).values(domain).returning();
    return newDomain;
  }
  
  // Research papers
  async getResearchPaper(id: number): Promise<ResearchPaper | undefined> {
    const [paper] = await db.select().from(researchPapers).where(eq(researchPapers.id, id));
    return paper;
  }
  
  async getResearchPapers(): Promise<ResearchPaper[]> {
    return db.select().from(researchPapers).orderBy(desc(researchPapers.createdAt));
  }
  
  async createResearchPaper(paper: InsertResearchPaper): Promise<ResearchPaper> {
    const [newPaper] = await db.insert(researchPapers).values(paper).returning();
    return newPaper;
  }
  
  // Knowledge extractions
  async getKnowledgeExtraction(id: number): Promise<KnowledgeExtraction | undefined> {
    const [extraction] = await db.select().from(knowledgeExtractions).where(eq(knowledgeExtractions.id, id));
    return extraction;
  }
  
  async getKnowledgeExtractionsForPaper(paperId: number): Promise<KnowledgeExtraction[]> {
    return db.select().from(knowledgeExtractions).where(eq(knowledgeExtractions.paperId, paperId));
  }
  
  async createKnowledgeExtraction(extraction: InsertKnowledgeExtraction): Promise<KnowledgeExtraction> {
    const [newExtraction] = await db.insert(knowledgeExtractions).values(extraction).returning();
    return newExtraction;
  }
  
  async markKnowledgeExtractionAsApplied(id: number): Promise<KnowledgeExtraction> {
    const [updatedExtraction] = await db
      .update(knowledgeExtractions)
      .set({ applied: true })
      .where(eq(knowledgeExtractions.id, id))
      .returning();
    return updatedExtraction;
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    // Get average performance scores
    const performanceResult = await db
      .select({ avg: sql<number>`AVG((${optimizations.improvements}->>'performanceScore')::int)` })
      .from(optimizations);
    
    const securityResult = await db
      .select({ avg: sql<number>`AVG((${optimizations.improvements}->>'securityScore')::int)` })
      .from(optimizations);
      
    const readabilityResult = await db
      .select({ avg: sql<number>`AVG((${optimizations.improvements}->>'readabilityScore')::int)` })
      .from(optimizations);
      
    // Get recent optimizations
    const recentOpts = await db.select({
      id: optimizations.id,
      sampleId: optimizations.sampleId,
      type: optimizations.type,
      createdAt: optimizations.createdAt,
      improvements: optimizations.improvements,
      domainKnowledge: optimizations.domainKnowledge
    })
    .from(optimizations)
    .orderBy(desc(optimizations.createdAt))
    .limit(5);
    
    // Get domain info
    const domainsData = await db.select().from(domains).where(eq(domains.active, true));
    
    // Format recent optimizations
    const recentOptimizations = await Promise.all(recentOpts.map(async (opt) => {
      const [sample] = await db
        .select({ filename: codeSamples.filename })
        .from(codeSamples)
        .where(eq(codeSamples.id, opt.sampleId));
        
      const improvements = opt.improvements as any;
      
      return {
        id: opt.id,
        filename: sample?.filename || 'Unknown',
        type: opt.type,
        date: opt.createdAt.toISOString(),
        improvement: `${improvements.improvementPercentage || 0}%`,
        domain: opt.domainKnowledge || 'General'
      };
    }));
    
    // Format domains
    const formattedDomains = await Promise.all(domainsData.map(async (domain) => {
      // Get knowledge extractions for this domain that have been applied
      const appliedExtractions = await db
        .select()
        .from(knowledgeExtractions)
        .where(and(
          eq(knowledgeExtractions.domainId, domain.id),
          eq(knowledgeExtractions.applied, true)
        ))
        .limit(3);
      
      return {
        name: domain.name,
        algorithmsApplied: (domain.algorithms as string[]).length,
        recentApplications: appliedExtractions.map(ext => ({
          technique: ext.technique,
          description: ext.description
        })),
        learningAccuracy: domain.learningAccuracy
      };
    }));
    
    return {
      performanceScore: Math.round(performanceResult[0]?.avg || 85),
      securityScore: Math.round(securityResult[0]?.avg || 92),
      readabilityScore: Math.round(readabilityResult[0]?.avg || 78),
      recentOptimizations,
      domains: formattedDomains
    };
  }
  
  // Analysis results (using in-memory storage for now)
  async getAnalysisResult(id: number): Promise<AnalysisResult | undefined> {
    return this.analysisResults.get(id);
  }
  
  async saveAnalysisResult(result: AnalysisResult): Promise<number> {
    this.analysisResultId++;
    this.analysisResults.set(this.analysisResultId, result);
    return this.analysisResultId;
  }
  
  // Seed initial domain data
  private async seedDomains() {
    try {
      const count = await db.select({ count: sql<number>`count(*)` }).from(domains);
      
      if (count[0].count === 0) {
        // No domains exist yet, let's seed some
        const seedDomains = [
          {
            name: "Mathematics",
            description: "Mathematical optimization techniques including algorithms, data structures, and computational methods.",
            algorithms: JSON.stringify([
              "Dynamic Programming",
              "Matrix Optimization",
              "Numerical Methods",
              "Algorithmic Complexity Reduction",
              "Geometric Algorithms",
              "Cohomology",
              "Sheaf Theory",
              "Algebraic Varieties"
            ]),
            learningAccuracy: 92,
            active: true
          },
          {
            name: "Computer Science",
            description: "Core computer science principles including algorithms, data structures, and computational methods.",
            algorithms: JSON.stringify([
              "Caching",
              "Memorization",
              "Parallel Processing",
              "Indexing",
              "Efficient Data Structures",
              "Boolean Satisfiability",
              "SAT Solving",
              "Computational Complexity"
            ]),
            learningAccuracy: 95,
            active: true
          },
          {
            name: "Physics",
            description: "Physics-inspired optimization techniques and algorithms.",
            algorithms: JSON.stringify([
              "Quantum Algorithms",
              "N-body Optimization",
              "Wave Function Collapse",
              "Monte Carlo Methods",
              "Simulated Annealing",
              "Duality Principles",
              "Projective Space",
              "Homogenization"
            ]),
            learningAccuracy: 84,
            active: true
          }
        ];
        
        await db.insert(domains).values(seedDomains);
        console.log('Seeded initial domain data');
      }
    } catch (error) {
      console.error('Error seeding domains:', error);
    }
  }
}

export const storage = new DatabaseStorage();