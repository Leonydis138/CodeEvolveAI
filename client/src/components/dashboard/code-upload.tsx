import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CodeEditor } from "@/components/ui/code-editor";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CodeUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadSuccess?: (result: any) => void;
}

export function CodeUpload({ open, onOpenChange, onUploadSuccess }: CodeUploadProps) {
  const { toast } = useToast();
  const [filename, setFilename] = useState("example.js");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Enter your code here\nfunction example() {\n  console.log('Hello world');\n}");
  const [isLoading, setIsLoading] = useState(false);
  const [optimizationTypes, setOptimizationTypes] = useState({
    performance: true,
    security: true,
    readability: true
  });
  const [selectedDomains, setSelectedDomains] = useState<string[]>(["Mathematics", "Computer Science"]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Code is required",
        description: "Please enter some code to analyze"
      });
      return;
    }

    setIsLoading(true);

    try {
      const selectedOptTypes = Object.entries(optimizationTypes)
        .filter(([_, isSelected]) => isSelected)
        .map(([type]) => type);

      const response = await apiRequest("POST", "/api/analyze", {
        code,
        filename,
        language,
        optimizationTypes: selectedOptTypes,
        applicableDomains: selectedDomains.length > 0 ? selectedDomains : undefined
      });

      const result = await response.json();
      
      toast({
        title: "Analysis complete",
        description: "Your code has been successfully analyzed"
      });
      
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
      
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: error.message || "Failed to analyze your code. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-editor-surface text-foreground">
        <DialogHeader>
          <DialogTitle>Upload Code for Analysis</DialogTitle>
          <DialogDescription>
            Enter your code below to have it analyzed and optimized by CodeEvolve AI.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
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
          
          <div className="space-y-2">
            <Label>Optimization Types</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="performance" 
                  checked={optimizationTypes.performance}
                  onCheckedChange={(checked) => 
                    setOptimizationTypes(prev => ({ ...prev, performance: !!checked }))
                  }
                />
                <Label htmlFor="performance" className="cursor-pointer">Performance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="security" 
                  checked={optimizationTypes.security}
                  onCheckedChange={(checked) => 
                    setOptimizationTypes(prev => ({ ...prev, security: !!checked }))
                  }
                />
                <Label htmlFor="security" className="cursor-pointer">Security</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="readability" 
                  checked={optimizationTypes.readability}
                  onCheckedChange={(checked) => 
                    setOptimizationTypes(prev => ({ ...prev, readability: !!checked }))
                  }
                />
                <Label htmlFor="readability" className="cursor-pointer">Readability</Label>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Applicable Domains</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mathematics" 
                  checked={selectedDomains.includes("Mathematics")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedDomains(prev => [...prev, "Mathematics"]);
                    } else {
                      setSelectedDomains(prev => prev.filter(d => d !== "Mathematics"));
                    }
                  }}
                />
                <Label htmlFor="mathematics" className="cursor-pointer">Mathematics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="physics" 
                  checked={selectedDomains.includes("Physics")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedDomains(prev => [...prev, "Physics"]);
                    } else {
                      setSelectedDomains(prev => prev.filter(d => d !== "Physics"));
                    }
                  }}
                />
                <Label htmlFor="physics" className="cursor-pointer">Physics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="computerscience" 
                  checked={selectedDomains.includes("Computer Science")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedDomains(prev => [...prev, "Computer Science"]);
                    } else {
                      setSelectedDomains(prev => prev.filter(d => d !== "Computer Science"));
                    }
                  }}
                />
                <Label htmlFor="computerscience" className="cursor-pointer">Computer Science</Label>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
