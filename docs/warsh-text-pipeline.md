# Warsh Text Data Pipeline

## Why
This app can load text pages for riwayat from hosted JSON files.
For Warsh, we generate per-page JSON and host it in repo/CDN.

## Output format
Each page file should be:

```json
{
  "pageNumber": 1,
  "riwayaId": "warsh",
  "ayahs": [
    { "text": "...", "numberInSurah": 1 }
  ]
}
```

Path pattern:
- `public/data/text/warsh/page_1.json`
- `public/data/text/warsh/page_2.json`

## Generate sample pages
```bash
npm run gen:warsh:text -- --pages 1-10
```

Use your text-based PDF as hybrid source (recommended now):
```bash
npm run gen:warsh:text -- --pages 1-10 --pdf "D:\Users\Alnimr\Downloads\Telegram Desktop\01.02ورش عن نافع المدنـــــي.pdf"
```

Generate full Warsh:
```bash
npm run gen:warsh:text -- --pages 1-604
```

## Validate generated pages
```bash
npm run validate:warsh:text -- --pages 1-10
```

## Measure PDF extraction quality (next step)
This checks how close `source.rawPdfText` is to the ayah text and flags weak pages.

```bash
npm run report:warsh:pdf -- --pages 1-10
```

Custom output path:
```bash
npm run report:warsh:pdf -- --pages 1-10 --out "public/data/reports/warsh-pdf-quality.json"
```

Report file includes:
- `summary.lowQualityPages`
- per-page `pdfArabicRatio`
- per-page `tokenSimilarity`

## Hosting
- Commit generated files to repo (or a dedicated data repo).
- Host through static hosting (GitHub Pages, jsDelivr, Cloudflare R2, etc.).
- Set app env var:
  - `VITE_TEXT_DATA_BASE_URL=https://your-hosted-domain-or-cdn`

If this variable is empty, the app reads from local `/data/text/...` paths.
If hosted/local file is missing, Warsh falls back to Quran.com API.

## Current hybrid behavior
- `ayahs` are generated from trusted Warsh API text.
- If `--pdf` is provided, each output page also stores `source.rawPdfText` from the PDF page.
- This gives immediate stability while we tune full PDF-first ayah segmentation safely.
