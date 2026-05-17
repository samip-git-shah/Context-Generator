/**
 * Browser-side LLM client. Calls each provider's API directly from the user's
 * browser with their BYOK key. Our server is NEVER on the key's path.
 *
 * Each provider exposes a chat-style endpoint that accepts a system prompt and
 * a user message and returns text. We normalize the four providers behind a
 * single `chat()` function.
 */

import { findModel, type Provider } from "./models";

export class BYOKError extends Error {
  constructor(message: string, public status: number = 0) {
    super(message);
  }
}

export type ChatArgs = {
  modelId: string;
  apiKey: string;
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
};

export async function chat(args: ChatArgs): Promise<string> {
  const entry = findModel(args.modelId);
  if (!entry) throw new BYOKError(`Unknown model: ${args.modelId}`);
  switch (entry.provider) {
    case "openai":    return openai(args, entry.id);
    case "anthropic": return anthropic(args, entry.id);
    case "google":    return google(args, entry.id);
    case "mistral":   return mistral(args, entry.id);
  }
}

async function openai(a: ChatArgs, model: string): Promise<string> {
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${a.apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: a.temperature ?? 0.4,
      max_tokens: a.maxTokens ?? 1400,
      messages: [
        { role: "system", content: a.system },
        { role: "user", content: a.user },
      ],
    }),
  });
  if (!r.ok) throw await fail(r, "OpenAI");
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function anthropic(a: ChatArgs, model: string): Promise<string> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": a.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: a.maxTokens ?? 1400,
      temperature: a.temperature ?? 0.4,
      system: a.system,
      messages: [{ role: "user", content: a.user }],
    }),
  });
  if (!r.ok) throw await fail(r, "Anthropic");
  const j = await r.json();
  const block = (j.content ?? []).find((b: { type: string }) => b.type === "text");
  return block?.text ?? "";
}

async function google(a: ChatArgs, model: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(a.apiKey)}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: a.system }] },
      contents: [{ role: "user", parts: [{ text: a.user }] }],
      generationConfig: {
        temperature: a.temperature ?? 0.4,
        maxOutputTokens: a.maxTokens ?? 1400,
      },
    }),
  });
  if (!r.ok) throw await fail(r, "Google");
  const j = await r.json();
  const parts = j.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p: { text?: string }) => p.text ?? "").join("");
}

async function mistral(a: ChatArgs, model: string): Promise<string> {
  const r = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${a.apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: a.temperature ?? 0.4,
      max_tokens: a.maxTokens ?? 1400,
      messages: [
        { role: "system", content: a.system },
        { role: "user", content: a.user },
      ],
    }),
  });
  if (!r.ok) throw await fail(r, "Mistral");
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}

async function fail(r: Response, name: string): Promise<BYOKError> {
  const text = await r.text().catch(() => "");
  // Sanitize: never echo back the key even if a provider mistakenly returned it.
  const safe = text.slice(0, 400).replace(/sk-[A-Za-z0-9_\-]{12,}/g, "[KEY]").replace(/AIza[0-9A-Za-z_\-]{15,}/g, "[KEY]");
  if (r.status === 401 || r.status === 403) {
    return new BYOKError(`${name} rejected your API key (HTTP ${r.status}). Re-check it in Settings.`, r.status);
  }
  if (r.status === 429) {
    return new BYOKError(`${name} rate-limited your key (HTTP 429). Try again in a few seconds.`, r.status);
  }
  return new BYOKError(`${name} error (HTTP ${r.status}): ${safe || "no body"}`, r.status);
}

export function providerOf(modelId: string): Provider | null {
  return findModel(modelId)?.provider ?? null;
}
