import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types/api";

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  low: {
    label: "Low risk",
    icon: CheckCircle2,
    className: "border-risk-low-border bg-risk-low-bg text-risk-low",
  },
  medium: {
    label: "Medium risk",
    icon: AlertTriangle,
    className: "border-risk-medium-border bg-risk-medium-bg text-risk-medium",
  },
  high: {
    label: "High risk",
    icon: AlertCircle,
    className: "border-risk-high-border bg-risk-high-bg text-risk-high",
  },
};

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

// The single source of risk-level styling and labels. Every other agent
// renders a risk level with this component instead of inventing their own
// color logic, and these colors are deliberately separate from --primary.
export function RiskBadge({ level, className }: RiskBadgeProps) {
  const { label, icon: Icon, className: colorClassName } = RISK_CONFIG[level];
  return (
    <Badge variant="outline" className={cn("font-medium", colorClassName, className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </Badge>
  );
}
