/**
 * Browser-side orchestration of the CO-STAR meta-prompt.
 * Calls the LLM, parses JSON, retries once on parse failure, validates with Zod.
 */

import { chat } from "./browserClient";
import { SYSTEM_PROMPT, RETRY_NUDGE, buildUserMessage } from "@/lib/prompts/system";
import { GeneratedPromptSchema, type GeneratedPrompt } from "@/lib/prompts/schema";
import { APP_CONFIG } from "@/config/app.config";

export async function generatePrompt(args: {
  basicPrompt: string;
  modelId: string;
  apiKey: string;
  attachmentBlock?: string;
}): Promise<GeneratedPrompt> {
  const userMessage = buildUserMessage({
    basicPrompt: args.basicPrompt,
    attachmentBlock: args.attachmentBlock,
  });

  const first = await chat({
    modelId: args.modelId,
    apiKey: args.apiKey,
    system: SYSTEM_PROMPT,
    user: userMessage,
    maxTokens: APP_CONFIG.generation.maxOutputTokens,
    temperature: APP_CONFIG.generation.temperature,
  });

  let parsed = tryParseJson(first);
  if (!parsed) {
    const retry = await chat({
      modelId: args.modelId,
      apiKey: args.apiKey,
      system: SYSTEM_PROMPT,
      user: `${userMessage}\n\n${RETRY_NUDGE}\n\nYour previous (invalid) output was:\n${first.slice(0, 2000)}`,
      maxTokens: APP_CONFIG.generation.maxOutputTokens,
      temperature: 0.1,
    });
    parsed = tryParseJson(retry);
  }
  if (!parsed) throw new Error("The model returned malformed JSON twice in a row.");

  const validated = GeneratedPromptSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error("The generated prompt didn't match the expected structure.");
  }
  return validated.data;
}

function tryParseJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try { return JSON.parse(cleaned); } catch { /* try harder */ }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { /* fall through */ }
  }
  return null;
}
