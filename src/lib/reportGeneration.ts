import prisma from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { generateInterviewReport } from "@/lib/ai";

export async function generateReportForInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      question: true,
      behavioralQuestion: true,
      submission: true,
    },
  });

  if (!interview || !interview.submission || !interview.question) {
    return null;
  }

  const { submission, question, behavioralQuestion } = interview;

  if (!submission.code || !submission.language) {
    return null;
  }

  const aiReport = await generateInterviewReport({
    questionTitle: question.title,
    questionPrompt: question.prompt,
    code: submission.code,
    language: submission.language,
    testResults: [],
    passedTestCases: submission.passedTestCases ?? 0,
    totalTestCases: submission.totalTestCases ?? 0,
    hintsUsed: submission.hintLevel,
    behavioralQuestion: behavioralQuestion?.prompt,
    behavioralAnswer: submission.behavioralAnswer ?? undefined,
  });

  return prisma.report.upsert({
    where: { interviewId },
    update: {
      ...aiReport,
      topicScores: aiReport.topicScores as Prisma.InputJsonValue,
    },
    create: {
      interviewId,
      ...aiReport,
      topicScores: aiReport.topicScores as Prisma.InputJsonValue,
    },
  });
}
