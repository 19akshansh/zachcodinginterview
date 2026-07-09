import prisma from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import {
  InterviewType,
  Difficulty,
  SeniorityLevel,
  CompanyTier,
} from "@/config/enums";

export const questionsRouter = createTRPCRouter({
  create: protectedProcedure
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
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return await prisma.question.create({
        data: input,
      });
    }),
  update: protectedProcedure
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
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const { id, ...data } = input;
      return await prisma.question.update({
        where: { id },
        data,
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
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
            where: { visibility: "PUBLIC" },
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
});
