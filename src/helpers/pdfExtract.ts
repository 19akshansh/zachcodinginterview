import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

const MIN_WORD_COUNT = 20;

export async function extractPdfText(buffer: Buffer): Promise<string> {
  let text: string;

  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const data = await parser.getText();
    text = data.text.trim();
  } catch (error) {
    console.error("PDF_PARSE_ERROR", error);
    throw new Error(
      "We couldn't read this PDF. Please make sure it isn't corrupted or password-protected.",
    );
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount < MIN_WORD_COUNT) {
    throw new Error(
      "We couldn't find enough readable text in this PDF. Scanned/image-only resumes aren't supported yet - please upload a text-based PDF (export directly from Word/Google Docs rather than as a flattened image).",
    );
  }

  return text;
}
