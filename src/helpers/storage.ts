import { del, issueSignedToken, presignUrl, put } from "@vercel/blob";
import { PRIVATE_FILE_ACCESS } from "@/config/constants";

async function getSignedDownloadUrl(pathname: string): Promise<string> {
  const validUntil = Date.now() + PRIVATE_FILE_ACCESS.SIGNED_URL_TTL_MS;

  const token = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
  });

  const { presignedUrl } = await presignUrl(token, {
    operation: "get",
    pathname,
    access: "private",
    validUntil,
  });

  return presignedUrl;
}

export async function uploadReportPdf(
  reportId: string,
  pdfBuffer: Buffer,
): Promise<string> {
  const pathname = `reports/${reportId}.pdf`;

  const blob = await put(pathname, pdfBuffer, {
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: false,
  });

  return blob.pathname;
}

export function getReportPdfDownloadUrl(pathname: string): Promise<string> {
  return getSignedDownloadUrl(pathname);
}

export async function deleteReportPdf(pathnameOrUrl: string): Promise<void> {
  await del(pathnameOrUrl);
}

export async function uploadResumeFile(
  userId: string,
  fileBuffer: Buffer,
): Promise<string> {
  const pathname = `resumes/${userId}.pdf`;

  const blob = await put(pathname, fileBuffer, {
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return blob.pathname;
}

export function getResumeDownloadUrl(pathname: string): Promise<string> {
  return getSignedDownloadUrl(pathname);
}

export async function deleteResumeFile(pathnameOrUrl: string): Promise<void> {
  await del(pathnameOrUrl);
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
