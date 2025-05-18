import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface MetricsCardProps {
  title: string;
  value: number;
  change?: number;
  icon: React.ReactNode;
  lastUpdated?: string;
  detailsLink?: string;
  additionalInfo?: string;
  className?: string;
}

export function MetricsCard({
  title,
  value,
  change,
  icon,
  lastUpdated,
  detailsLink,
  additionalInfo,
  className,
}: MetricsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-primary bg-opacity-20 rounded-md flex items-center justify-center">
            {icon}
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">{title}</h3>
            <div className="flex items-end space-x-1">
              <p className="text-2xl font-semibold">{value}</p>
              {change !== undefined && (
                <p className={cn(
                  "text-sm font-medium pb-0.5",
                  change >= 0 ? "text-success" : "text-destructive"
                )}>
                  {change >= 0 ? "+" : ""}{change}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div 
            className="relative w-full h-2 bg-editor-line rounded overflow-hidden" 
            style={{ 
              "--metric-value": `${Math.min(100, Math.max(0, value))}%` 
            } as React.CSSProperties}
          >
            <div 
              className="absolute h-full bg-primary bg-opacity-30 rounded"
              style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
          </div>
        </div>
      </div>
      <div className="bg-editor-line bg-opacity-50 px-5 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">
            {lastUpdated ? `Last updated: ${lastUpdated}` : additionalInfo}
          </span>
          {detailsLink && (
            <a href={detailsLink} className="text-primary">Details</a>
          )}
        </div>
      </div>
    </Card>
  );
}
