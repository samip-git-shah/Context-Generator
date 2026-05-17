"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GeneratedPrompt } from "@/lib/prompts/schema";

const SECTIONS: Array<{ key: keyof GeneratedPrompt["structured"]; label: string }> = [
  { key: "role",            label: "ROLE" },
  { key: "context",         label: "CONTEXT" },
  { key: "objective",       label: "OBJECTIVE" },
  { key: "style",           label: "STYLE" },
  { key: "tone",            label: "TONE" },
  { key: "audience",        label: "AUDIENCE" },
  { key: "guardrails",      label: "GUARDRAILS" },
  { key: "response_format", label: "RESPONSE FORMAT" },
];

export function StructuredView({ data }: { data: GeneratedPrompt | null }) {
  if (!data) return <EmptyState />;

  const copyText = SECTIONS.map(
    ({ key, label }) => `${label}\n${data.structured[key].trim()}`,
  ).join("\n\n");

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-primary/40 bg-background/40">
        <div className="flex items-center justify-between border-b border-border/50 bg-card px-4 py-2">
          <span className="text-sm font-bold uppercase tracking-wide text-primary">
            Structured prompt
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(copyText);
              toast.success("Copied");
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copy all
          </Button>
        </div>
        <div className="space-y-5 p-4">
          {SECTIONS.map(({ key, label }) => (
            <div key={key}>
              <div className="text-xs font-bold uppercase tracking-widest text-primary">
                {label}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                {data.structured[key]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {data.assumptions.length > 0 && (
        <div className="rounded-md border border-accent/40 bg-accent/5 p-4">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wide text-accent">
            Assumptions made
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {data.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 rounded-md border border-dashed border-primary/30 bg-background/40 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">
        Your structured prompt will appear here.
      </p>
      <p className="text-xs text-muted-foreground">
        Enter a basic prompt on the left, then click Generate Context Prompt.
      </p>
    </div>
  );
}
