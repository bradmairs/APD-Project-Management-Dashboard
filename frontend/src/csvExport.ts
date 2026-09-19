// Converts an array of flat objects into a downloaded CSV file — used by
// ExportCsvButton. Values are stringified as-is (dates should already be
// formatted by the caller); commas/quotes/newlines are escaped per RFC 4180
// by quoting the field and doubling any embedded quotes.
function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(columns: { header: string; key: string }[], rows: Record<string, unknown>[]): string {
  const lines = [columns.map((c) => csvCell(c.header)).join(",")];
  for (const row of rows) {
    lines.push(columns.map((c) => csvCell(row[c.key])).join(","));
  }
  // Leading BOM so Excel opens the file as UTF-8 rather than guessing.
  return "﻿" + lines.join("\r\n");
}

export function downloadCsv(filename: string, columns: { header: string; key: string }[], rows: Record<string, unknown>[]) {
  const csv = toCsv(columns, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
