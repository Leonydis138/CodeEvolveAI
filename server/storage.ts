import {
  CodeSample,
  InsertCodeSample,
  Optimization,
  InsertOptimization,
  Domain,
  InsertDomain,
  DashboardStats,
  AnalysisResult
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
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
  
  // Dashboard data
  getDashboardStats(): Promise<DashboardStats>;
  
  // Analysis results
  getAnalysisResult(id: number): Promise<AnalysisResult | undefined>;
  saveAnalysisResult(result: AnalysisResult): Promise<number>;
}

export class MemStorage implements IStorage {
  private codeSamples: Map<number, CodeSample>;
  private optimizations: Map<number, Optimization>;
  private domains: Map<number, Domain>;
  private analysisResults: Map<number, AnalysisResult>;
  private codeSampleId: number;
  private optimizationId: number;
  private domainId: number;
  private analysisResultId: number;

  constructor() {
    this.codeSamples = new Map();
    this.optimizations = new Map();
    this.domains = new Map();
    this.analysisResults = new Map();
    this.codeSampleId = 1;
    this.optimizationId = 1;
    this.domainId = 1;
    this.analysisResultId = 1;
    
    // Seed some initial domain knowledge
    this.seedDomains();
  }

  // Code samples
  async getCodeSample(id: number): Promise<CodeSample | undefined> {
    return this.codeSamples.get(id);
  }

  async getCodeSamples(): Promise<CodeSample[]> {
    return Array.from(this.codeSamples.values());
  }

  async createCodeSample(sample: InsertCodeSample): Promise<CodeSample> {
    const id = this.codeSampleId++;
    const timestamp = new Date();
    const newSample: CodeSample = { ...sample, id, createdAt: timestamp };
    this.codeSamples.set(id, newSample);
    return newSample;
  }

  // Optimizations
  async getOptimization(id: number): Promise<Optimization | undefined> {
    return this.optimizations.get(id);
  }

  async getOptimizationsForSample(sampleId: number): Promise<Optimization[]> {
    return Array.from(this.optimizations.values()).filter(
      (opt) => opt.sampleId === sampleId
    );
  }

