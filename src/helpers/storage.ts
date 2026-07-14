import { del, put } from "@vercel/blob";

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

export async function deleteReportPdf(url: string): Promise<void> {
  await del(url);
}

export async function uploadResumeFile(
  userId: string,
  fileBuffer: Buffer,
): Promise<string> {
  const blob = await put(`resumes/${userId}.pdf`, fileBuffer, {
    access: "public",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true
  });

  return blob.url;
}

export async function deleteResumeFile(url: string): Promise<void> {
  await del(url);
}
