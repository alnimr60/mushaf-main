#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

function parseRangeArg(value) {
  if (!value) return { start: 1, end: 10 };
  const parts = value.split("-");
  if (parts.length !== 2) throw new Error("Range must be like 1-10");
  const start = Number(parts[0]);
  const end = Number(parts[1]);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
    throw new Error("Invalid page range");
  }
  return { start, end };
}

function getArg(flag, fallback) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) return fallback;
  return process.argv[index + 1];
}

function normalizeArabic(value) {
  return String(value || "")
    .replace(/[ـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countArabicChars(value) {
  const matches = String(value || "").match(/[\u0600-\u06FF]/g);
  return matches ? matches.length : 0;
}

function countTotalChars(value) {
  return String(value || "").replace(/\s+/g, "").length;
}

function tokenize(value) {
  return normalizeArabic(value)
    .split(" ")
    .map((t) => t.trim())
    .filter(Boolean);
}

function jaccardSimilarity(tokensA, tokensB) {
  const a = new Set(tokensA);
  const b = new Set(tokensB);
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }

  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function readPageFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  const ayahText = Array.isArray(parsed?.ayahs)
    ? parsed.ayahs.map((a) => normalizeArabic(a?.text || "")).join(" ")
    : "";
  const rawPdfText = normalizeArabic(parsed?.source?.rawPdfText || "");
  return { ayahText, rawPdfText };
}

function main() {
  const range = parseRangeArg(getArg("--pages", "1-10"));
  const riwayaId = getArg("--riwaya", "warsh");
  const root = getArg("--root", path.join("public", "data", "text"));
  const out = getArg("--out", path.join("public", "data", "reports", `${riwayaId}-pdf-quality.json`));
  const targetDir = path.join(root, riwayaId);

  const pages = [];
  let lowQualityPages = 0;
  let missingPdfSourcePages = 0;

  for (let page = range.start; page <= range.end; page += 1) {
    const filePath = path.join(targetDir, `page_${page}.json`);
    if (!fs.existsSync(filePath)) {
      pages.push({
        page,
        status: "missing_page_json",
      });
      lowQualityPages += 1;
      continue;
    }

    const { ayahText, rawPdfText } = readPageFile(filePath);
    const ayahTokens = tokenize(ayahText);
    const rawTokens = tokenize(rawPdfText);
    const similarity = jaccardSimilarity(ayahTokens, rawTokens);
    const rawChars = countTotalChars(rawPdfText);
    const rawArabicChars = countArabicChars(rawPdfText);
    const arabicRatio = rawChars > 0 ? rawArabicChars / rawChars : 0;

    const hasPdfText = rawTokens.length > 0;
    if (!hasPdfText) missingPdfSourcePages += 1;

    const lowQuality = !hasPdfText || arabicRatio < 0.5 || similarity < 0.1;
    if (lowQuality) lowQualityPages += 1;

    pages.push({
      page,
      status: hasPdfText ? "ok" : "missing_pdf_text",
      ayahTokenCount: ayahTokens.length,
      pdfTokenCount: rawTokens.length,
      pdfArabicRatio: Number(arabicRatio.toFixed(3)),
      tokenSimilarity: Number(similarity.toFixed(3)),
      lowQuality,
    });
  }

  const report = {
    riwayaId,
    pageRange: `${range.start}-${range.end}`,
    summary: {
      totalPages: pages.length,
      lowQualityPages,
      missingPdfSourcePages,
    },
    pages,
  };

  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Report written to: ${out}`);
  console.log(`Pages: ${pages.length}`);
  console.log(`Low quality pages: ${lowQualityPages}`);
  console.log(`Missing PDF text pages: ${missingPdfSourcePages}`);

  if (lowQualityPages > 0) process.exit(2);
}

try {
  main();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
