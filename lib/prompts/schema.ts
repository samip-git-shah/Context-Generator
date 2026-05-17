import { z } from "zod";

export const GeneratedPromptSchema = z.object({
  structured: z.object({
    role: z.string().min(1),
    context: z.string().min(1),
    objective: z.string().min(1),
    style: z.string().min(1),
    tone: z.string().min(1),
    audience: z.string().min(1),
    guardrails: z.string().min(1),
    response_format: z.string().min(1),
  }),
  plain_text: z.string().min(1),
  assumptions: z.array(z.string()).default([]),
});

export type GeneratedPrompt = z.infer<typeof GeneratedPromptSchema>;
