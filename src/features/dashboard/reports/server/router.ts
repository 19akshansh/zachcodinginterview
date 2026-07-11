import React from "react";
import prisma from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import { Verdict } from "@/config/enums";
import { renderToBuffer } from "@react-pdf/renderer";
import { InterviewReportPDF } from "@/lib/pdfTemplate";
import { uploadReportPdf } from "@/lib/storage";

export const reportsRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        interviewId: z.string(),
        overallScore: z.number().min(0).max(100),
        communication: z.number().optional(),
        problemSolving: z.number().optional(),
        codeQuality: z.number().optional(),
        optimization: z.number().optional(),
        cleanliness: z.number().optional(),
        confidence: z.number().optional(),
        timeComplexity: z.string().optional(),
        verdict: z.enum(Verdict).optional(),
        suggestions: z.array(z.string()),
        topicScores: z.record(z.string(), z.number()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system processes can generate reports.",
        });
      }

      const { interviewId, ...data } = input;

      return await prisma.report.upsert({
        where: { interviewId },
        update: {
          ...data,
          topicScores: data.topicScores as Prisma.InputJsonValue,
        },
        create: {
          interviewId,
          ...data,
          topicScores: data.topicScores as Prisma.InputJsonValue,
        },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const report = await prisma.report.findUnique({
        where: { id: input.id },
        include: {
          interview: {
            include: {
              candidate: { select: { name: true, image: true, id: true } },
              questions: {
                orderBy: { order: "asc" },
                select: {
                  question: { select: { title: true, type: true } },
                },
              },
            },
          },
        },
      });

      if (!report) throw new TRPCError({ code: "NOT_FOUND" });

      const isOwner = report.interview.candidateId === ctx.auth.user.id;
      const isAssignedRecruiter =
        report.interview.assignedByRecruiterId === ctx.auth.user.id;
      const isAdmin = ctx.auth.user.role === "ADMIN";

      if (!isOwner && !isAssignedRecruiter && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this report.",
        });
      }

      return report;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(1)
          .max(100)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const { user } = ctx.auth;

      let where: Prisma.ReportWhereInput = {};

      if (user.role === "CANDIDATE") {
        where = { interview: { candidateId: user.id } };
      } else if (user.role === "RECRUITER") {
        where = { interview: { assignedByRecruiterId: user.id } };
      }

      const [items, totalCount] = await Promise.all([
        prisma.report.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            interview: {
              select: {
                type: true,
                title: true,
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
        }),
        prisma.report.count({ where }),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page * pageSize < totalCount,
        hasPrevPage: page > 1,
      };
    }),
  getWeakTopics: protectedProcedure.query(async ({ ctx }) => {
    const reports = await prisma.report.findMany({
      where: { interview: { candidateId: ctx.auth.user.id } },
      select: { topicScores: true },
    });

    const topicTotals: Record<string, { sum: number; count: number }> = {};

    reports.forEach((report) => {
      if (!report.topicScores) return;

      const scores = report.topicScores as Record<string, number>;

      Object.entries(scores).forEach(([topic, score]) => {
        if (!topicTotals[topic]) topicTotals[topic] = { sum: 0, count: 0 };
        topicTotals[topic].sum += score;
        topicTotals[topic].count += 1;
      });
    });

    const weakTopics = Object.entries(topicTotals)
      .map(([topic, data]) => ({
        topic,
        averageScore: Math.round(data.sum / data.count),
      }))
      .filter((t) => t.averageScore < 60)
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5);

    return weakTopics;
  }),
  export: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const report = await prisma.report.findUnique({
        where: { id: input.reportId },
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

      if (!report) throw new TRPCError({ code: "NOT_FOUND" });

      const isOwner = report.interview.candidateId === ctx.auth.user.id;
      const isAssignedRecruiter =
        report.interview.assignedByRecruiterId === ctx.auth.user.id;

      if (!isOwner && !isAssignedRecruiter && ctx.auth.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (report.pdfUrl) return { url: report.pdfUrl };

      try {
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

        await prisma.report.update({
          where: { id: report.id },
          data: { pdfUrl },
        });

        return { url: pdfUrl };
      } catch (error) {
        console.error("PDF_GEN_ERROR", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF report",
        });
      }
    }),
});
