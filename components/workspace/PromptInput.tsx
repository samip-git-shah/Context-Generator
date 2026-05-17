"use client";

import { Textarea } from "@/components/ui/textarea";

export function PromptInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-2">
      <label className="text-xs font-bold uppercase tracking-wider text-primary">
        Step 1 — Your basic prompt
      </label>
      <Textarea
        placeholder="e.g. Build a calorie tracker for working professionals"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 resize-none"
      />
    </div>
  );
}
