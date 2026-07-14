import prisma from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { generateInterviewReport, type AIReportQuestionPart } from "@/lib/ai";
import { generateAndStoreReportPdf } from "@/lib/reportPdf";
import { deleteReportPdf } from "@/lib/storage";
import { InterviewType } from "@/config/enums";

export async function generateReportForInterview(interviewId: string) {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { question: true },
      },
      report: true,
    },
  });

  if (!interview || interview.questions.length === 0) {
    return null;
  }

  const hasAnyAnswer = interview.questions.some(
    (iq) => iq.code || iq.behavioralAnswer,
  );
  if (!hasAnyAnswer) {
    return null;
  }

  const parts: AIReportQuestionPart[] = interview.questions.map((iq) => ({
    questionTitle: iq.question.title,
    questionPrompt: iq.question.prompt,
    interviewType: iq.question.type as InterviewType,
    code: iq.code ?? undefined,
    language: iq.language ?? undefined,
    writtenAnswer: iq.behavioralAnswer ?? undefined,
    testResults: [],
    passedTestCases: iq.passedTestCases ?? 0,
    totalTestCases: iq.totalTestCases ?? 0,
    hintsUsed: iq.hintLevel ?? 0,
  }));

  const aiReport = await generateInterviewReport({ questions: parts });

  const previousReport = interview.report;
  if (previousReport) {
    if (previousReport.pdfUrl) {
      await deleteReportPdf(previousReport.pdfUrl).catch((err) => {
        console.error("REPORT_PDF_DELETE_FAILED", previousReport.id, err);
      });
    }
    await prisma.report.delete({ where: { id: previousReport.id } });
  }

  const report = await prisma.report.create({
    data: {
      interviewId,
      ...aiReport,
      topicScores: aiReport.topicScores as Prisma.InputJsonValue,
    },
  });

  return generateAndStoreReportPdf(report.id);
}
