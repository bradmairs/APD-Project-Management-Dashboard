// Converts an array of flat objects into a downloaded CSV file — used by
// ExportCsvButton. Values are stringified as-is (dates should already be
// formatted by the caller); commas/quotes/newlines are escaped per RFC 4180
// by quoting the field and doubling any embedded quotes.
// Spreadsheet apps treat a cell that starts with = + - @ (or a tab/CR) as a
// formula, so a user-entered name like "=HYPERLINK(...)" would execute when
// someone opens the export (CSV/formula injection). Prefixing a single quote
// makes it inert text. Plain numeric-looking values ("-$23,696", "+5") are
// left alone — they can't carry a formula, and prefixing them would turn a
// legitimate negative amount into text.
const NUMERIC_LIKE = /^[-+]?\$?[\d,]*\.?\d+%?$/;

function neutraliseFormula(str: string): string {
  if (!/^[=+\-@\t\r]/.test(str) || str === "-") return str; // lone "-" is just an empty-value placeholder
  return NUMERIC_LIKE.test(str) ? str : `'${str}`;
}

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = neutraliseFormula(String(value));
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
