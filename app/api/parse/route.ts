/**
 * Pure text-extraction endpoint. Accepts file uploads, returns plain text per
 * file. No API key required — server only runs file parsers (PDF, DOCX, XLSX,
 * CSV) which are too heavy to ship to the browser. Summarization happens in
 * the browser using the user's BYOK key.
 */

import { NextResponse } from "next/server";
import { parseAttachment } from "@/lib/parsers";
import { truncateToTokens } from "@/lib/parsers/tokens";
import { APP_CONFIG } from "@/config/app.config";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);

    const cfg = APP_CONFIG.attachments;
    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400, headers: NO_STORE });
    }
    if (files.length > cfg.maxFiles) {
      return NextResponse.json({ error: `Max ${cfg.maxFiles} files` }, { status: 400, headers: NO_STORE });
    }
    const totalBytes = files.reduce((s, f) => s + f.size, 0);
    if (totalBytes > cfg.maxTotalSizeMB * 1024 * 1024) {
      return NextResponse.json({ error: `Combined size > ${cfg.maxTotalSizeMB}MB` }, { status: 400, headers: NO_STORE });
    }
    for (const f of files) {
      if (f.size > cfg.maxFileSizeMB * 1024 * 1024) {
        return NextResponse.json({ error: `${f.name} > ${cfg.maxFileSizeMB}MB` }, { status: 400, headers: NO_STORE });
      }
    }

    const extracted: { filename: string; text: string }[] = [];
    for (const file of files) {
      const buf = await file.arrayBuffer();
      const parsed = await parseAttachment(file.name, buf);
      extracted.push({
        filename: parsed.filename,
        text: truncateToTokens(parsed.text, cfg.perFileTokenCap),
      });
    }

    return NextResponse.json({ extracted }, { headers: NO_STORE });
  } catch (err) {
    logger.error("parse failed", err);
    const msg = err instanceof Error ? err.message : "Parse failed";
    return NextResponse.json({ error: msg }, { status: 500, headers: NO_STORE });
  }
}
