import React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DomainApplication {
  technique: string;
  description: string;
}

interface DomainKnowledgeItem {
  name: string;
  algorithmsApplied: number;
  recentApplications: DomainApplication[];
  learningAccuracy: number;
}

interface DomainKnowledgeProps {
  domains: DomainKnowledgeItem[];
}

export function DomainKnowledge({ domains = [] }: DomainKnowledgeProps) {
  const getDomainIcon = (name: string) => {
    if (name === "Mathematics") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.871 4A17.926 17.926 0 003 12c0 2.874.673 5.59 1.871 8m14.13 0a17.926 17.926 0 001.87-8c0-2.874-.673-5.59-1.87-8M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15m1-7h-.08a2 2 0 00-1.519.698L9.6 15.302A2 2 0 018.08 16H8" />
        </svg>
      );
    } else if (name === "Physics") {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      );
    }
  };

  const getDomainBgColor = (name: string) => {
    if (name === "Mathematics") return "bg-success";
    if (name === "Physics") return "bg-info";
    return "bg-secondary";
  };

  return (
    <div className="px-6 py-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Domain Knowledge Integration</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain, index) => (
          <Card key={index} className="overflow-hidden border border-editor-line">
            <div className="p-5">
              <div className="flex items-center">
                <div className={cn("flex-shrink-0 w-10 h-10 bg-opacity-20 rounded-md flex items-center justify-center", getDomainBgColor(domain.name))}>
                  {getDomainIcon(domain.name)}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{domain.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{domain.algorithmsApplied} algorithms applied</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm">
                <h4 className="font-medium mb-2">Recent Applications:</h4>
                <ul className="space-y-2">
                  {domain.recentApplications.map((app, appIndex) => (
                    <li key={appIndex} className="flex items-start">
                      <div className={cn("flex-shrink-0 w-4 h-4 mt-0.5 bg-opacity-20 rounded-full flex items-center justify-center", getDomainBgColor(domain.name))}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", getDomainBgColor(domain.name))}></div>
                      </div>
                      <div className="ml-2">
                        <p className="text-gray-300">
                          Applied <span className="text-primary-light">{app.technique}</span> to {app.description.toLowerCase()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-editor-line bg-opacity-50 px-5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Learning Accuracy: {domain.learningAccuracy}%</span>
                <button className="text-xs text-primary">Expand Knowledge</button>
              </div>
            </div>
          </Card>
        ))}

        {/* Add New Domain Card */}
        <Card className="overflow-hidden border border-dashed border-editor-line">
          <div className="p-5 h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-editor-line flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-sm font-medium mb-2">Add New Domain</h3>
            <p className="text-xs text-gray-400 mb-4">Expand AI capabilities with new knowledge domains</p>
            <button className="px-4 py-2 bg-editor-line hover:bg-opacity-80 rounded-md text-xs font-medium transition-colors">
              Connect Domain
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
