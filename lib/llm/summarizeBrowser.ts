/**
 * Browser-side attachment summarizer. Compresses long extracted text using the
 * cheap variant of the user's currently selected provider — keeping their
 * BYOK token bill bounded.
 */

import { chat } from "./browserClient";
import { cheapModelFor, findModel, type Provider } from "./models";
import { APP_CONFIG } from "@/config/app.config";
import { estimateTokens, truncateToTokens } from "@/lib/parsers/tokens";

const SUMMARY_PROMPT =
  "Compress this document for use as background context in another LLM prompt. Preserve facts, numbers, names, structure, and explicit instructions. Drop boilerplate, page headers, footers, signatures. Be terse but complete.";

export async function summarizeIfNeededBrowser(args: {
  text: string;
  modelId: string;
  apiKey: string;
}): Promise<string> {
  const cfg = APP_CONFIG.attachments;
  const tokens = estimateTokens(args.text);
  if (tokens <= cfg.summarizeAboveTokens) return args.text;

  const provider = findModel(args.modelId)?.provider as Provider | undefined;
  if (!provider) return truncateToTokens(args.text, cfg.perFileTokenCap);

  const cheap = cheapModelFor(provider);
  if (!cheap) return truncateToTokens(args.text, cfg.perFileTokenCap);

  if (tokens > cfg.perFileTokenCap) {
    const chunks = chunk(args.text, cfg.chunkTokens);
    const partials: string[] = [];
    for (const c of chunks) {
      partials.push(await one(c, cheap.id, args.apiKey, cfg.summaryTargetTokens));
    }
    return one(partials.join("\n\n"), cheap.id, args.apiKey, cfg.summaryTargetTokens);
  }

  return one(
    truncateToTokens(args.text, cfg.perFileTokenCap),
    cheap.id,
    args.apiKey,
    cfg.summaryTargetTokens,
  );
}

async function one(text: string, modelId: string, apiKey: string, maxTokens: number) {
  return (
    await chat({
      modelId,
      apiKey,
      system: SUMMARY_PROMPT,
      user: text,
      maxTokens,
      temperature: 0.2,
    })
  ).trim();
}

function chunk(text: string, perChunkTokens: number): string[] {
  const charsPerChunk = perChunkTokens * 4;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += charsPerChunk) {
    chunks.push(text.slice(i, i + charsPerChunk));
  }
  return chunks;
}
