import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { codeAnalysisRequestSchema, paperAnalysisRequestSchema } from "@shared/schema";
import { analyzeCode } from "./lib/codeAnalyzer";
import { analyzeCodeWithAI, analyzeResearchPaper } from "./lib/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";
  
  // Add research paper analysis endpoint
  app.post(`${apiPrefix}/analyze-paper`, async (req, res) => {
    try {
      // Validate request body
      const parseResult = paperAnalysisRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.errors 
        });
      }
      
      const analysisRequest = parseResult.data;
      
      // Call OpenAI to analyze the paper
      const result = await analyzeResearchPaper(
        analysisRequest.content,
        analysisRequest.title,
        {
          summarize: analysisRequest.summarize,
          extractConcepts: analysisRequest.extractConcepts,
          evaluateRigor: analysisRequest.evaluateRigor,
          findConnections: analysisRequest.findConnections
        }
      );
      
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Failed to analyze research paper", 
        error: error.message 
      });
    }
  });
  
  // Get dashboard stats
  app.get(`${apiPrefix}/stats`, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats", error: error.message });
    }
  });
  
  // Get all code samples
  app.get(`${apiPrefix}/code-samples`, async (req, res) => {
    try {
      const samples = await storage.getCodeSamples();
      res.json(samples);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch code samples", error: error.message });
    }
  });
  
  // Get single code sample
  app.get(`${apiPrefix}/code-samples/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const sample = await storage.getCodeSample(id);
      if (!sample) {
        return res.status(404).json({ message: "Code sample not found" });
      }
      
      res.json(sample);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch code sample", error: error.message });
    }
  });
  
  // Get optimizations for a code sample
  app.get(`${apiPrefix}/code-samples/:id/optimizations`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const sample = await storage.getCodeSample(id);
      if (!sample) {
        return res.status(404).json({ message: "Code sample not found" });
      }
      
      const optimizations = await storage.getOptimizationsForSample(id);
      res.json(optimizations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch optimizations", error: error.message });
    }
  });
  
  // Upload a code sample
  app.post(`${apiPrefix}/code-samples`, async (req, res) => {
    try {
      const { filename, language, content } = req.body;
      
      if (!filename || !language || !content) {
        return res.status(400).json({ message: "Missing required fields: filename, language, and content are required" });
      }
      
      const newSample = await storage.createCodeSample({
        filename,
        language,
        content
      });
      
      res.status(201).json(newSample);
    } catch (error) {
      res.status(500).json({ message: "Failed to create code sample", error: error.message });
    }
  });
  
  // Get all domains
  app.get(`${apiPrefix}/domains`, async (req, res) => {
    try {
      const domains = await storage.getDomains();
      res.json(domains);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch domains", error: error.message });
    }
  });
  
  // Create a new domain
  app.post(`${apiPrefix}/domains`, async (req, res) => {
    try {
      const { name, description, algorithms, learningAccuracy } = req.body;
      
      if (!name || !description || !algorithms || learningAccuracy === undefined) {
        return res.status(400).json({ message: "Missing required fields: name, description, algorithms, and learningAccuracy are required" });
      }
      
      // Check for duplicate domain name
      const existingDomain = await storage.getDomainByName(name);
      if (existingDomain) {
        return res.status(409).json({ message: `Domain with name "${name}" already exists` });
      }
      
      const newDomain = await storage.createDomain({
        name,
        description,
        active: true,
        algorithms,
        learningAccuracy
      });
      
      res.status(201).json(newDomain);
    } catch (error) {
      res.status(500).json({ message: "Failed to create domain", error: error.message });
    }
  });
  
  // Analyze code for optimization
  app.post(`${apiPrefix}/analyze`, async (req, res) => {
    try {
      // Validate request body
      const parseResult = codeAnalysisRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: parseResult.error.errors 
        });
      }
      
      const analysisRequest = parseResult.data;
      
      // Analyze the code
      const result = await analyzeCode(
        analysisRequest.code,
        analysisRequest.filename,
        analysisRequest.language,
        analysisRequest.optimizationTypes,
        analysisRequest.applicableDomains
      );
      
      // Save code sample if it doesn't already exist
      const samples = await storage.getCodeSamples();
      let sampleId: number;
      
      const existingSample = samples.find(
        s => s.filename === analysisRequest.filename && s.content === analysisRequest.code
      );
      
      if (existingSample) {
        sampleId = existingSample.id;
      } else {
        const newSample = await storage.createCodeSample({
          filename: analysisRequest.filename,
          language: analysisRequest.language,
          content: analysisRequest.code
        });
        sampleId = newSample.id;
      }
      
      // Save the optimization result
      for (const insight of result.insights) {
        await storage.createOptimization({
          sampleId,
          type: insight.type,
          optimizedContent: result.optimizedCode,
          improvements: {
            score: insight.type === "performance" ? result.metrics.performanceScore :
                   insight.type === "security" ? result.metrics.securityScore :
                   result.metrics.readabilityScore,
            percentage: result.metrics.improvementPercentage,
            description: insight.description,
            technique: insight.appliedTechnique
          },
          domainKnowledge: result.domains.length > 0 ? result.domains[0].name : null
        });
      }
      
      // Save the full analysis result
      const resultId = await storage.saveAnalysisResult(result);
      
      res.json({
        resultId,
        ...result
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze code", error: error.message });
    }
  });
  
  // Get analysis result by ID
  app.get(`${apiPrefix}/analysis/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const result = await storage.getAnalysisResult(id);
      if (!result) {
        return res.status(404).json({ message: "Analysis result not found" });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analysis result", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
