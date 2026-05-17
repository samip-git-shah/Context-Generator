/**
 * Logger that redacts anything resembling an API key before it touches console.
 * Use this everywhere instead of raw console.* — especially in /api/generate.
 */

const KEY_PATTERNS: RegExp[] = [
  /sk-[A-Za-z0-9_\-]{16,}/g,            // OpenAI / Anthropic / Mistral
  /AIza[0-9A-Za-z_\-]{20,}/g,            // Google API key
  /Bearer\s+[A-Za-z0-9._\-]{20,}/gi,     // bearer tokens
  /eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g, // JWTs
];

function redactValue(v: unknown): unknown {
  if (typeof v === "string") {
    let out = v;
    for (const p of KEY_PATTERNS) out = out.replace(p, "[REDACTED]");
    return out;
  }
  if (Array.isArray(v)) return v.map(redactValue);
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      o[k] = /key|token|authorization/i.test(k) ? "[REDACTED]" : redactValue(val);
    }
    return o;
  }
  return v;
}

export const logger = {
  info: (...a: unknown[]) => console.log(...a.map(redactValue)),
  warn: (...a: unknown[]) => console.warn(...a.map(redactValue)),
  error: (...a: unknown[]) => console.error(...a.map(redactValue)),
};
