import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard = ({ title, value, icon, trend, className }: StatsCardProps) => {
  return (
    <Card className={cn("p-6 flex items-center gap-4 rounded-2xl hover:shadow-md transition-all duration-200", className)}>
      {icon && (
        <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
        </div>
        {trend && (
          <p
            className={cn(
              "text-xs font-medium mt-1 truncate",
              trend.isPositive ? "text-emerald-600" : "text-rose-600"
            )}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% from last month
          </p>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;