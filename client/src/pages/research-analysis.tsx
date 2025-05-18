import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PaperAnalysisRequest, PaperAnalysisResult } from "@shared/schema";
import { Loader2, BookOpenIcon, BeakerIcon, Calculator, Network } from "lucide-react";

export default function ResearchAnalysis() {
  const { toast } = useToast();
  const [title, setTitle] = useState("Geometric-Computational Duality: A Cohomological Approach to P vs NP");
  const [content, setContent] = useState("");
  const [analysisOptions, setAnalysisOptions] = useState({
    summarize: true,
    extractConcepts: true,
    evaluateRigor: true,
    findConnections: true
  });
  const [result, setResult] = useState<PaperAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState("input");
  
  const analyzeResearchMutation = useMutation({
    mutationFn: async (data: PaperAnalysisRequest) => {
      const response = await apiRequest("POST", "/api/analyze-paper", data);
      return response.json();
    },
    onSuccess: (data: PaperAnalysisResult) => {
      setResult(data);
      toast({
        title: "Analysis complete",
        description: "The research paper has been successfully analyzed"
      });
      setActiveTab("results");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze research paper"
      });
    }
  });

  const handleAnalyze = () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Content required",
        description: "Please enter the research paper content to analyze"
      });
      return;
    }

    analyzeResearchMutation.mutate({
      content,
      title,
      summarize: analysisOptions.summarize,
      extractConcepts: analysisOptions.extractConcepts,
      evaluateRigor: analysisOptions.evaluateRigor,
      findConnections: analysisOptions.findConnections
    });
  };

  // Load sample P vs NP paper content
  const loadSamplePaper = () => {
    const sampleContent = `Geometric-Computational Duality: A Cohomological Approach to P vs NP
Abstract
We propose a novel geometric framework—Geometric-Computational Duality (GCD)—to investigate the P vs NP problem via tools from algebraic geometry and sheaf cohomology. Boolean satisfiability (SAT) instances are encoded as algebraic varieties in projective space by homogenizing polynomial representations of logical clauses. We conjecture that problems in class P yield projective varieties with trivial first cohomology group H^1(OV) = 0, whereas NP-complete problems correspond to geometries with nontrivial topological and cohomological structure.

1 Introduction
The P vs NP problem is a cornerstone of computational complexity theory. We introduce a new perspective that leverages tools from algebraic geometry to formulate a geometric analog of computational difficulty.

2 Background
2.1 Complexity Theory
Overview of P, NP, and SAT. Discussion of natural proofs and relativization barriers.

2.2 Algebraic Geometry
Review of affine and projective varieties, sheaf cohomology, and H^1(OV).

3 Geometric Encoding of SAT
3.1 Polynomial Encoding
Boolean variables xi ∈ 0, 1 with encoding via polynomials over F2.

3.2 Homogenization to Projective Space
Clauses are homogenized into Pn for cohomological interpretation.

4 The GCD Framework
We present two conjectures: one linking H^1 to complexity, and one linking symmetry groups to class separation.

5 Case Study: 4-Variable SAT Instance
5.1 Macaulay2 Encoding
We encode three clauses as homogenized polynomials and compute H^1(OV), yielding dim H^1 = 24.

6 Implications and Future Work
Outline automation, larger-scale testing, and connections to Geometric Complexity Theory (GCT).

7 Conclusion
Nontrivial cohomology acts as a geometric witness to computational hardness. GCD offers a promising path toward understanding P vs NP.`;
    
    setContent(sampleContent);
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
                <h2 className="text-xl font-semibold">Research Paper Analysis</h2>
                <p className="text-sm text-gray-400 mt-1">Analyze research papers with AI to extract concepts and insights</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="input">Input Paper</TabsTrigger>
                <TabsTrigger value="results" disabled={!result}>Results</TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="mt-6 space-y-6">
                <Card className="p-6">
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Paper Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter the research paper title"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Paper Content</Label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={loadSamplePaper}
                        >
                          Load Sample P vs NP Paper
                        </Button>
                      </div>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste the paper content here..."
                        className="min-h-[300px] font-mono"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Analysis Options</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="summarize" 
                              checked={analysisOptions.summarize}
                              onCheckedChange={(checked) => 
                                setAnalysisOptions(prev => ({ ...prev, summarize: !!checked }))
                              }
                            />
                            <Label htmlFor="summarize" className="cursor-pointer">Summarize the paper</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="extractConcepts" 
                              checked={analysisOptions.extractConcepts}
                              onCheckedChange={(checked) => 
                                setAnalysisOptions(prev => ({ ...prev, extractConcepts: !!checked }))
                              }
                            />
                            <Label htmlFor="extractConcepts" className="cursor-pointer">Extract key concepts</Label>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="evaluateRigor" 
                              checked={analysisOptions.evaluateRigor}
                              onCheckedChange={(checked) => 
                                setAnalysisOptions(prev => ({ ...prev, evaluateRigor: !!checked }))
                              }
                            />
                            <Label htmlFor="evaluateRigor" className="cursor-pointer">Evaluate mathematical rigor</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="findConnections" 
                              checked={analysisOptions.findConnections}
                              onCheckedChange={(checked) => 
                                setAnalysisOptions(prev => ({ ...prev, findConnections: !!checked }))
                              }
                            />
                            <Label htmlFor="findConnections" className="cursor-pointer">Find connections to existing knowledge</Label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleAnalyze} 
                        disabled={analyzeResearchMutation.isPending || !content.trim()}
                        className="mt-4"
                      >
                        {analyzeResearchMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {analyzeResearchMutation.isPending ? "Analyzing..." : "Analyze Paper"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="mt-6 space-y-6">
                {result && (
                  <div className="grid grid-cols-1 gap-6">
                    {result.summary && (
                      <Card className="overflow-hidden">
                        <div className="p-4 bg-editor-line bg-opacity-30 flex items-center">
                          <BookOpenIcon className="h-5 w-5 text-primary mr-2" />
                          <h3 className="text-lg font-semibold">Summary</h3>
                        </div>
                        <div className="p-6">
                          <p className="text-sm whitespace-pre-line">{result.summary}</p>
                        </div>
                      </Card>
                    )}

                    {result.key_concepts && result.key_concepts.length > 0 && (
                      <Card className="overflow-hidden">
                        <div className="p-4 bg-editor-line bg-opacity-30 flex items-center">
                          <BeakerIcon className="h-5 w-5 text-success mr-2" />
                          <h3 className="text-lg font-semibold">Key Concepts</h3>
                        </div>
                        <div className="p-6">
                          <ul className="list-disc pl-5 space-y-2">
                            {result.key_concepts.map((concept, index) => (
                              <li key={index} className="text-sm">{concept}</li>
                            ))}
                          </ul>
                        </div>
                      </Card>
                    )}

                    {result.rigor_evaluation && (
                      <Card className="overflow-hidden">
                        <div className="p-4 bg-editor-line bg-opacity-30 flex items-center">
                          <Calculator className="h-5 w-5 text-info mr-2" />
                          <h3 className="text-lg font-semibold">Mathematical Rigor Evaluation</h3>
                        </div>
                        <div className="p-6">
                          <p className="text-sm whitespace-pre-line">{result.rigor_evaluation}</p>
                        </div>
                      </Card>
                    )}

                    {result.connections && result.connections.length > 0 && (
                      <Card className="overflow-hidden">
                        <div className="p-4 bg-editor-line bg-opacity-30 flex items-center">
                          <Network className="h-5 w-5 text-secondary mr-2" />
                          <h3 className="text-lg font-semibold">Connections to Existing Knowledge</h3>
                        </div>
                        <div className="p-6">
                          <ul className="list-disc pl-5 space-y-2">
                            {result.connections.map((connection, index) => (
                              <li key={index} className="text-sm">{connection}</li>
                            ))}
                          </ul>
                        </div>
                      </Card>
                    )}

                    <Card className="overflow-hidden">
                      <div className="p-4 bg-editor-line bg-opacity-30 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                          <path d="m12 16 4-4M8 12h.01" />
                          <path d="M12 8h.01" />
                          <path d="M16 12h.01" />
                        </svg>
                        <h3 className="text-lg font-semibold">Recommendation</h3>
                      </div>
                      <div className="p-6">
                        <p className="text-sm whitespace-pre-line">{result.recommendation}</p>
                      </div>
                    </Card>

                    <div className="flex justify-end">
                      <Button onClick={() => setActiveTab("input")} variant="outline" className="mt-4">
                        Back to Input
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}