  async getRecentOptimizations(limit: number): Promise<Optimization[]> {
    return Array.from(this.optimizations.values())
      .sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, limit);
  }

  async createOptimization(optimization: InsertOptimization): Promise<Optimization> {
    const id = this.optimizationId++;
    const timestamp = new Date();
    const newOptimization: Optimization = { ...optimization, id, createdAt: timestamp };
    this.optimizations.set(id, newOptimization);
    return newOptimization;
  }

  // Domains
  async getDomain(id: number): Promise<Domain | undefined> {
    return this.domains.get(id);
  }

  async getDomainByName(name: string): Promise<Domain | undefined> {
    return Array.from(this.domains.values()).find(
      (domain) => domain.name.toLowerCase() === name.toLowerCase()
    );
  }

  async getDomains(): Promise<Domain[]> {
    return Array.from(this.domains.values());
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    const id = this.domainId++;
    const timestamp = new Date();
    const newDomain: Domain = { ...domain, id, createdAt: timestamp };
    this.domains.set(id, newDomain);
    return newDomain;
  }

  // Dashboard data
  async getDashboardStats(): Promise<DashboardStats> {
    const recentOptimizations = await this.getRecentOptimizations(5);
    const domains = await this.getDomains();
    
    const recentOptsList = recentOptimizations.map(opt => {
      // Find the sample for this optimization
      const sample = this.codeSamples.get(opt.sampleId);
      // Find the domain
      const domain = opt.domainKnowledge ? 
        domains.find(d => d.name === opt.domainKnowledge) : 
        undefined;
      
      // Extract improvement data from improvements JSON
      const improvements = opt.improvements as any;
      let improvementText = "Optimized";
      
      if (opt.type === "performance") {
        improvementText = improvements.speedup ? 
          `${improvements.speedup}x faster` : 
          `${improvements.percentage || 0}% faster`;
      } else if (opt.type === "security") {
        improvementText = improvements.vulnerabilities ? 
          `${improvements.vulnerabilities} vulnerabilities fixed` : 
          "Security improved";
      } else if (opt.type === "readability") {
        improvementText = improvements.readabilityChange ? 
          `${improvements.readabilityChange}` : 
          "Better readability";
      }
      
      return {
        id: opt.id,
        filename: sample?.filename || "Unknown file",
        type: opt.type,
        date: opt.createdAt.toISOString(),
        improvement: improvementText,
        domain: opt.domainKnowledge || "General"
      };
    });
    
    // Calculate average scores from all optimizations
    let totalPerformance = 0;
    let totalSecurity = 0;
    let totalReadability = 0;
    let countPerformance = 0;
    let countSecurity = 0;
    let countReadability = 0;
    
    for (const opt of this.optimizations.values()) {
      const improvements = opt.improvements as any;
      
      if (opt.type === "performance" && improvements.score) {
        totalPerformance += improvements.score;
        countPerformance++;
      } else if (opt.type === "security" && improvements.score) {
        totalSecurity += improvements.score;
        countSecurity++;
      } else if (opt.type === "readability" && improvements.score) {
        totalReadability += improvements.score;
        countReadability++;
      }
    }
    
    const performanceScore = countPerformance > 0 ? 
      Math.round(totalPerformance / countPerformance) : 87;
    
    const securityScore = countSecurity > 0 ? 
      Math.round(totalSecurity / countSecurity) : 92;
    
    const readabilityScore = countReadability > 0 ? 
      Math.round(totalReadability / countReadability) : 78;
    
    // Format domain data
    const domainData = domains.map(domain => {
      // Count optimizations that used this domain
      const relatedOptimizations = Array.from(this.optimizations.values())
        .filter(opt => opt.domainKnowledge === domain.name);
      
      // Extract recent applications from the algorithms field
      const algorithms = domain.algorithms as string[];
      const recentApplications = algorithms.slice(0, 2).map(algo => {
        const [technique, description] = algo.split(':');
        return {
          technique,
          description: description || `Applied ${technique} to optimize code`
        };
      });
      
      return {
        name: domain.name,
        algorithmsApplied: relatedOptimizations.length,
        recentApplications,
        learningAccuracy: domain.learningAccuracy
      };
    });
    
    return {
      performanceScore,
      securityScore,
      readabilityScore,
      recentOptimizations: recentOptsList,
      domains: domainData
    };
  }
  
  // Analysis results
  async getAnalysisResult(id: number): Promise<AnalysisResult | undefined> {
    return this.analysisResults.get(id);
  }
  
  async saveAnalysisResult(result: AnalysisResult): Promise<number> {
    const id = this.analysisResultId++;
    this.analysisResults.set(id, result);
    return id;
  }

  // Seed domains
  private seedDomains() {
    // Mathematics domain
    this.createDomain({
      name: "Mathematics",
      description: "Mathematical optimization techniques and algorithms",
      active: true,
      algorithms: [
        "Dynamic Programming:Optimized recursive calculations using memoization",
        "Euclidean Algorithm:Efficient greatest common divisor calculations",
        "Fast Fourier Transform:Optimized signal processing computations",
        "Matrix Multiplication:Improved matrix operation efficiency"
      ],
      learningAccuracy: 94
    });
    
    // Physics domain
    this.createDomain({
      name: "Physics",
      description: "Physics simulation and calculation optimizations",
      active: true,
      algorithms: [
        "Barnes-Hut Algorithm:Optimized N-body simulation for better performance",
        "Verlet Integration:Enhanced fluid dynamics calculation performance",
        "Fast Multipole Method:Improved electromagnetic field calculations",
        "Monte Carlo Simulation:Enhanced statistical physics models"
      ],
      learningAccuracy: 89
    });
    
    // Computer Science domain
    this.createDomain({
      name: "Computer Science",
      description: "Core computer science algorithms and optimizations",
      active: true,
      algorithms: [
        "Red-Black Trees:Optimized self-balancing binary search trees",
        "A* Pathfinding:Enhanced graph traversal with heuristics",
        "Bloom Filters:Efficient probabilistic data structure for membership testing",
        "B-tree Indexing:Improved database query performance"
      ],
      learningAccuracy: 96
    });
  }
}

export const storage = new MemStorage();
