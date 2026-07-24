import { NextRequest, NextResponse } from "next/server";
import { extractResumeData } from "@/lib/groq";
import { extractPdfText } from "@/lib/extractPdfText";

// Allow up to 30s for large resume parsing + Groq call
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    let text = "";

    if (file.type === "application/pdf") {
      // Pure-JS extraction — zero native dependencies, works everywhere
      text = extractPdfText(buffer);

      // Fallback: if the PDF is heavily compressed (Flate streams) and we
      // extracted very little, try to pull any readable ASCII from the raw bytes
      if (text.trim().length < 100) {
        text = extractRawAsciiFromPdf(buffer);
      }
    } else if (file.type.startsWith("text/")) {
      text = buffer.toString("utf-8");
    } else if (file.type.startsWith("image/")) {
      // Use Groq vision for image resumes
      const base64 = buffer.toString("base64");
      const Groq = (await import("groq-sdk")).default;
      const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const res = await groqClient.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } },
              { type: "text", text: "Extract all text from this resume image verbatim. Return only the plain text, no markdown." },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0,
      });
      text = res.choices[0]?.message?.content || "";
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF, image, or plain text file." },
        { status: 415 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file. Try uploading a text-based PDF or paste your resume as plain text." },
        { status: 422 }
      );
    }

    // RAG: truncate to 4000 chars before sending to LLM — covers 99% of resumes
    // Sanitize: strip PDF encoding artifacts (replacement chars, curly quotes
    // used as bullets, zero-width chars, control chars) before anything else
    text = sanitizePdfText(text);

    const truncatedText = text.length > 4000
      ? text.slice(0, 4000) + "\n...[truncated]"
      : text;

    const parsed = await extractResumeData(truncatedText);

    // Hard post-process: correct any URL field mismatches the AI may have made.
    // This catches cases like GitHub URL placed in linkedinUrl.
    correctUrlFields(parsed);

    // Store only 3000 chars of raw text — enough for RAG, not the full blob
    const rawTextForStorage = text.length > 3000 ? text.slice(0, 3000) : text;

    return NextResponse.json({ success: true, data: parsed, rawText: rawTextForStorage });
  } catch (err) {
    console.error("Resume parse error:", err);
    const message = err instanceof Error ? err.message : "Failed to parse resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Last-resort fallback: scan raw PDF bytes for printable ASCII sequences.
 * Useful for PDFs with compressed (Flate) streams where BT/ET parsing fails.
 */
function extractRawAsciiFromPdf(buffer: Buffer): string {
  const raw = buffer.toString("binary");
  const words: string[] = [];
  let current = "";

  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    // Collect printable ASCII and common whitespace
    if (code >= 32 && code <= 126) {
      current += raw[i];
    } else {
      if (current.length >= 3) {
        // Filter out PDF operators and binary noise — keep human-readable words
        const trimmed = current.trim();
        if (trimmed.length >= 3 && /[a-zA-Z]{2,}/.test(trimmed) && !/^[\d\s.]+$/.test(trimmed)) {
          words.push(trimmed);
        }
      }
      current = "";
    }
  }

  return words.join(" ");
}

/**
 * Deterministically correct URL field mismatches after LLM parsing.
 * Ensures linkedin.com URLs are always in linkedinUrl,
 * github.com URLs are always in githubUrl, etc.
 */
function correctUrlFields(parsed: Record<string, unknown>): void {
  const allUrlFields = ["linkedinUrl", "githubUrl", "portfolioUrl"] as const;

  // Collect all URLs from all fields into one pool
  const urlPool: string[] = [];
  for (const field of allUrlFields) {
    const val = parsed[field];
    if (typeof val === "string" && val.startsWith("http")) {
      urlPool.push(val);
    }
  }

  if (!urlPool.length) return;

  // Clear existing and re-assign from pool based on domain
  parsed.linkedinUrl = null;
  parsed.githubUrl = null;
  parsed.portfolioUrl = null;

  for (const url of urlPool) {
    const lower = url.toLowerCase();
    if (lower.includes("linkedin.com")) {
      parsed.linkedinUrl = url;
    } else if (lower.includes("github.com")) {
      parsed.githubUrl = url;
    } else {
      // Anything else goes to portfolioUrl (last one wins)
      parsed.portfolioUrl = url;
    }
  }
}

/**
 * Sanitize raw text extracted from a PDF.
 * PDFs frequently encode bullet points and quotes as Unicode characters
 * that appear as garbled symbols (U+FFFD, smart quotes, etc.) in the
 * extracted text, then get embedded into skill names by the AI.
 */
function sanitizePdfText(text: string): string {
  return text
    // Unicode replacement character — artifact of bad encoding
    .replace(/\uFFFD/g, " ")
    // Zero-width and invisible chars
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, "")
    // Smart/curly quotes used as bullet symbols in many PDFs → straight quote
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    // Common PDF bullet chars → dash
    .replace(/[\u2022\u2023\u2043\u2219\u25AA\u25CF\u25E6\u2013\u2014]/g, "-")
    // Other common garbage: ligatures, non-breaking space
    .replace(/\uFB01/g, "fi")
    .replace(/\uFB02/g, "fl")
    .replace(/\u00A0/g, " ")
    // Control chars (but keep \n and \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ")
    // Collapse multiple spaces
    .replace(/[ \t]{2,}/g, " ")
    // Collapse 3+ newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
