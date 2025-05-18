import React from "react";
import { MetricsCard } from "@/components/ui/metrics-card";

interface MetricsOverviewProps {
  performanceScore: number;
  securityScore: number;
  readabilityScore: number;
  performanceChange?: number;
  securityChange?: number;
  readabilityChange?: number;
  lastPerformanceOptimized?: string;
  securityVulnerabilitiesFixed?: number;
  readabilityImprovements?: number;
}

export function MetricsOverview({
  performanceScore = 87,
  securityScore = 92,
  readabilityScore = 78,
  performanceChange = 12,
  securityChange = 5,
  readabilityChange = 18,
  lastPerformanceOptimized = "2 hours ago",
  securityVulnerabilitiesFixed = 3,
  readabilityImprovements = 12,
}: MetricsOverviewProps) {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricsCard
        title="Performance Score"
        value={performanceScore}
        change={performanceChange}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
        lastUpdated={lastPerformanceOptimized}
        detailsLink="#"
      />
      
      <MetricsCard
        title="Security Score"
        value={securityScore}
        change={securityChange}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        additionalInfo={`${securityVulnerabilitiesFixed} vulnerabilities fixed`}
        detailsLink="#"
      />
      
      <MetricsCard
        title="Readability Score"
        value={readabilityScore}
        change={readabilityChange}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        additionalInfo={`${readabilityImprovements} readability improvements`}
        detailsLink="#"
      />
    </div>
  );
}
