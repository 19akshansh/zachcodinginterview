import prisma from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { generateInterviewReport, type AIReportQuestionPart } from "@/lib/ai";
import { InterviewType } from "@/config/enums";

export async function generateReportForInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: true },
      },
    },
  });

  if (!interview || interview.questions.length === 0) {
    return null;
  }

  const parts: AIReportQuestionPart[] = interview.questions.map((iq) => {
    const isBehavioral = iq.question.type === InterviewType.BEHAVIORAL;

    return {
      questionTitle: iq.question.title,
      questionPrompt: iq.question.prompt,
      isBehavioral,
      code: iq.code ?? undefined,
      language: iq.language ?? undefined,
      behavioralAnswer: iq.behavioralAnswer ?? undefined,
      testResults: [],
      passedTestCases: iq.passedTestCases ?? 0,
      totalTestCases: iq.totalTestCases ?? 0,
      hintsUsed: iq.hintLevel,
    };
  });

  const hasAnyAnswer = interview.questions.some(
    (iq) => iq.code || iq.behavioralAnswer,
  );
  if (!hasAnyAnswer) {
    return null;
  }

  const aiReport = await generateInterviewReport({ questions: parts });

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
