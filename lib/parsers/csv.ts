import Papa from "papaparse";

export async function parseCsv(buffer: ArrayBuffer): Promise<string> {
  const text = new TextDecoder().decode(buffer);
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
  return result.data.map((row) => row.join(",")).join("\n");
}
