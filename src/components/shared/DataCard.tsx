import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DataCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const DataCard = ({ children, className, onClick, hover = true }: DataCardProps) => {
  return (
    <Card
      className={cn(
        "p-4 md:p-6 bg-card border-border transition-all duration-200",
        hover && "hover:shadow-md hover:border-primary/20 cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
};

export default DataCard;