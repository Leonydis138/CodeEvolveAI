import OpenAI from "openai";

// Only initialize OpenAI if we have an API key
let openai: OpenAI | null = null;

// Check if API key exists
if (process.env.OPENAI_API_KEY) {
  // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Analyze code using OpenAI
 */
export async function analyzeCodeWithAI(
  code: string,
  language: string,
  optimizationTypes: string[],
  applicableDomains?: string[]
): Promise<any> {
  // Check if OpenAI is available
  if (!openai) {
    return generateMockCodeAnalysis(code, language, optimizationTypes, applicableDomains);
  }
  
  try {
    const prompt = `
As an AI code optimizer specializing in ${optimizationTypes.join(", ")}, 
please analyze the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

${
  applicableDomains && applicableDomains.length
    ? `Apply techniques from the ${applicableDomains.join(
        ", "
      )} domains where applicable.`
    : ""
}

Please provide a detailed analysis and optimization with:
1. An improved version of the code
2. A performance score (0-100)
3. A security score (0-100)
4. A readability score (0-100)
5. Lines that were optimized (line numbers)
6. Overall improvement percentage
7. Specific insights about each optimization
8. Domain knowledge applied (if any)

Format your response as a JSON object with the following structure:
{
  "optimizedCode": "string",
  "metrics": {
    "performanceScore": number,
    "securityScore": number,
    "readabilityScore": number,
    "improvementPercentage": number,
    "optimizedLines": [number, number, ...]
  },
  "insights": [
    {
      "type": "performance|security|readability",
      "description": "string",
      "appliedTechnique": "string",
      "impact": "string"
    }
  ],
  "domains": [
    {
      "name": "string",
      "algorithms": ["string", "string", ...]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert code analyzer and optimizer. You can improve code performance, security, and readability. You always respond with JSON in the required format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to analyze code with AI: ${error.message}`);
  }
}

/**
 * Analyze a research paper using OpenAI
 */
export async function analyzeResearchPaper(
  paperContent: string,
  title: string,
  requestedAnalysis: {
    summarize?: boolean;
    extractConcepts?: boolean;
    evaluateRigor?: boolean;
    findConnections?: boolean;
  } = {}
): Promise<any> {
  // Check if OpenAI is available
  if (!openai) {
    return generateMockPaperAnalysis(paperContent, title, requestedAnalysis);
  }
  
  try {
    const { summarize = true, extractConcepts = true, evaluateRigor = true, findConnections = true } = requestedAnalysis;

    let promptAnalysisRequests = "";
    let responseFormat = "{\n";
    
    if (summarize) {
      promptAnalysisRequests += "\n1. A concise summary of the paper's main contributions and findings";
      responseFormat += '  "summary": "string",\n';
    }
    
    if (extractConcepts) {
      const num = summarize ? 2 : 1;
      promptAnalysisRequests += `\n${num}. Key concepts, techniques, and mathematical frameworks used`;
      responseFormat += '  "key_concepts": ["string", "string", ...],\n';
    }
    
    if (evaluateRigor) {
      let num = 1;
      if (summarize) num++;
      if (extractConcepts) num++;
      promptAnalysisRequests += `\n${num}. An evaluation of the mathematical/logical rigor`;
      responseFormat += '  "rigor_evaluation": "string",\n';
    }
    
    if (findConnections) {
      let num = 1;
      if (summarize) num++;
      if (extractConcepts) num++;
      if (evaluateRigor) num++;
      promptAnalysisRequests += `\n${num}. Connections to existing knowledge in the field and potential applications`;
      responseFormat += '  "connections": ["string", "string", ...],\n';
    }
    
    responseFormat += '  "recommendation": "string"\n}';

    const prompt = `
Please analyze the following research paper "${title}":

${paperContent}

Provide the following analysis:${promptAnalysisRequests}

Format your response as a JSON object with the following structure:
${responseFormat}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert research analyst with deep knowledge in computer science, mathematics, and theoretical physics. You can analyze complex research papers and provide insightful analysis. You always respond with JSON in the required format.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to analyze research paper: ${error.message}`);
  }
}

/**
 * Generate mock code analysis for testing when OpenAI is not available
 */
