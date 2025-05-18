import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { codeAnalysisRequestSchema, paperAnalysisRequestSchema } from "@shared/schema";
import { analyzeCode } from "./lib/codeAnalyzer";
import { analyzeCodeWithAI, analyzeResearchPaper } from "./lib/openai";
import { applyGeometricOptimization, getGeometricKnowledge } from "./lib/geometricOptimizer";
import { processChat, getAllKnowledge } from "./lib/chatEngine";

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
      
      // Save the research paper to the database
      const paper = await storage.createResearchPaper({
        title: analysisRequest.title,
        content: analysisRequest.content,
        summary: result.summary,
        keyConcepts: result.key_concepts as any,
        rigorEvaluation: result.rigor_evaluation,
        connections: result.connections as any,
        recommendation: result.recommendation
      });
      
      // Try to extract knowledge from the analysis and connect to domains
      try {
        // Get all domains
        const domains = await storage.getDomains();
        
        // For each domain, check if it's mentioned in the paper
        for (const domain of domains) {
          let foundRelevantKnowledge = false;
          
          // If domain name appears in summary or connections
          if (
            (result.summary && result.summary.toLowerCase().includes(domain.name.toLowerCase())) ||
            (result.connections && result.connections.some(c => 
              c.toLowerCase().includes(domain.name.toLowerCase())
            ))
          ) {
            foundRelevantKnowledge = true;
            
            // Extract relevant connections for this domain
            const relevantConnections = result.connections?.filter(c => 
              c.toLowerCase().includes(domain.name.toLowerCase())
            ) || [];
            
            // Create a knowledge extraction
            await storage.createKnowledgeExtraction({
              paperId: paper.id,
              domainId: domain.id,
              technique: "Cross-domain connection",
              description: relevantConnections.length > 0 
                ? relevantConnections[0] 
                : `Knowledge related to ${domain.name} found in research paper`,
              confidence: 85, // Medium-high confidence
              applied: false // Not yet applied
            });
          }
          
          // Look for domain-specific algorithms in the key concepts
          if (result.key_concepts) {
            for (const concept of result.key_concepts) {
              const domainAlgorithms = domain.algorithms as string[];
              
              if (domainAlgorithms.some(algo => 
                concept.toLowerCase().includes(algo.toLowerCase())
              )) {
                foundRelevantKnowledge = true;
                
                // Create a knowledge extraction
                await storage.createKnowledgeExtraction({
                  paperId: paper.id,
                  domainId: domain.id,
                  technique: concept,
                  description: `Algorithm or technique related to ${domain.name} found in key concepts`,
                  confidence: 90, // High confidence
                  applied: false // Not yet applied
                });
                
                break; // Only create one extraction per domain for algorithms
              }
            }
          }
          
          // If no specific knowledge was found but the domain is mentioned
          if (!foundRelevantKnowledge && 
              (analysisRequest.content.toLowerCase().includes(domain.name.toLowerCase()) ||
               analysisRequest.title.toLowerCase().includes(domain.name.toLowerCase()))) {
            
            // Create a general knowledge extraction
            await storage.createKnowledgeExtraction({
              paperId: paper.id,
              domainId: domain.id,
              technique: "General reference",
              description: `Paper mentions ${domain.name} but no specific techniques identified`,
              confidence: 65, // Medium confidence
              applied: false // Not yet applied
            });
          }
        }
      } catch (extractionError: any) {
        console.warn("Knowledge extraction failed, but paper analysis was saved:", extractionError.message);
      }
      
      // Return both the analysis result and the stored paper ID
      res.json({
        ...result,
        paperId: paper.id
      });
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
  
  // Get all research papers
  app.get(`${apiPrefix}/papers`, async (req, res) => {
    try {
      const papers = await storage.getResearchPapers();
      res.json(papers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch research papers", error: error.message });
    }
  });
  
  // Get a specific research paper by ID
  app.get(`${apiPrefix}/papers/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const paper = await storage.getResearchPaper(id);
      if (!paper) {
        return res.status(404).json({ message: "Research paper not found" });
      }
      
      res.json(paper);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch research paper", error: error.message });
    }
  });
  
  // Get knowledge extractions for a paper
  app.get(`${apiPrefix}/papers/:id/extractions`, async (req, res) => {
    try {
      const paperId = parseInt(req.params.id);
      if (isNaN(paperId)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const paper = await storage.getResearchPaper(paperId);
      if (!paper) {
        return res.status(404).json({ message: "Research paper not found" });
      }
      
      const extractions = await storage.getKnowledgeExtractionsForPaper(paperId);
      res.json(extractions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch knowledge extractions", error: error.message });
    }
  });
  
  // Mark knowledge extraction as applied
  app.put(`${apiPrefix}/extractions/:id/apply`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const updatedExtraction = await storage.markKnowledgeExtractionAsApplied(id);
      if (!updatedExtraction) {
        return res.status(404).json({ message: "Knowledge extraction not found" });
      }
      
      res.json(updatedExtraction);
    } catch (error) {
      res.status(500).json({ message: "Failed to apply knowledge extraction", error: error.message });
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
  
  // Chat API endpoint
  app.post(`${apiPrefix}/chat`, async (req, res) => {
    try {
      // Make sure we have a valid message in the request
      if (!req.body || !req.body.message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const chatResponse = await processChat(req.body);
      res.json(chatResponse);
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat message", error: (error as Error).message });
    }
  });
  
  // Knowledge base API endpoint
  app.get(`${apiPrefix}/knowledge`, async (req, res) => {
    try {
      const knowledge = await getAllKnowledge();
      res.json(knowledge);
    } catch (error) {
      console.error("Error getting knowledge base:", error);
      res.status(500).json({ message: "Failed to get knowledge base", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
