import prisma from "@/lib/db/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import {
  InterviewType,
  Difficulty,
  SeniorityLevel,
  CompanyTier,
  QuestionApprovalStatus,
} from "@/config/enums";

export const questionsRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        type: z.enum(InterviewType),
        title: z.string().min(1),
        prompt: z.string().min(1),
        difficulty: z.enum(Difficulty),
        seniorityLevel: z.enum(SeniorityLevel).optional(),
        companyTier: z.enum(CompanyTier).optional(),
        topics: z.array(z.string()).default([]),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.question.create({
        data: input,
      });
    }),
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(InterviewType).optional(),
        title: z.string().optional(),
        prompt: z.string().optional(),
        difficulty: z.enum(Difficulty).optional(),
        seniorityLevel: z.enum(SeniorityLevel).optional(),
        companyTier: z.enum(CompanyTier).optional(),
        topics: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await prisma.question.update({
        where: { id },
        data,
      });
    }),
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const question = await prisma.question.findUnique({
        where: { id: input.id },
        include: { _count: { select: { interviewQuestions: true } } },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found.",
        });
      }

      if (question._count.interviewQuestions > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This question is already used in a candidate's interview and can't be deleted.",
        });
      }

      return await prisma.question.delete({
        where: { id: input.id },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const question = await prisma.question.findUnique({
        where: { id: input.id },
        include: {
          testCases: {
            where: {
              visibility: "PUBLIC",
            },
            select: {
              id: true,
              input: true,
              expectedOutput: true,
            },
          },
        },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      return question;
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
        type: z.enum(InterviewType).optional(),
        difficulty: z.enum(Difficulty).optional(),
        topics: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize, search, type, difficulty, topics } = input;

      const where: Prisma.QuestionWhereInput = {
        type,
        difficulty,
        isPublic: true,
        approvalStatus: QuestionApprovalStatus.APPROVED,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { prompt: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(topics && topics.length > 0 ? { topics: { hasSome: topics } } : {}),
      };

      const [items, totalCount] = await Promise.all([
        prisma.question.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.question.count({ where }),
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
  getRandom: protectedProcedure
    .input(
      z.object({
        type: z.enum(InterviewType),
        difficulty: z.enum(Difficulty),
        topics: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input }) => {
      const { type, difficulty, topics } = input;

      const where: Prisma.QuestionWhereInput = {
        type,
        difficulty,
        isPublic: true,
        approvalStatus: QuestionApprovalStatus.APPROVED,
        ...(topics && topics.length > 0 ? { topics: { hasSome: topics } } : {}),
      };

      const count = await prisma.question.count({ where });

      if (count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No questions found matching these criteria.",
        });
      }

      const skip = Math.floor(Math.random() * count);

      const randomQuestion = await prisma.question.findFirst({
        where,
        skip: skip,
      });

      return randomQuestion;
    }),
  listPendingReview: adminProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        status: z.enum(QuestionApprovalStatus).optional(),
        search: z.string().default(""),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize, status, search } = input;

      const where: Prisma.QuestionWhereInput = {
        isPublic: true,
        ...(status ? { approvalStatus: status } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { prompt: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      };

      const [items, totalCount] = await Promise.all([
        prisma.question.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true, image: true },
            },
            _count: { select: { interviewQuestions: true } },
          },
        }),
        prisma.question.count({ where }),
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
  decideApproval: adminProcedure
    .input(
      z.object({
        id: z.string(),
        decision: z.enum(["APPROVED", "REJECTED"] as const),
        reviewNote: z.string().trim().max(1000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const question = await prisma.question.findUnique({
        where: { id: input.id },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found.",
        });
      }

      return await prisma.question.update({
        where: { id: input.id },
        data: {
          approvalStatus: input.decision,
          reviewedByUserId: ctx.auth.user.id,
          reviewedAt: new Date(),
          reviewNote: input.reviewNote || null,
        },
      });
    }),
});
