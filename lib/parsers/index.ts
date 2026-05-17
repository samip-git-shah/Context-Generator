import { parsePdf } from "./pdf";
import { parseDocx } from "./docx";
import { parseXlsx } from "./xlsx";
import { parseCsv } from "./csv";

export type ParsedAttachment = { filename: string; text: string };

export async function parseAttachment(
  filename: string,
  buffer: ArrayBuffer,
): Promise<ParsedAttachment> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  const text = await dispatch(ext, buffer);
  return { filename, text };
}

async function dispatch(ext: string, buffer: ArrayBuffer): Promise<string> {
  switch (ext) {
    case "pdf":  return parsePdf(buffer);
    case "docx": return parseDocx(buffer);
    case "xlsx": return parseXlsx(buffer);
    case "csv":  return parseCsv(buffer);
    case "doc":
      throw new Error("Legacy .doc files aren't supported. Please re-save as .docx.");
    default:
      throw new Error(`Unsupported file type: .${ext}`);
  }
}
