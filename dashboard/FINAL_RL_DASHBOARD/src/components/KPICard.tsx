import React from 'react';
import { cn } from '../lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subValue?: string;
  subValueColor?: "green" | "red" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function KPICard({ title, value, subValue, subValueColor = "neutral", icon, className }: KPICardProps) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-lg border p-4 shadow-sm h-full flex flex-col justify-between", className)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground bg-muted p-1.5 rounded-md">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold font-mono">{value}</div>
        {subValue && (
          <p className={cn(
            "text-xs mt-1 font-medium",
            subValueColor === "green" && "text-chart-green",
            subValueColor === "red" && "text-chart-red",
            subValueColor === "neutral" && "text-muted-foreground"
          )}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}
