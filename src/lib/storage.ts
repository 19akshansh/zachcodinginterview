import { put } from "@vercel/blob";

export async function uploadReportPdf(
  reportId: string,
  pdfBuffer: Buffer,
): Promise<string> {
  const blob = await put(`reports/${reportId}.pdf`, pdfBuffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
  });

  return blob.url;
}
