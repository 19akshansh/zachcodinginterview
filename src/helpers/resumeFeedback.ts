import prisma from "@/lib/db/db";
import type { Prisma } from "@/generated/prisma/client";
import { generateResumeFeedback } from "@/helpers/ai";

export async function generateFeedbackForResume(
  apiKey: string,
  resumeId: string,
) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: {
      id: true,
      parsedText: true,
      feedback: { select: { id: true } },
    },
  });

  if (!resume) {
    return null;
  }

  if (!resume.parsedText) {
    throw new Error(
      "This resume has no readable text to generate feedback from.",
    );
  }

  const aiFeedback = await generateResumeFeedback(apiKey, resume.parsedText);

  if (resume.feedback) {
    await prisma.resumeFeedback.delete({ where: { id: resume.feedback.id } });
  }

  return prisma.resumeFeedback.create({
    data: {
      resumeId,
      ...aiFeedback,
      sectionScores: aiFeedback.sectionScores as Prisma.InputJsonValue,
    },
  });
}
