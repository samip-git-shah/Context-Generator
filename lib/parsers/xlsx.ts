import * as XLSX from "xlsx";

export async function parseXlsx(buffer: ArrayBuffer): Promise<string> {
  const wb = XLSX.read(buffer, { type: "array" });
  const blocks: string[] = [];
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    blocks.push(`# Sheet: ${name}\n${csv}`);
  }
  return blocks.join("\n\n");
}
