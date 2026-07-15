import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import { INTERVIEW_TYPE_LABELS, InterviewStatus } from "@/config/enums";
import prisma from "@/lib/db/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const homeRouter = createTRPCRouter({
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      completedCount,
      scoreAgg,
      weeklyCount,
      upcomingCount,
      practiceAttemptedCount,
    ] = await Promise.all([
      prisma.interview.count({
        where: { candidateId: userId, status: InterviewStatus.COMPLETED },
      }),
      prisma.report.aggregate({
        where: { interview: { candidateId: userId } },
        _avg: { overallScore: true },
      }),
      prisma.interview.count({
        where: {
          candidateId: userId,
          status: InterviewStatus.COMPLETED,
          endedAt: { gte: sevenDaysAgo },
        },
      }),
      prisma.interview.count({
        where: { candidateId: userId, status: InterviewStatus.SCHEDULED },
      }),
      prisma.practiceAttempt.count({
        where: { userId, result: { not: null } },
      }),
    ]);

    return {
      completedCount,
      avgScore: Math.round(scoreAgg._avg.overallScore ?? 0),
      weeklyCount,
      upcomingCount,
      practiceAttemptedCount,
    };
  }),
  getScoreTrend: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const reports = await prisma.report.findMany({
        where: { interview: { candidateId: ctx.auth.user.id } },
        select: {
          overallScore: true,
          createdAt: true,
          interview: { select: { title: true, type: true } },
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
      });

      return reports
        .map((r) => ({
          score: r.overallScore,
          date: r.createdAt,
          label: r.interview.title ?? INTERVIEW_TYPE_LABELS[r.interview.type],
        }))
        .reverse();
    }),
  getRecentInterviews: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const userId = ctx.auth.user.id;

      const where = { candidateId: userId };

      const [items, totalCount] = await Promise.all([
        prisma.interview.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            difficulty: true,
            seniorityLevel: true,
            createdAt: true,
            startedAt: true,
            endedAt: true,
            report: {
              select: { overallScore: true, verdict: true },
            },
          },
        }),
        prisma.interview.count({ where }),
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
});
