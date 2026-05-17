"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GeneratedPrompt } from "@/lib/prompts/schema";

export function PlainTextView({ data }: { data: GeneratedPrompt | null }) {
  if (!data) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Your plain-text prompt will appear here.
        </p>
        <p className="text-xs text-muted-foreground">
          Same content as the Structured tab — without section labels.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-accent/40 bg-background/40">
        <div className="flex items-center justify-between border-b border-border/50 bg-card px-4 py-2">
          <span className="text-sm font-bold uppercase tracking-wide text-accent">Plain text</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(data.plain_text);
              toast.success("Plain text copied");
            }}
          >
            <Copy className="h-3.5 w-3.5" /> Copy all
          </Button>
        </div>
        <p className="whitespace-pre-wrap p-4 text-sm leading-relaxed">
          {data.plain_text}
        </p>
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
