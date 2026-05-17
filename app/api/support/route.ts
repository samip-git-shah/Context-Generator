import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SupportSchema = z.object({
  email: z.string().email(),
  category: z.enum(["bug", "feature", "other"]),
  message: z.string().min(10).max(5_000),
  honeypot: z.string().max(0).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = SupportSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    if (parsed.data.honeypot) return NextResponse.json({ ok: true });

    if (!process.env.RESEND_API_KEY || !process.env.SUPPORT_INBOX_EMAIL) {
      // Email not configured — log and accept silently so the maintainer sees it in server logs.
      logger.info("support submission (no Resend configured)", parsed.data);
      return NextResponse.json({ ok: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.SUPPORT_FROM_EMAIL ?? "noreply@example.com",
      to: process.env.SUPPORT_INBOX_EMAIL,
      replyTo: parsed.data.email,
      subject: `[${parsed.data.category}] Context Generator feedback`,
      text: `From: ${parsed.data.email}\n\n${parsed.data.message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("support failed", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
