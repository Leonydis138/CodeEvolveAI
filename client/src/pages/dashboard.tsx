import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricsOverview } from "@/components/dashboard/metrics-overview";
import { CodeComparison } from "@/components/dashboard/code-comparison";
import { OptimizationHistory } from "@/components/dashboard/optimization-history";
import { DomainKnowledge } from "@/components/dashboard/domain-knowledge";
import { CodeUpload } from "@/components/dashboard/code-upload";
import { useToast } from "@/hooks/use-toast";
import { DashboardStats, AnalysisResult } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);
  
  // Fetch dashboard stats
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['/api/stats'],
  });

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Failed to load dashboard",
        description: error.message
      });
    }
  }, [error, toast]);

  // Default example code for the code comparison section when no analysis exists
  const defaultFibonacciCode = `// Calculate fibonacci number recursively
function fibonacci(n) {
  // Base cases
  if (n <= 0) return 0;
  if (n == 1) return 1;
  
  // Recursive calculation
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(20)); // Very slow!`;

  const defaultOptimizedCode = `// Calculate fibonacci number using memoization
function fibonacci(n, memo = {}) {
  // Base cases
  if (n <= 0) return 0;
  if (n == 1) return 1;
  
  // Check if we've already calculated this value
  if (memo[n] !== undefined) return memo[n];
  
  // Store result in memo object to avoid recalculation
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}

console.log(fibonacci(20)); // Much faster!`;

  const defaultInsight = [
    {
      type: "performance",
      description: "Added memoization to store previously calculated Fibonacci values",
      appliedTechnique: "Dynamic Programming",
      impact: "Reduces time complexity from O(2^n) to O(n), making it approximately 1000x faster for large inputs"
    }
  ];

  // Handle successful code upload and analysis
  const handleUploadSuccess = (result: AnalysisResult) => {
    setLatestAnalysis(result);
    toast({
      title: "Analysis complete",
      description: "Your code has been analyzed and optimized successfully."
    });
  };

  // Format the optimization history data from the stats
  const formatOptimizationHistory = () => {
    if (!stats) return [];
    
    return stats.recentOptimizations.map(opt => ({
      id: opt.id,
      filename: opt.filename,
      fileType: opt.filename.split('.').pop() || 'javascript',
      type: opt.type,
      date: opt.date,
      improvement: opt.improvement,
      domain: opt.domain
    }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Dashboard header with action buttons */}
          <DashboardHeader />
          
          {/* Metrics cards */}
          {isLoading ? (
            <div className="p-6">
              <p className="text-gray-400">Loading metrics...</p>
            </div>
          ) : (
            <MetricsOverview
              performanceScore={stats?.performanceScore || 87}
              securityScore={stats?.securityScore || 92}
              readabilityScore={stats?.readabilityScore || 78}
              lastPerformanceOptimized="2 hours ago"
              securityVulnerabilitiesFixed={3}
              readabilityImprovements={12}
            />
          )}
          
          {/* Code comparison section */}
          <CodeComparison
            originalCode={latestAnalysis?.originalCode || defaultFibonacciCode}
            optimizedCode={latestAnalysis?.optimizedCode || defaultOptimizedCode}
            language={latestAnalysis?.language || "javascript"}
            filename={latestAnalysis?.filename || "fibonacci.js"}
            highlightedLines={latestAnalysis?.metrics.optimizedLines || [6, 7, 8, 9]}
            insights={latestAnalysis?.insights || defaultInsight}
          />
          
          {/* Optimization history table */}
          <OptimizationHistory 
            optimizations={formatOptimizationHistory()}
          />
          
          {/* Domain knowledge cards */}
          <DomainKnowledge
            domains={stats?.domains || []}
          />
          
          {/* Code upload dialog */}
          <CodeUpload
            open={uploadDialogOpen}
            onOpenChange={setUploadDialogOpen}
            onUploadSuccess={handleUploadSuccess}
          />
        </main>
      </div>
    </div>
  );
}
