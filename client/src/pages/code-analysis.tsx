import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeEditor } from "@/components/ui/code-editor";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CodeAnalysisRequest, AnalysisResult } from "@shared/schema";
import { Loader2, ZapIcon, ShieldCheckIcon, FileTextIcon, BrainIcon } from "lucide-react";

export default function CodeAnalysis() {
  const { toast } = useToast();
  const [filename, setFilename] = useState("example.js");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Enter your code here\nfunction example() {\n  console.log('Hello world');\n}");
  const [selectedOptimizationTypes, setSelectedOptimizationTypes] = useState({
    performance: true,
    security: true,
    readability: true
  });
  const [selectedDomains, setSelectedDomains] = useState({
    Mathematics: true,
    Physics: false,
    "Computer Science": true
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("code");
  
  const analyzeCodeMutation = useMutation({
    mutationFn: async (data: CodeAnalysisRequest) => {
      const response = await apiRequest("POST", "/api/analyze", data);
      return response.json();
    },
    onSuccess: (data: AnalysisResult) => {
      setResult(data);
      toast({
        title: "Analysis complete",
        description: "Your code has been successfully analyzed and optimized"
      });
      setActiveTab("results");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze code"
      });
    }
  });

  const handleAnalyze = () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Code is required",
        description: "Please enter some code to analyze"
      });
      return;
    }

    // Prepare optimization types array
    const optimizationTypes = Object.entries(selectedOptimizationTypes)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);

    if (optimizationTypes.length === 0) {
      toast({
        variant: "destructive",
        title: "Optimization type required",
        description: "Please select at least one optimization type"
      });
      return;
    }

    // Prepare domains array
    const applicableDomains = Object.entries(selectedDomains)
      .filter(([_, isSelected]) => isSelected)
      .map(([domain]) => domain);

    analyzeCodeMutation.mutate({
      code,
      filename,
      language,
      optimizationTypes: optimizationTypes as Array<"performance" | "security" | "readability">,
      applicableDomains
    });
  };

  const getOptimizationTypeIcon = (type: string) => {
    switch (type) {
      case "performance":
        return <ZapIcon className="h-4 w-4 text-success" />;
      case "security":
        return <ShieldCheckIcon className="h-4 w-4 text-secondary" />;
      case "readability":
        return <FileTextIcon className="h-4 w-4 text-info" />;
      default:
        return <BrainIcon className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Page Header */}
          <div className="px-6 py-4 bg-editor-surface border-b border-editor-line">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Code Analysis</h2>
                <p className="text-sm text-gray-400 mt-1">Analyze and optimize your code with AI</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code">Input Code</TabsTrigger>
                <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="mt-6 space-y-6">
                <Card className="p-6">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="filename">Filename</Label>
                        <Input
                          id="filename"
                          value={filename}
                          onChange={(e) => setFilename(e.target.value)}
                          placeholder="e.g. main.js"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger id="language">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="typescript">TypeScript</SelectItem>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="java">Java</SelectItem>
                            <SelectItem value="csharp">C#</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <div className="border border-input rounded-md overflow-hidden">
                        <CodeEditor 
                          code={code}
                          onChange={setCode}
                          language={language}
                          readOnly={false}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label>Optimization Types</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="performance" 
                              checked={selectedOptimizationTypes.performance}
                              onCheckedChange={(checked) => 
                                setSelectedOptimizationTypes(prev => ({ ...prev, performance: !!checked }))
                              }
                            />
                            <Label htmlFor="performance" className="cursor-pointer">Performance</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="security" 
                              checked={selectedOptimizationTypes.security}
                              onCheckedChange={(checked) => 
                                setSelectedOptimizationTypes(prev => ({ ...prev, security: !!checked }))
                              }
                            />
                            <Label htmlFor="security" className="cursor-pointer">Security</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="readability" 
                              checked={selectedOptimizationTypes.readability}
                              onCheckedChange={(checked) => 
                                setSelectedOptimizationTypes(prev => ({ ...prev, readability: !!checked }))
                              }
                            />
                            <Label htmlFor="readability" className="cursor-pointer">Readability</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Applicable Domains</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="mathematics" 
                              checked={selectedDomains.Mathematics}
                              onCheckedChange={(checked) => 
                                setSelectedDomains(prev => ({ ...prev, Mathematics: !!checked }))
                              }
                            />
                            <Label htmlFor="mathematics" className="cursor-pointer">Mathematics</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="physics" 
                              checked={selectedDomains.Physics}
                              onCheckedChange={(checked) => 
                                setSelectedDomains(prev => ({ ...prev, Physics: !!checked }))
                              }
                            />
                            <Label htmlFor="physics" className="cursor-pointer">Physics</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="computerscience" 
                              checked={selectedDomains["Computer Science"]}
                              onCheckedChange={(checked) => 
                                setSelectedDomains(prev => ({ ...prev, "Computer Science": !!checked }))
                              }
                            />
                            <Label htmlFor="computerscience" className="cursor-pointer">Computer Science</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAnalyze} 
                        disabled={analyzeCodeMutation.isPending}
                        className="mt-4"
                      >
                        {analyzeCodeMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {analyzeCodeMutation.isPending ? "Analyzing..." : "Analyze Code"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="mt-6 space-y-6">
                {result && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Performance Score</Label>
                            <span className="text-xl font-bold">{result.metrics.performanceScore}</span>
                          </div>
                          <div className="w-full h-2 bg-editor-line rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${result.metrics.performanceScore}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Security Score</Label>
                            <span className="text-xl font-bold">{result.metrics.securityScore}</span>
                          </div>
                          <div className="w-full h-2 bg-editor-line rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-secondary" 
                              style={{ width: `${result.metrics.securityScore}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Readability Score</Label>
                            <span className="text-xl font-bold">{result.metrics.readabilityScore}</span>
                          </div>
                          <div className="w-full h-2 bg-editor-line rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-info" 
                              style={{ width: `${result.metrics.readabilityScore}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card>
                      <div className="p-4 border-b border-editor-line">
                        <h3 className="text-lg font-semibold">Code Comparison</h3>
                      </div>
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-400">Original Code</h3>
                            <div className="text-xs text-gray-500">{result.filename}</div>
                          </div>
                          <CodeEditor 
                            code={result.originalCode} 
                            language={result.language} 
                            filename={result.filename}
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-success">Optimized Code</h3>
                            <div className="text-xs text-gray-500">{result.filename}</div>
                          </div>
                          <CodeEditor 
                            code={result.optimizedCode} 
                            language={result.language} 
                            filename={result.filename}
                            highlightLines={result.metrics.optimizedLines}
                            highlightType="optimization"
                          />
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <div className="p-4 border-b border-editor-line">
                        <h3 className="text-lg font-semibold">Optimization Insights</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {result.insights.map((insight, index) => (
                            <div key={index} className="bg-editor-line bg-opacity-30 rounded-md p-4">
                              <div className="flex items-center mb-2">
                                {getOptimizationTypeIcon(insight.type)}
                                <h3 className="text-sm font-medium ml-2">{insight.appliedTechnique}</h3>
                              </div>
                              <p className="text-sm text-gray-300 mb-2">{insight.description}</p>
                              <p className="text-sm text-gray-400">{insight.impact}</p>
                            </div>
                          ))}

                          {result.domains.length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-sm font-medium mb-2">Applied Domain Knowledge</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.domains.map((domain, index) => (
                                  <div key={index} className="domain-badge">
                                    {domain.name}: {domain.algorithms.join(", ")}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab("code")}
                      >
                        Back to Editor
                      </Button>
                      <Button onClick={handleAnalyze}>
                        Analyze Again
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
