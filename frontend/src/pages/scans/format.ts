import { format, parseISO } from "date-fns";

/**
 * probability/uncertainty come back from the API as 0-1 floats (verified
 * against the live backend's app/ml/inference.py: compute_risk_level
 * compares them straight to 0.4/0.7 thresholds). One decimal place, per
 * the work order ("73.2%, not 0.7321999999").
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatTimestamp(iso: string): string {
  return format(parseISO(iso), "MMM d, yyyy 'at' h:mm a");
}