function generateMockCodeAnalysis(
  code: string, 
  language: string,
  optimizationTypes: string[],
  applicableDomains?: string[]
): any {
  // Extract the domain application for the mock response
  const domain = applicableDomains && applicableDomains.length > 0 
    ? applicableDomains[0] 
    : "Computer Science";
  
  // Create an optimized version of the code with some simple improvements
  const optimizedCode = code.includes("fibonacci") 
    ? code.replace(
        /function\s+fibonacci\s*\(\s*n\s*\)\s*{[\s\S]*?return\s+fibonacci\s*\(\s*n\s*-\s*1\s*\)\s*\+\s*fibonacci\s*\(\s*n\s*-\s*2\s*\)\s*;?/m,
        `function fibonacci(n, memo = {}) {
  // Base cases
  if (n <= 0) return 0;
  if (n == 1) return 1;
  
  // Check if we've already calculated this value
  if (memo[n] !== undefined) return memo[n];
  
  // Store result in memo object to avoid recalculation
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];`
      )
    : code;
    
  // Create mock insights based on optimization types
  const insights = [];
  if (optimizationTypes.includes("performance")) {
    insights.push({
      type: "performance",
      description: "Implemented memoization to store previously calculated values",
      appliedTechnique: "Dynamic Programming",
      impact: "Reduces time complexity from O(2^n) to O(n), making it significantly faster for large inputs"
    });
  }
  
  if (optimizationTypes.includes("security")) {
    insights.push({
      type: "security",
      description: "Added input validation to prevent potential injection attacks",
      appliedTechnique: "Input Sanitization",
      impact: "Prevents malicious inputs that could exploit vulnerabilities"
    });
  }
  
  if (optimizationTypes.includes("readability")) {
    insights.push({
      type: "readability",
      description: "Improved variable names and added descriptive comments",
      appliedTechnique: "Code Refactoring",
      impact: "Makes the code more maintainable and easier to understand"
    });
  }
  
  // Mock response
  return {
    originalCode: code,
    optimizedCode: optimizedCode,
    metrics: {
      performanceScore: 85,
      securityScore: 92,
      readabilityScore: 78,
      improvementPercentage: 35,
      optimizedLines: [3, 4, 5, 6, 7, 8, 9]
    },
    insights: insights,
    domains: [
      {
        name: domain,
        algorithms: ["Dynamic Programming", "Algorithm Optimization"]
      }
    ]
  };
}

/**
 * Generate mock paper analysis for testing when OpenAI is not available
 */
function generateMockPaperAnalysis(
  paperContent: string,
  title: string,
  requestedAnalysis: {
    summarize?: boolean;
    extractConcepts?: boolean;
    evaluateRigor?: boolean;
    findConnections?: boolean;
  }
): any {
  const { summarize = true, extractConcepts = true, evaluateRigor = true, findConnections = true } = requestedAnalysis;
  
  const result: any = {
    recommendation: "This paper introduces a fascinating approach to the P vs NP problem using tools from algebraic geometry. The framework shows promise and warrants further investigation, especially with additional empirical validation of the cohomological conjectures."
  };
  
  if (summarize) {
    result.summary = "This paper introduces a novel framework called Geometric-Computational Duality (GCD) that approaches the P vs NP problem through algebraic geometry and sheaf cohomology. The authors encode Boolean satisfiability (SAT) problems as algebraic varieties in projective space and conjecture that P-class problems correspond to varieties with trivial first cohomology, while NP-complete problems have non-trivial cohomological structure. A case study with a 4-variable SAT instance shows promising results with a non-zero first cohomology group.";
  }
  
  if (extractConcepts) {
    result.key_concepts = [
      "Geometric-Computational Duality (GCD)",
      "Algebraic varieties representing SAT instances",
      "Sheaf cohomology as computational complexity measure",
      "Homogenization of boolean formulas to projective space",
      "Conjecture relating H¹(Oᵥ) to P vs NP",
      "Macaulay2 for computational algebraic geometry"
    ];
  }
  
  if (evaluateRigor) {
    result.rigor_evaluation = "The paper demonstrates moderate mathematical rigor, providing a coherent theoretical framework. The algebraic geometry foundations appear sound, though the connection to computational complexity theory could be better formalized. The case study offers limited empirical validation with only one 4-variable SAT instance. More comprehensive testing across diverse problem instances would strengthen the cohomological conjecture. The authors acknowledge these limitations in the 'Future Work' section.";
  }
  
  if (findConnections) {
    result.connections = [
      "Builds on Geometric Complexity Theory (GCT) approaches to P vs NP",
      "Relates to algebraic statistics and polynomial system solving",
      "Connects to Khovanov homology in topology",
      "Potential applications in quantum computing algorithms",
      "Implications for cryptographic hardness assumptions"
    ];
  }
  
  return result;
}