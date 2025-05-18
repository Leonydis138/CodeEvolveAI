import { AnalysisResult } from "@shared/schema";

/**
 * Analyzes code for optimization opportunities
 */
export async function analyzeCode(
  code: string,
  filename: string,
  language: string,
  optimizationTypes: string[],
  applicableDomains?: string[]
): Promise<AnalysisResult> {
  // In a real implementation, this would use more sophisticated analysis
  // and potentially connect to OpenAI or other services
  
  // For demonstration purposes, we'll provide synthetic analysis based on the code
  const result: AnalysisResult = {
    originalCode: code,
    optimizedCode: code,
    filename,
    language,
    metrics: {
      performanceScore: 0,
      securityScore: 0,
      readabilityScore: 0,
      improvementPercentage: 0,
      optimizedLines: []
    },
    insights: [],
    domains: []
  };
  
  // Check for common patterns to optimize
  if (language === "javascript" || language === "typescript") {
    // Look for Fibonacci or recursive functions without memoization
    if (code.includes("fibonacci") && !code.includes("memo") && optimizationTypes.includes("performance")) {
      const optimizedCode = applyMemoization(code);
      result.optimizedCode = optimizedCode;
      result.metrics.optimizedLines = [3, 4, 5, 6, 7];
      result.metrics.performanceScore = 87;
      result.metrics.improvementPercentage = 95;
      
      result.insights.push({
        type: "performance",
        description: "Added memoization to store previously calculated Fibonacci values",
        appliedTechnique: "Dynamic Programming",
        impact: "Reduces time complexity from O(2^n) to O(n), making it approximately 1000x faster for large inputs"
      });
      
      result.domains.push({
        name: "Mathematics",
        algorithms: ["Dynamic Programming"]
      });
    }
    
    // Look for XSS vulnerabilities
    if (code.includes("innerHTML") && optimizationTypes.includes("security")) {
      const optimizedCode = fixXssVulnerability(code);
      result.optimizedCode = optimizedCode;
      result.metrics.securityScore = 92;
      result.metrics.improvementPercentage = 25;
      
      result.insights.push({
        type: "security",
        description: "Fixed potential XSS vulnerability by replacing innerHTML with textContent",
        appliedTechnique: "Input Sanitization",
        impact: "Prevents cross-site scripting attacks that could compromise user data"
      });
      
      result.domains.push({
        name: "Computer Science",
        algorithms: ["Security Hardening"]
      });
    }
    
    // Look for readability issues
    if ((code.includes("var ") || code.match(/[a-z][A-Z]/)) && optimizationTypes.includes("readability")) {
      const optimizedCode = improveReadability(code);
      result.optimizedCode = optimizedCode;
      result.metrics.readabilityScore = 78;
      result.metrics.improvementPercentage = 30;
      
      result.insights.push({
        type: "readability",
        description: "Improved variable naming and code structure for better readability",
        appliedTechnique: "Code Style Standardization",
        impact: "Makes code easier to understand and maintain"
      });
    }
  } else if (language === "python") {
    // Python-specific optimizations
    if (code.includes("for") && code.includes("range") && code.includes("append") && optimizationTypes.includes("performance")) {
      const optimizedCode = optimizePythonLoop(code);
      result.optimizedCode = optimizedCode;
      result.metrics.performanceScore = 85;
      result.metrics.improvementPercentage = 40;
      
      result.insights.push({
        type: "performance",
        description: "Replaced inefficient list building with list comprehension",
        appliedTechnique: "Pythonic Patterns",
        impact: "Improves performance by reducing interpreter overhead"
      });
    }
  }
  
  // If no specific optimizations were found, provide general feedback
  if (result.insights.length === 0) {
    // Default optimization - suggest better variable names
    result.optimizedCode = suggestBetterVariableNames(code);
    result.metrics.readabilityScore = 75;
    result.metrics.improvementPercentage = 15;
    
    result.insights.push({
      type: "readability",
      description: "Suggested more descriptive variable names",
      appliedTechnique: "Naming Conventions",
      impact: "Improves code readability and maintainability"
    });
  }
  
  // Set default scores if not already set
  if (result.metrics.performanceScore === 0) {
    result.metrics.performanceScore = Math.floor(Math.random() * 20) + 70; // 70-90
  }
  
  if (result.metrics.securityScore === 0) {
    result.metrics.securityScore = Math.floor(Math.random() * 20) + 70; // 70-90
  }
  
  if (result.metrics.readabilityScore === 0) {
    result.metrics.readabilityScore = Math.floor(Math.random() * 20) + 70; // 70-90
  }
  
  return result;
}

// Helper functions for code optimization

function applyMemoization(code: string): string {
  // Example: Convert fibonacci function to use memoization
  if (code.includes("function fibonacci") || code.includes("const fibonacci")) {
    return code.replace(
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
    );
  }
  return code;
}

function fixXssVulnerability(code: string): string {
  // Replace innerHTML with textContent for better security
  return code.replace(/\.innerHTML\s*=/g, '.textContent =');
}

function improveReadability(code: string): string {
  // Replace var with let/const
  let improved = code.replace(/var\s+([a-zA-Z0-9_]+)/g, 'const $1');
  
  // Convert camelCase to snake_case in variables for better readability
  // Note: This is just for demonstration, in real JS this wouldn't be an improvement
  const camelCaseVars = code.match(/\b[a-z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*\b/g);
  if (camelCaseVars) {
    camelCaseVars.forEach(variable => {
      const snakeCase = variable.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      improved = improved.replace(new RegExp(`\\b${variable}\\b`, 'g'), snakeCase);
    });
  }
  
  return improved;
}

function optimizePythonLoop(code: string): string {
  // Replace for loops building lists with list comprehensions
  return code.replace(
    /results\s*=\s*\[\]\s*\n\s*for\s+([a-zA-Z0-9_]+)\s+in\s+range\(([^)]+)\):\s*\n\s*results\.append\(([^)]+)\)/g,
    'results = [$3 for $1 in range($2)]'
  );
}

function suggestBetterVariableNames(code: string): string {
  // Simple replacement of common ambiguous variable names
  let improved = code;
  
  const replacements: Record<string, string> = {
    'var i = ': 'const index = ',
    'var j = ': 'const position = ',
    'var a = ': 'const array = ',
    'var s = ': 'const string = ',
    'var str = ': 'const inputString = ',
    'var arr = ': 'const elements = ',
    'var e = ': 'const event = ',
    'var x = ': 'const xPosition = ',
    'var y = ': 'const yPosition = ',
    'var fn = ': 'const callback = ',
    'var tmp = ': 'const temporary = '
  };
  
  Object.entries(replacements).forEach(([original, replacement]) => {
    improved = improved.replace(new RegExp(original, 'g'), replacement);
  });
  
  return improved;
}
