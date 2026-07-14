import prisma from "@/lib/db/db";

export async function getUserResumeText(
  userId: string,
): Promise<string | null> {
  const resume = await prisma.resume.findUnique({
    where: { userId },
    select: { parsedText: true },
  });

  return resume?.parsedText ?? null;
}

export async function userHasResume(userId: string): Promise<boolean> {
  const count = await prisma.resume.count({ where: { userId } });
  return count > 0;
}
