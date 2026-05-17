"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { SettingsDialog } from "@/components/SettingsDialog";
import { PromptInput } from "@/components/workspace/PromptInput";
import { AttachmentDropzone, type Attachment } from "@/components/workspace/AttachmentDropzone";
import { StructuredView } from "@/components/workspace/StructuredView";
import { PlainTextView } from "@/components/workspace/PlainTextView";
import { getStoredModel, hasStoredKey, isStoredKeyEncrypted, loadKey } from "@/lib/storage";
import { visibleModels } from "@/lib/llm/models";
import { generatePrompt } from "@/lib/llm/orchestrate";
import { summarizeIfNeededBrowser } from "@/lib/llm/summarizeBrowser";
import { estimateTokens } from "@/lib/parsers/tokens";
import { APP_CONFIG } from "@/config/app.config";
import { BYOKError } from "@/lib/llm/browserClient";
import type { GeneratedPrompt } from "@/lib/prompts/schema";

export function Workspace() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tab, setTab] = useState<"structured" | "plain">("structured");

  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedPrompt | null>(null);
  const [keyReady, setKeyReady] = useState(false);

  useEffect(() => { setKeyReady(hasStoredKey()); }, [settingsOpen]);
  useEffect(() => { setKeyReady(hasStoredKey()); }, []);

  const promptReady = prompt.trim().length > 0;
  const canUseAttachments = promptReady;
  const canGenerate = promptReady && keyReady && !generating;

  async function resolveKey(): Promise<string | null> {
    if (!hasStoredKey()) return null;
    if (isStoredKeyEncrypted()) {
      const passphrase = window.prompt("Enter your key passphrase:") ?? "";
      const k = await loadKey(passphrase).catch(() => null);
      if (!k) toast.error("Wrong passphrase");
      return k;
    }
    return loadKey();
  }

  async function handleGenerate() {
    if (!promptReady) {
      toast.error("Enter a basic prompt first");
      return;
    }
    if (!hasStoredKey()) {
      toast.error("Add your API key first");
      setSettingsOpen(true);
      return;
    }

    const apiKey = await resolveKey();
    if (!apiKey) return;

    const modelId = getStoredModel(visibleModels()[0]?.id ?? "");
    setGenerating(true);
    setResult(null);

    try {
      let attachmentBlock: string | undefined;
      if (attachments.length > 0) {
        attachmentBlock = await processAttachments(attachments, modelId, apiKey);
      }

      const data = await generatePrompt({
        basicPrompt: prompt,
        modelId,
        apiKey,
        attachmentBlock,
      });
      setResult(data);
      toast.success("Prompt generated");
    } catch (err) {
      const msg = err instanceof BYOKError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Generation failed";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <Header keyReady={keyReady} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden p-4 md:grid-cols-2">
        {/* LEFT — split horizontally */}
        <div className="grid grid-rows-2 gap-4 overflow-hidden">
          <section className="flex flex-col rounded-lg border border-primary/30 bg-card p-4 neon-glow">
            <PromptInput value={prompt} onChange={setPrompt} />
          </section>

          <section className="relative flex flex-col gap-3 rounded-lg border border-primary/30 bg-card p-4 neon-glow">
            <div className="flex-1 overflow-hidden">
              <AttachmentDropzone
                files={attachments}
                onFilesChange={setAttachments}
                disabled={!canUseAttachments}
              />
            </div>

            {!keyReady && promptReady && (
              <button
                onClick={() => setSettingsOpen(true)}
                className="flex items-center justify-between gap-3 rounded-md border-2 border-primary bg-primary/10 px-4 py-3 text-left transition-colors hover:bg-primary/20"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <KeyRound className="h-4 w-4" />
                  Step 2 — Add your API key
                </span>
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  Open Settings →
                </span>
              </button>
            )}

            <Button size="lg" onClick={handleGenerate} disabled={!canGenerate}>
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Context Prompt</>
              )}
            </Button>

            {!promptReady && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/85 p-6 backdrop-blur-[1px]">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Lock className="h-6 w-6 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Step 1 — Enter a basic prompt above
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Attachments and the Generate button unlock once you've typed your idea.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT — tabs */}
        <section className="flex flex-col rounded-lg border border-accent/30 bg-card p-4 neon-glow-pink">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "structured" | "plain")} className="flex flex-1 flex-col">
            <TabsList className="self-start">
              <TabsTrigger value="structured">Structured Prompt</TabsTrigger>
              <TabsTrigger value="plain">Plain Text</TabsTrigger>
            </TabsList>
            <div className="mt-4 flex-1 overflow-auto pr-1">
              <TabsContent value="structured"><StructuredView data={result} /></TabsContent>
              <TabsContent value="plain"><PlainTextView data={result} /></TabsContent>
            </div>
          </Tabs>
        </section>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onChange={() => setKeyReady(hasStoredKey())}
      />
    </div>
  );
}

async function processAttachments(
  attachments: Attachment[],
  modelId: string,
  apiKey: string,
): Promise<string> {
  const fd = new FormData();
  for (const a of attachments) fd.append("files", a.file);
  const r = await fetch("/api/parse", { method: "POST", body: fd });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j.error ?? "Attachment processing failed");
  }
  const { extracted } = (await r.json()) as { extracted: { filename: string; text: string }[] };

  const summaries: { filename: string; summary: string }[] = [];
  for (const e of extracted) {
    const summary = await summarizeIfNeededBrowser({ text: e.text, modelId, apiKey });
    summaries.push({ filename: e.filename, summary });
  }

  const cap = APP_CONFIG.attachments.combinedTokenCap;
  let total = 0;
  const blocks: string[] = [];
  for (const s of summaries) {
    const block = `## ${s.filename}\n${s.summary}`;
    const t = estimateTokens(block);
    if (total + t > cap) {
      blocks.push(`## ${s.filename}\n[truncated to fit token budget]`);
      break;
    }
    blocks.push(block);
    total += t;
  }
  return blocks.join("\n\n");
}
