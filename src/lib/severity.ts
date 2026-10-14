export function severityLabel(severity: number): string {
  if (severity === 0) return "None";
  if (severity <= 3) return "Mild";
  if (severity <= 6) return "Moderate";
  if (severity <= 8) return "Severe";
  return "Very severe";
}

/** Pin / badge colour. Always paired with the number and label, never used alone. */
export function severityColor(severity: number): string {
  if (severity <= 3) return "#eab308";
  if (severity <= 6) return "#f97316";
  return "#dc2626";
}
