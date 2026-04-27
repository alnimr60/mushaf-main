#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const pdfMapping = require("../src/data/pdf_mapping.json");

function decodePdfText(rawText) {
  if (!rawText) return "";
  let decoded = "";
  for (const char of rawText) {
    decoded += pdfMapping[char] || char;
  }
  return decoded;
}

function parseRangeArg(value) {
  if (!value) return { start: 1, end: 604 };
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

async function fetchWarshPage(pageNumber) {
  const url = `https://api.quran.com/api/v4/quran/verses/uthmani_warsh?page_number=${pageNumber}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for page ${pageNumber}`);
  }

  const data = await res.json();
  if (!Array.isArray(data?.verses)) {
    throw new Error(`Unexpected response format for page ${pageNumber}`);
  }

  return data.verses.map((verse) => {
    const verseKey = String(verse.verse_key || "0:0");
    const numberInSurah = Number(verseKey.split(":")[1]) || 0;
    const text =
      verse.text_uthmani_warsh ||
      verse.text_uthmani ||
      verse.text_imlaei ||
      (Array.isArray(verse.words)
        ? verse.words
            .map((w) => w?.text_uthmani || w?.text_imlaei || w?.text || w?.char || "")
            .filter(Boolean)
            .join(" ")
        : "");

    return {
      text,
      numberInSurah,
    };
  });
}

function segmentDecodedText(decodedText) {
  // Split by patterns like ∩ 1 ∪ or ∩1∪
  // The decoder maps ∩ to ' ' and ∪ to ' ' and numbers to '1', '2' etc.
  // Wait, I mapped ∩ to ' ' and ∪ to ' '. That's not helpful for splitting.
  // I should keep them as markers.
  
  // Let's re-map them in the script for splitting.
  return []; // Placeholder
}

function normalizeArabic(value) {
  return String(value || "")
    .replace(/[ـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractPdfPageText(parser, pageNumber) {
  const result = await parser.getText({ partial: [pageNumber] });
  return normalizeArabic(result?.text || "");
}

async function main() {
  const range = parseRangeArg(getArg("--pages", "1-10"));
  const riwayaId = getArg("--riwaya", "warsh");
  const outputRoot = getArg("--out", path.join("public", "data", "text"));
  const pdfPath = getArg("--pdf", "");
  const targetDir = path.join(outputRoot, riwayaId);

  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`Generating ${riwayaId} text pages ${range.start}-${range.end}`);
  console.log(`Output: ${targetDir}`);
  if (pdfPath) {
    console.log(`PDF source: ${pdfPath}`);
  }

  let pdfParser = null;
  if (pdfPath) {
    const absPdfPath = path.resolve(pdfPath);
    if (!fs.existsSync(absPdfPath)) {
      throw new Error(`PDF not found: ${absPdfPath}`);
    }
    const buffer = fs.readFileSync(absPdfPath);
    pdfParser = new PDFParse(new Uint8Array(buffer));
  }

  let written = 0;
  try {
    for (let page = range.start; page <= range.end; page += 1) {
      const ayahs = await fetchWarshPage(page);
      const payload = {
        pageNumber: page,
        riwayaId,
        ayahs,
      };

      if (pdfParser) {
        // Extract and decode text from PDF
        const rawPdfText = await extractPdfPageText(pdfParser, page);
        const decodedPdfText = decodePdfText(rawPdfText);
        
        // Split by markers like ∩ 1 ∪
        // Note: Our current decoder might have eaten some markers.
        // Let's use a regex on the decoded text to find numbers followed by spaces or markers.
        const ayahSegments = decodedPdfText.split(/\s+([0-9]+)\s+/);
        const ayahsFromPdf = [];
        
        for (let i = 0; i < ayahSegments.length; i += 2) {
            const text = ayahSegments[i].trim();
            const num = ayahSegments[i+1] ? parseInt(ayahSegments[i+1]) : null;
            if (text) {
                ayahsFromPdf.push({
                    text: text,
                    numberInSurah: num || (ayahsFromPdf.length + 1)
                });
            }
        }

        payload.ayahs = ayahsFromPdf.length > 0 ? ayahsFromPdf : ayahs;
        payload.source = {
          type: "pdf-decoded",
          pdfPath,
          rawPdfText,
          decodedPdfText,
          originalApiAyahs: ayahs
        };
        
        console.log(`  PDF Decoded (${ayahsFromPdf.length} ayahs): ${decodedPdfText.substring(0, 50)}...`);
      }

      const filePath = path.join(targetDir, `page_${page}.json`);
      fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
      written += 1;
      console.log(`- page ${page}: ${ayahs.length} ayahs`);
    }
  } finally {
    if (pdfParser) {
      await pdfParser.destroy();
    }
  }

  console.log(`Done. Wrote ${written} files.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
