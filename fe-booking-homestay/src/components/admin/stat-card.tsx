import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
}

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
}: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {change && (
            <p
              className={`text-xs mt-2 ${
                trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend === "up" ? "↑" : "↓"} {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </Card>
  );
}
