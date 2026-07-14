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
  });

  return blob.url;
}

export async function deleteResumeFile(url: string): Promise<void> {
  await del(url);
}

const AVATAR_CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

export async function uploadAvatarFile(
  userId: string,
  fileBuffer: Buffer,
  extension: string,
): Promise<string> {
  const contentType = AVATAR_CONTENT_TYPES[extension];

  const blob = await put(`avatars/${userId}${extension}`, fileBuffer, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });

  return blob.url;
}

export async function deleteAvatarFile(url: string): Promise<void> {
  await del(url);
}
