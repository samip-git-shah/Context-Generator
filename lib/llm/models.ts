/**
 * Model registry. Edit this list to add/remove/deprecate models in the
 * Settings dropdown. Keep entries minimal — just enough to render the UI
 * and pick the right SDK adapter.
 *
 * To add a new model: append a new entry. That's all.
 * To deprecate a model: set `deprecated: true` — it's hidden from the UI
 * but old records still resolve, so existing users don't break.
 */

export type Provider = "openai" | "anthropic" | "google" | "mistral";

export type ModelEntry = {
  id: string;
  label: string;
  provider: Provider;
  cheap?: boolean; // used as the attachment summarizer
  deprecated?: boolean;
};

export const MODELS: ModelEntry[] = [
  // OpenAI
  { id: "gpt-4o",        label: "OpenAI · GPT-4o",         provider: "openai" },
  { id: "gpt-4o-mini",   label: "OpenAI · GPT-4o mini",    provider: "openai", cheap: true },
  { id: "gpt-4.1",       label: "OpenAI · GPT-4.1",        provider: "openai" },
  { id: "gpt-4.1-mini",  label: "OpenAI · GPT-4.1 mini",   provider: "openai" },

  // Anthropic
  { id: "claude-opus-4-5",     label: "Anthropic · Claude Opus 4.5",     provider: "anthropic" },
  { id: "claude-sonnet-4-5",   label: "Anthropic · Claude Sonnet 4.5",   provider: "anthropic" },
  { id: "claude-haiku-4-5",    label: "Anthropic · Claude Haiku 4.5",    provider: "anthropic", cheap: true },

  // Google
  { id: "gemini-2.0-flash",         label: "Google · Gemini 2.0 Flash",         provider: "google", cheap: true },
  { id: "gemini-2.5-pro",           label: "Google · Gemini 2.5 Pro",           provider: "google" },

  // Mistral
  { id: "mistral-large-latest", label: "Mistral · Large", provider: "mistral" },
  { id: "mistral-small-latest", label: "Mistral · Small", provider: "mistral", cheap: true },
];

export function findModel(id: string): ModelEntry | undefined {
  return MODELS.find((m) => m.id === id);
}

export function visibleModels(): ModelEntry[] {
  return MODELS.filter((m) => !m.deprecated);
}

export function cheapModelFor(provider: Provider): ModelEntry | undefined {
  return MODELS.find((m) => m.provider === provider && m.cheap && !m.deprecated);
}
