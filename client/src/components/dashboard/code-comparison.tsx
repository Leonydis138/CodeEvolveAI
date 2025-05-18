import React, { useState } from "react";
import { CodeEditor } from "@/components/ui/code-editor";

interface Insight {
  type: string;
  description: string;
  appliedTechnique: string;
  impact: string;
}

interface CodeComparisonProps {
  originalCode: string;
  optimizedCode: string;
  language?: string;
  filename?: string;
  highlightedLines?: number[];
  insights?: Insight[];
}

export function CodeComparison({
  originalCode,
  optimizedCode,
  language = "javascript",
  filename = "code.js",
  highlightedLines = [],
  insights = [],
}: CodeComparisonProps) {
  const [activeTab, setActiveTab] = useState<"optimizations" | "beforeAfter" | "insights">("optimizations");
  
  return (
    <div className="px-6 py-4">
      <h2 className="text-lg font-semibold mb-4">Recent Analysis</h2>
      <div className="bg-editor-surface rounded-lg shadow-md overflow-hidden">
        {/* Navigation tabs */}
        <div className="px-6 border-b border-editor-line">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "optimizations"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setActiveTab("optimizations")}
            >
              Optimizations
            </button>
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "beforeAfter"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setActiveTab("beforeAfter")}
            >
              Before & After
            </button>
            <button
              className={`border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "insights"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-400"
              }`}
              onClick={() => setActiveTab("insights")}
            >
              Learning Insights
            </button>
          </nav>
        </div>

        {/* Content based on selected tab */}
        <div className="p-6 overflow-auto">
          {activeTab === "optimizations" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Code Panel */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">Original Code</h3>
                  <div className="text-xs text-gray-500">{filename}</div>
                </div>
                <CodeEditor 
                  code={originalCode} 
                  language={language} 
                  filename={filename}
                />
              </div>

              {/* Optimized Code Panel */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-success">Optimized Code</h3>
                  <div className="text-xs text-gray-500">{filename}</div>
                </div>
                <CodeEditor 
                  code={optimizedCode} 
                  language={language} 
                  filename={filename}
                  highlightLines={highlightedLines}
                  highlightType="optimization"
                />
                
                {insights.length > 0 && (
                  <div className="mt-4 rounded-md bg-editor-surface p-4">
                    <h4 className="text-xs font-semibold text-success mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Optimization Insight
                    </h4>
                    <p className="text-xs text-gray-300">
                      {insights[0].description}. This {insights[0].impact.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "beforeAfter" && (
            <div className="space-y-6">
              <p className="text-gray-300">
                Compare the before and after versions of your code to see all optimizations side by side.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CodeEditor 
                  code={originalCode} 
                  language={language} 
                  filename={`${filename} (Before)`}
                />
                <CodeEditor 
                  code={optimizedCode} 
                  language={language} 
                  filename={`${filename} (After)`}
                  highlightLines={highlightedLines}
                  highlightType="optimization"
                />
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-6">
              <p className="text-gray-300">
                Learn about the optimizations applied to your code and how they improve performance, security, and readability.
              </p>
              
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="bg-editor-line bg-opacity-30 rounded-md p-4">
                    <h3 className="text-sm font-medium mb-2">{insight.appliedTechnique}</h3>
                    <p className="text-sm text-gray-300">{insight.description}</p>
                    <p className="text-sm text-gray-400 mt-2">{insight.impact}</p>
                  </div>
                ))}
                
                {insights.length === 0 && (
                  <p className="text-gray-400 italic">
                    No specific insights found for this code sample.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
