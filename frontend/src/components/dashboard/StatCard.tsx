"use client";

import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    type: "positive" | "negative" | "info";
  };
}

export default function StatCard({ title, value, subtext, icon: Icon, trend }: StatCardProps) {
  const getTrendStyle = () => {
    if (!trend) return "";
    switch (trend.type) {
      case "positive":
        return "bg-secondary-light text-secondary border border-secondary/20";
      case "negative":
        return "bg-red-50 text-red-500 border border-red-100";
      default:
        return "bg-primary-light text-primary border border-primary/20";
    }
  };

  return (
    <div className="bg-white border border-border-peach rounded-3xl p-6 shadow-card hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        {/* Icon container with background glow */}
        <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
          <Icon className="w-6 h-6" />
        </div>
        
        {/* Trend Indicator */}
        {trend && (
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getTrendStyle()}`}>
            {trend.value}
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-[13px] font-bold text-foreground/45 uppercase tracking-wider mb-1">
          {title}
        </span>
        <span className="text-3xl font-extrabold text-foreground tracking-tight font-serif mb-1 group-hover:text-primary transition-colors">
          {value}
        </span>
        <span className="text-xs text-foreground/50 font-medium">
          {subtext}
        </span>
      </div>
    </div>
  );
}
