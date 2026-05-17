/**
 * Cheap, dependency-free token estimator. Rule of thumb: ~4 chars per token.
 * Good enough for budgeting attachment payloads — we don't need exact counts.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n…[truncated]";
}
