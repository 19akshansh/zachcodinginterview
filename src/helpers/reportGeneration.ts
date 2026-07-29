import { type InterviewType, RecruiterDecision } from "@/config/enums";
import type { Prisma } from "@/generated/prisma/client";
import {
  type AIReportQuestionPart,
  generateInterviewReport,
} from "@/helpers/ai";
import { generateAndStoreReportPdf } from "@/helpers/reportPdf";
import { deleteReportPdf } from "@/helpers/storage";
import prisma from "@/lib/db/db";

export async function generateReportForInterview(
  interviewId: string,
  apiKey: string | null,
) {
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

  if (!apiKey) {
    console.error(
      "REPORT_GENERATION_SKIPPED_NO_KEY",
      interviewId,
      "candidate has no Gemini key set - report will stay pending until they add one and regenerate it.",
    );
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

  const aiReport = await generateInterviewReport(apiKey, { questions: parts });

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

  if (interview.assignedByRecruiterId) {
    const recruiterSettings = await prisma.settings.findUnique({
      where: { userId: interview.assignedByRecruiterId },
      select: { webhookUrl: true },
    });

    if (recruiterSettings?.webhookUrl) {
      void fetch(recruiterSettings.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "interview.completed",
          interviewId,
          candidateId: interview.candidateId,
          overallScore: report.overallScore,
          verdict: report.verdict,
          completedAt: new Date().toISOString(),
        }),
      }).catch((error) => {
        console.error("INTERVIEW_WEBHOOK_FAILED", interviewId, error);
      });
    }
  }

  await prisma.interview.updateMany({
    where: {
      id: interviewId,
      assignedByRecruiterId: { not: null },
      recruiterDecision: null,
    },
    data: { recruiterDecision: RecruiterDecision.PENDING },
  });

  return generateAndStoreReportPdf(report.id);
}
