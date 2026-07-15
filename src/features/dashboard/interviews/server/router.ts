import prisma from "@/lib/db/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  proProcedure,
  assertGeminiKey,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION, LIMITS } from "@/config/constants";
import { generateReportForInterview } from "@/helpers/reportGeneration";
import { autoEndIfExpired } from "@/helpers/interviewTimeLimit";
import { generateAndPersistResumeQuestions } from "@/helpers/resumeInterviewQuestion";
import {
  InterviewType,
  Difficulty,
  ProgrammingLanguage,
  SeniorityLevel,
  InterviewStatus,
  INTERVIEW_TYPE_LABELS,
} from "@/config/enums";

export const interviewsRouter = createTRPCRouter({
  create: proProcedure
    .input(
      z.object({
        title: z
          .string()
          .trim()
          .max(80, "Keep the name under 80 characters")
          .optional(),
        selections: z
          .array(
            z.object({
              type: z.enum(InterviewType),
              count: z.number().int().min(1).max(LIMITS.PRO_MAX_QUESTIONS),
            }),
          )
          .min(1, "Select at least one interview type"),
        difficulty: z.enum(Difficulty),
        seniorityLevel: z.enum(SeniorityLevel),
        language: z.enum(ProgrammingLanguage).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      const interviewCount = await prisma.interview.count({
        where: { candidateId: userId },
      });

      if (interviewCount >= ctx.limits.interviews) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Interview limit reached. Please upgrade to PRO for unlimited sessions.",
        });
      }

      const picks = Array.from(
        input.selections
          .reduce(
            (map, s) => map.set(s.type, s),
            new Map<InterviewType, { type: InterviewType; count: number }>(),
          )
          .values(),
      );

      const totalRequested = picks.reduce((sum, p) => sum + p.count, 0);

      if (totalRequested > ctx.limits.maxQuestions) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            ctx.limits.maxQuestions === LIMITS.PRO_MAX_QUESTIONS
              ? `You can include up to ${ctx.limits.maxQuestions} questions in one interview.`
              : `Free plan interviews allow up to ${ctx.limits.maxQuestions} question(s) total. Upgrade to PRO for up to ${LIMITS.PRO_MAX_QUESTIONS}.`,
        });
      }

      const questionIds: string[] = [];

      const needsAi = picks.some(
        (pick) =>
          pick.type === InterviewType.RESUME_BASED ||
          pick.type === InterviewType.DOMAIN_SPECIFIC,
      );
      if (needsAi) {
        assertGeminiKey(ctx.geminiApiKey);
      }

      for (const pick of picks) {
        if (
          pick.type === InterviewType.RESUME_BASED ||
          pick.type === InterviewType.DOMAIN_SPECIFIC
        ) {
          const generatedIds = await generateAndPersistResumeQuestions({
            apiKey: ctx.geminiApiKey as string,
            userId,
            type: pick.type,
            count: pick.count,
            difficulty: input.difficulty,
            seniorityLevel: input.seniorityLevel,
          });
          questionIds.push(...generatedIds);
          continue;
        }

        const matching = await prisma.question.findMany({
          where: {
            type: pick.type,
            difficulty: input.difficulty,
          },
          take: pick.count * 3,
        });

        if (matching.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No ${INTERVIEW_TYPE_LABELS[pick.type]} questions available at this difficulty yet. Please try a different difficulty.`,
          });
        }

        const shuffled = matching.sort(() => Math.random() - 0.5);
        for (const q of shuffled.slice(0, pick.count)) {
          questionIds.push(q.id);
        }
      }

      if (questionIds.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No questions are available for this configuration yet.",
        });
      }

      const interview = await prisma.interview.create({
        data: {
          title: input.title || undefined,
          type: picks[0].type,
          difficulty: input.difficulty,
          seniorityLevel: input.seniorityLevel,
          language: input.language,
          candidateId: userId,
          status: "SCHEDULED",
          timeLimitMinutes: ctx.limits.interviewLimitMinutes,
          questions: {
            create: questionIds.map((questionId, order) => ({
              questionId,
              order,
            })),
          },
        },
      });

      return interview;
    }),
  start: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.id },
      });

      if (!interview || interview.candidateId !== ctx.auth.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      if (interview.status !== "SCHEDULED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Interview already started or finished",
        });
      }

      return await prisma.interview.update({
        where: { id: input.id },
        data: {
          status: "IN_PROGRESS",
          startedAt: new Date(),
        },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.id },
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: {
              question: {
                include: {
                  testCases: {
                    where: { visibility: "PUBLIC" },
                    select: { id: true, input: true, expectedOutput: true },
                  },
                },
              },
            },
          },
          report: true,
          candidate: {
            select: { name: true, image: true, email: true },
          },
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
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to view this interview.",
        });
      }

      return await autoEndIfExpired(interview, ctx.geminiApiKey);
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
        status: z.enum(InterviewStatus).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status } = input;
      const { user } = ctx.auth;

      let roleFilter: Prisma.InterviewWhereInput = {};

      if (user.role === "CANDIDATE") {
        roleFilter = { candidateId: user.id };
      } else if (user.role === "RECRUITER") {
        roleFilter = { assignedByRecruiterId: user.id };
      } else if (user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const where: Prisma.InterviewWhereInput = {
        ...roleFilter,
        ...(status ? { status } : {}),
        ...(search
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
              ],
            }
          : {}),
      };

      const [items, totalCount] = await Promise.all([
        prisma.interview.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            questions: {
              orderBy: { order: "asc" },
              select: {
                question: {
                  select: { title: true, difficulty: true, type: true },
                },
              },
            },
            report: {
              select: { overallScore: true, verdict: true },
            },
            candidate: {
              select: { name: true, image: true },
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
  end: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findFirst({
        where: { id: input.id, candidateId: ctx.auth.user.id },
      });

      if (!interview) throw new TRPCError({ code: "NOT_FOUND" });

      if (interview.status !== "IN_PROGRESS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Interview must be in progress to end it.",
        });
      }

      const checked = await autoEndIfExpired(interview, ctx.geminiApiKey);
      if (checked.status !== "IN_PROGRESS") {
        return checked;
      }

      const { count } = await prisma.interview.updateMany({
        where: { id: input.id, status: "IN_PROGRESS" },
        data: { status: "COMPLETED", endedAt: new Date() },
      });

      if (count === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Interview was already ended.",
        });
      }

      generateReportForInterview(input.id, ctx.geminiApiKey).catch((err) => {
        console.error("REPORT_GENERATION_FAILED", input.id, err);
      });

      return await prisma.interview.findUniqueOrThrow({
        where: { id: input.id },
      });
    }),
  abandon: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.id },
      });

      if (!interview || interview.candidateId !== ctx.auth.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      if (
        interview.status === "COMPLETED" ||
        interview.status === "ABANDONED"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Interview already finished.",
        });
      }

      return await prisma.interview.update({
        where: { id: input.id },
        data: { status: "ABANDONED" },
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.id },
      });

      if (!interview) throw new TRPCError({ code: "NOT_FOUND" });

      const isOwner = interview.candidateId === ctx.auth.user.id;
      const isAdmin = ctx.auth.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await prisma.interview.delete({ where: { id: input.id } });
    }),
  getUpcoming: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.interview.findMany({
      where: {
        candidateId: ctx.auth.user.id,
        status: "SCHEDULED",
      },
      include: {
        questions: { orderBy: { order: "asc" }, include: { question: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 5,
    });
  }),
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.user.id;

    const [completedCount, reports] = await Promise.all([
      prisma.interview.count({
        where: { candidateId: userId, status: "COMPLETED" },
      }),
      prisma.report.findMany({
        where: { interview: { candidateId: userId } },
        select: { overallScore: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const avgScore =
      reports.length > 0
        ? reports.reduce((acc, curr) => acc + curr.overallScore, 0) /
          reports.length
        : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyCount = await prisma.interview.count({
      where: {
        candidateId: userId,
        status: "COMPLETED",
        endedAt: { gte: sevenDaysAgo },
      },
    });

    return {
      completedCount,
      avgScore: Math.round(avgScore),
      weeklyCount,
      recentScores: reports.slice(0, 10),
    };
  }),
});
