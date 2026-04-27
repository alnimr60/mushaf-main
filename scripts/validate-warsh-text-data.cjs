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

async function fetchWarshPage(pageNumber) {
  const url = `https://api.quran.com/api/v4/quran/verses/uthmani_warsh?page_number=${pageNumber}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for page ${pageNumber}`);
  const data = await res.json();
  return (data.verses || []).map((v) =>
    normalizeArabic(
      v.text_uthmani_warsh ||
        v.text_uthmani ||
        v.text_imlaei ||
        (Array.isArray(v.words)
          ? v.words
              .map((w) => w?.text_uthmani || w?.text_imlaei || w?.text || w?.char || "")
              .filter(Boolean)
              .join(" ")
          : ""),
    ),
  );
}

function readLocalPage(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed?.ayahs)) return [];
  return parsed.ayahs.map((a) => normalizeArabic(a.text));
}

async function main() {
  const range = parseRangeArg(getArg("--pages", "1-10"));
  const riwayaId = getArg("--riwaya", "warsh");
  const root = getArg("--root", path.join("public", "data", "text"));
  const targetDir = path.join(root, riwayaId);

  let mismatchPages = 0;
  for (let page = range.start; page <= range.end; page += 1) {
    const filePath = path.join(targetDir, `page_${page}.json`);
    if (!fs.existsSync(filePath)) {
      mismatchPages += 1;
      console.log(`page ${page}: missing local file`);
      continue;
    }

    const localAyahs = readLocalPage(filePath);
    const apiAyahs = await fetchWarshPage(page);

    let mismatches = 0;
    const maxLen = Math.max(localAyahs.length, apiAyahs.length);
    for (let i = 0; i < maxLen; i += 1) {
      if ((localAyahs[i] || "") !== (apiAyahs[i] || "")) mismatches += 1;
    }

    if (mismatches > 0) {
      mismatchPages += 1;
      console.log(`page ${page}: ${mismatches} ayah mismatch(es)`);
    } else {
      console.log(`page ${page}: OK`);
    }
  }

  if (mismatchPages > 0) {
    console.log(`Validation finished with ${mismatchPages} page(s) needing review.`);
    process.exit(2);
  }

  console.log("Validation passed for all requested pages.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
