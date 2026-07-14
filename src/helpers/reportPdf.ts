import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import prisma from "@/lib/db/db";
import { InterviewReportPDF } from "@/helpers/pdfTemplate";
import { uploadReportPdf } from "@/helpers/storage";

export async function generateAndStoreReportPdf(reportId: string) {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      interview: {
        include: {
          candidate: { select: { name: true } },
          questions: {
            orderBy: { order: "asc" },
            take: 1,
            select: {
              question: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  if (!report) {
    throw new Error(`Report ${reportId} not found`);
  }

  const buffer = await renderToBuffer(
    React.createElement(InterviewReportPDF, {
      report,
      candidateName: report.interview.candidate.name,
      questionTitle:
        report.interview.title ||
        report.interview.questions[0]?.question.title ||
        "Technical Interview",
    }),
  );

  const pdfUrl = await uploadReportPdf(report.id, buffer);

  return prisma.report.update({
    where: { id: report.id },
    data: { pdfUrl },
  });
}
