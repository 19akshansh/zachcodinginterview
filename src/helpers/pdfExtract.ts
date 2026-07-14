import { PDFParse } from "pdf-parse";

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

  if (!text) {
    throw new Error(
      "We couldn't find any text in this PDF. Scanned/image-only resumes aren't supported - please upload a text-based PDF.",
    );
  }

  return text;
}
