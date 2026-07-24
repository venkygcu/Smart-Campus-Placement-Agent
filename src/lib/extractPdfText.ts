/**
 * extractPdfText.ts
 * Proper PDF text extractor using Node.js built-in zlib.
 * Zero external package dependencies.
 *
 * How it works:
 *  1. Finds all PDF stream objects in the file
 *  2. Checks if each stream uses FlateDecode (zlib) compression
 *  3. Decompresses using Node.js zlib.inflateSync
 *  4. Scans decompressed content for BT/ET text blocks with Tj/TJ operators
 *  5. Falls back to raw uncompressed BT/ET scan for uncompressed PDFs
 */

import { inflateSync, inflateRawSync } from "zlib";

export function extractPdfText(buffer: Buffer): string {
  const segments: string[] = [];

  // ── Step 1: Extract and decompress all FlateDecode streams ───────────────
  const decompressedStreams = extractDecompressedStreams(buffer);

  for (const content of decompressedStreams) {
    const texts = parseTextFromContentStream(content);
    if (texts.length) segments.push(texts.join(" "));
  }

  // ── Step 2: Also scan uncompressed portions (for uncompressed PDFs) ──────
  const rawText = buffer.toString("binary");
  const rawTexts = parseTextFromContentStream(rawText);
  if (rawTexts.length) segments.push(rawTexts.join(" "));

  const raw = segments
    .join("\n")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return raw;
}

// ── FlateDecode stream extraction ─────────────────────────────────────────────
function extractDecompressedStreams(buffer: Buffer): string[] {
  const results: string[] = [];
  const raw = buffer.toString("binary");

  // Find all stream/endstream pairs with their preceding dictionaries
  // We need to work in binary to properly extract compressed data
  let searchFrom = 0;

  while (searchFrom < raw.length) {
    const streamIdx = raw.indexOf("stream", searchFrom);
    if (streamIdx === -1) break;

    // Ensure it's a proper stream keyword (preceded by whitespace or \r\n)
    const before = raw[streamIdx - 1];
    if (before !== "\n" && before !== "\r" && before !== " ") {
      searchFrom = streamIdx + 6;
      continue;
    }

    // Find the dictionary preceding this stream (look back for <<...>>)
    const dictEnd = streamIdx;
    const dictStart = raw.lastIndexOf("<<", dictEnd);
    const dictText = dictStart >= 0 ? raw.slice(dictStart, dictEnd) : "";

    // Check if this stream uses FlateDecode
    const isFlate = /\/Filter\s*(?:\[?\s*\/FlateDecode|\[[\s\S]*?\/FlateDecode)/i.test(dictText);
    const isText = /\/Subtype\s*\/Form|\/Type\s*\/Page/i.test(dictText);
    // Skip image streams
    const isImage = /\/Subtype\s*\/Image/i.test(dictText);

    // Find stream data start (after "stream\n" or "stream\r\n")
    let dataStart = streamIdx + 6;
    if (raw[dataStart] === "\r") dataStart++;
    if (raw[dataStart] === "\n") dataStart++;

    // Find endstream
    const endIdx = raw.indexOf("endstream", dataStart);
    if (endIdx === -1) {
      searchFrom = streamIdx + 6;
      continue;
    }

    // Trim trailing whitespace before endstream
    let dataEnd = endIdx;
    while (dataEnd > dataStart && (raw[dataEnd - 1] === "\r" || raw[dataEnd - 1] === "\n")) {
      dataEnd--;
    }

    if (isFlate && !isImage) {
      // Extract the compressed bytes
      const compressedData = buffer.slice(dataStart, dataEnd);

      try {
        let decompressed: Buffer;
        try {
          decompressed = inflateSync(compressedData);
        } catch {
          // Some PDFs use raw deflate without zlib header
          decompressed = inflateRawSync(compressedData);
        }
        const content = decompressed.toString("utf-8");
        results.push(content);
      } catch {
        // Decompression failed — skip this stream
      }
    } else if (!isImage && !isFlate) {
      // Uncompressed stream — add raw content
      const content = raw.slice(dataStart, dataEnd);
      results.push(content);
    }

    searchFrom = endIdx + 9;
  }

  return results;
}

// ── Parse text operators from a PDF content stream ────────────────────────────
function parseTextFromContentStream(content: string): string[] {
  const results: string[] = [];
  const lines: string[] = [];

  // Extract BT...ET text object blocks
  const btEtPat = /BT([\s\S]*?)ET/g;
  let m: RegExpExecArray | null;

  while ((m = btEtPat.exec(content)) !== null) {
    const block = m[1];
    const line = extractFromBlock(block);
    if (line.trim()) lines.push(line);
  }

  if (lines.length) results.push(...lines);

  // Also look for Tj/TJ outside BT/ET (some generators emit these)
  if (results.length === 0) {
    const tjPat = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*(?:Tj|'|")/g;
    while ((m = tjPat.exec(content)) !== null) {
      const s = decodePdfString(m[1]);
      if (s.trim().length > 1) results.push(s);
    }
  }

  return results;
}

function extractFromBlock(block: string): string {
  const parts: string[] = [];

  // (string) Tj
  const tjPat = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
  let m: RegExpExecArray | null;
  while ((m = tjPat.exec(block)) !== null) {
    parts.push(decodePdfString(m[1]));
  }

  // [(str) gap (str)] TJ
  const tjArrPat = /\[([\s\S]*?)\]\s*TJ/g;
  while ((m = tjArrPat.exec(block)) !== null) {
    const inner = m[1];
    const strPat = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
    let sm: RegExpExecArray | null;
    const arr: string[] = [];
    while ((sm = strPat.exec(inner)) !== null) {
      const s = decodePdfString(sm[1]);
      if (s) arr.push(s);
    }
    if (arr.length) parts.push(arr.join(""));
  }

  // (string) ' — new line and show
  const primePat = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*'/g;
  while ((m = primePat.exec(block)) !== null) {
    parts.push(decodePdfString(m[1]));
  }

  return parts.join(" ").replace(/\s{2,}/g, " ").trim();
}

function decodePdfString(s: string): string {
  return s
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\\\/g, "\\")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\(\d{3})/g, (_, oct) => {
      const code = parseInt(oct, 8);
      return code >= 32 ? String.fromCharCode(code) : " ";
    })
    .replace(/[\x00-\x08\x0e-\x1f]/g, "");
}
