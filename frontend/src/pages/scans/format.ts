/**
 * probability/uncertainty come back from the API as 0-1 floats (verified
 * against the live backend's app/ml/inference.py: compute_risk_level
 * compares them straight to 0.4/0.7 thresholds). One decimal place, per
 * the work order ("73.2%, not 0.7321999999") — Intl's percent style
 * multiplies by 100 and appends "%" for us, so the output matches exactly,
 * but now adapts to the visitor's own locale instead of a hardcoded one.
 */
const percentFormatter = new Intl.NumberFormat(undefined, {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function formatPercent(value: number): string {
  return percentFormatter.format(value);
}

const timestampFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatTimestamp(iso: string): string {
  return timestampFormatter.format(new Date(iso));
}
