"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const getBadgeVariant = () => {
    if (!trend) return "default";
    switch (trend.type) {
      case "positive":
        return "success";
      case "negative":
        return "destructive";
      default:
        return "primaryLight";
    }
  };

  return (
    <Card className="rounded-3xl hover:shadow-md hover:border-primary/40 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          {/* Icon container */}
          <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary border border-primary/15 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
          
          {/* Trend Badge */}
          {trend && (
            <Badge variant={getBadgeVariant() as any} className="text-[10px] sm:text-[11px] font-bold rounded-full px-2.5 py-0.5 text-right break-words max-w-[140px] truncate">
              {trend.value}
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            {title}
          </span>
          <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight font-serif mb-1 group-hover:text-primary transition-colors break-words">
            {value}
          </span>
          <span className="text-xs text-muted-foreground font-medium break-words">
            {subtext}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
