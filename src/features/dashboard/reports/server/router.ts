import prisma from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import { Verdict } from "@/config/enums";
import { generateReportForInterview } from "@/lib/reportGeneration";
import { generateAndStoreReportPdf } from "@/lib/reportPdf";

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
  regenerateForInterview: protectedProcedure
    .input(z.object({ interviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.interviewId },
        select: {
          candidateId: true,
          assignedByRecruiterId: true,
          status: true,
        },
      });

      if (!interview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      const isOwner = interview.candidateId === ctx.auth.user.id;
      const isAssignedRecruiter =
        interview.assignedByRecruiterId === ctx.auth.user.id;
      const isAdmin = ctx.auth.user.role === "ADMIN";

      if (!isOwner && !isAssignedRecruiter && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      if (interview.status !== "COMPLETED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Interview has not been completed yet.",
        });
      }

      const report = await generateReportForInterview(input.interviewId);

      if (!report) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "We couldn't generate a report for this interview. Please try again shortly.",
        });
      }

      return report;
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
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const { user } = ctx.auth;

      let roleFilter: Prisma.InterviewWhereInput = {};

      if (user.role === "CANDIDATE") {
        roleFilter = { candidateId: user.id };
      } else if (user.role === "RECRUITER") {
        roleFilter = { assignedByRecruiterId: user.id };
      }

      const searchFilter: Prisma.InterviewWhereInput = search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              {
                questions: {
                  some: {
                    question: {
                      title: { contains: search, mode: "insensitive" },
                    },
                  },
                },
              },
              {
                candidate: { name: { contains: search, mode: "insensitive" } },
              },
            ],
          }
        : {};

      const where: Prisma.ReportWhereInput = {
        interview: { ...roleFilter, ...searchFilter },
      };

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
                candidate: { select: { name: true, image: true } },
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

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
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
        select: {
          id: true,
          pdfUrl: true,
          interview: {
            select: {
              candidateId: true,
              assignedByRecruiterId: true,
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
        const updated = await generateAndStoreReportPdf(report.id);
        return { url: updated.pdfUrl! };
      } catch (error) {
        console.error("PDF_GEN_ERROR", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate PDF report",
        });
      }
    }),
});
