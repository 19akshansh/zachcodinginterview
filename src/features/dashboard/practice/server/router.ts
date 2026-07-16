import prisma from "@/lib/db/db";
import type { Prisma } from "@/generated/prisma/client";
import { createTRPCRouter, proProcedure, proAiProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import {
  CompanyTier,
  Difficulty,
  InterviewType,
  PracticeType,
  PROGRAMMING_LANGUAGE_LABELS,
  ProgrammingLanguage,
  SeniorityLevel,
  QuestionApprovalStatus,
} from "@/config/enums";
import {
  isExecutableLanguage,
  runAgainstTestCases,
  summarizeResults,
} from "@/helpers/codeExecution";
import { generateHint, evaluateTextAnswer } from "@/helpers/ai";
import { PRACTICE_TYPES } from "@/config/enums";
import { DEFAULTS } from "@/config/constants";

async function unlockedCountForType(
  type: InterviewType,
  accessPercent: number,
) {
  const total = await prisma.question.count({
    where: {
      type,
      isPublic: true,
      approvalStatus: QuestionApprovalStatus.APPROVED,
    },
  });
  if (total === 0) return 0;
  if (accessPercent >= 100) return total;
  return Math.max(1, Math.ceil((total * accessPercent) / 100));
}

async function rankWithinType(type: InterviewType, createdAt: Date) {
  return prisma.question.count({
    where: {
      type,
      createdAt: { lt: createdAt },
      isPublic: true,
      approvalStatus: QuestionApprovalStatus.APPROVED,
    },
  });
}

async function assertQuestionUnlocked(
  ctx: { hasPro: boolean; limits: { practiceAccessPercent: number } },
  question: { type: string; createdAt: Date },
) {
  if (ctx.hasPro) return;

  const unlockedCount = await unlockedCountForType(
    question.type as PracticeType,
    ctx.limits.practiceAccessPercent,
  );
  const rank = await rankWithinType(
    question.type as PracticeType,
    question.createdAt,
  );

  if (rank >= unlockedCount) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "This question is part of the PRO question bank. Upgrade to PRO to unlock it.",
    });
  }
}

export const practiceRouter = createTRPCRouter({
  getMany: proProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
        type: z.enum(PRACTICE_TYPES).optional(),
        difficulty: z.enum(Difficulty).optional(),
        seniorityLevel: z.enum(SeniorityLevel).optional(),
        companyTier: z.enum(CompanyTier).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        pageSize,
        search,
        type,
        difficulty,
        seniorityLevel,
        companyTier,
      } = input;
      const userId = ctx.auth.user.id;

      const where: Prisma.QuestionWhereInput = {
        type: type ?? { in: [...PRACTICE_TYPES] },
        difficulty,
        seniorityLevel,
        companyTier,
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
      };

      const [items, totalCount] = await Promise.all([
        prisma.question.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "asc" },
        }),
        prisma.question.count({ where }),
      ]);

      const typesOnPage = [...new Set(items.map((q) => q.type))];
      const unlockedCounts = new Map<InterviewType, number>();
      if (!ctx.hasPro) {
        await Promise.all(
          typesOnPage.map(async (t) => {
            unlockedCounts.set(
              t as PracticeType,
              await unlockedCountForType(
                t as PracticeType,
                ctx.limits.practiceAccessPercent,
              ),
            );
          }),
        );
      }

      const attempts = items.length
        ? await prisma.practiceAttempt.findMany({
            where: { userId, questionId: { in: items.map((q) => q.id) } },
          })
        : [];
      const attemptByQuestionId = new Map(
        attempts.map((a) => [a.questionId, a]),
      );

      const itemsWithMeta = await Promise.all(
        items.map(async (q) => {
          let locked = false;
          if (!ctx.hasPro) {
            const rank = await rankWithinType(
              q.type as PracticeType,
              q.createdAt,
            );
            locked = rank >= (unlockedCounts.get(q.type as PracticeType) ?? 0);
          }
          const attempt = attemptByQuestionId.get(q.id) ?? null;
          return {
            ...q,
            locked,
            attempt: attempt
              ? { result: attempt.result, updatedAt: attempt.updatedAt }
              : null,
          };
        }),
      );

      const totalPages = Math.ceil(totalCount / pageSize);

      return {
        items: itemsWithMeta,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }),
  getOne: proProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      const question = await prisma.question.findUnique({
        where: { id: input.id },
        include: {
          testCases: {
            where: { visibility: "PUBLIC" },
            select: { id: true, input: true, expectedOutput: true },
          },
        },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      await assertQuestionUnlocked(ctx, question);

      const attempt = await prisma.practiceAttempt.findUnique({
        where: { userId_questionId: { userId, questionId: question.id } },
      });

      return { ...question, attempt };
    }),
  run: proProcedure
    .input(
      z.object({
        questionId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const question = await prisma.question.findUnique({
        where: { id: input.questionId },
        include: { testCases: { where: { visibility: "PUBLIC" } } },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      await assertQuestionUnlocked(ctx, question);

      if (!isExecutableLanguage(input.language)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${PROGRAMMING_LANGUAGE_LABELS[input.language]} is not supported yet - only JavaScript and Python can be executed.`,
        });
      }

      const results = await runAgainstTestCases({
        language: input.language,
        code: input.code,
        testCases: question.testCases,
      });

      return { results, success: results.every((r) => r.passed) };
    }),
  submit: proProcedure
    .input(
      z.object({
        questionId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      const question = await prisma.question.findUnique({
        where: { id: input.questionId },
        include: { testCases: true },
      });

      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      await assertQuestionUnlocked(ctx, question);

      if (!isExecutableLanguage(input.language)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${PROGRAMMING_LANGUAGE_LABELS[input.language]} is not supported yet - only JavaScript and Python can be executed.`,
        });
      }

      const results = await runAgainstTestCases({
        language: input.language,
        code: input.code,
        testCases: question.testCases,
      });

      const {
        totalTestCases,
        passedTestCases,
        result,
        executionTimeMs,
        memoryUsedKb,
      } = summarizeResults(results);

      return prisma.practiceAttempt.upsert({
        where: { userId_questionId: { userId, questionId: question.id } },
        create: {
          userId,
          questionId: question.id,
          code: input.code,
          language: input.language,
          result,
          passedTestCases,
          totalTestCases,
          executionTimeMs,
          memoryUsedKb,
        },
        update: {
          code: input.code,
          language: input.language,
          result,
          passedTestCases,
          totalTestCases,
          executionTimeMs,
          memoryUsedKb,
        },
      });
    }),
  saveTextAnswer: proProcedure
    .input(
      z.object({
        questionId: z.string(),
        answer: z.string().min(1, "Answer cannot be empty"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      const question = await prisma.question.findUnique({
        where: { id: input.questionId },
      });
      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      await assertQuestionUnlocked(ctx, question);

      return prisma.practiceAttempt.upsert({
        where: { userId_questionId: { userId, questionId: input.questionId } },
        create: {
          userId,
          questionId: input.questionId,
          behavioralAnswer: input.answer,
        },
        update: { behavioralAnswer: input.answer },
      });
    }),
  submitTextAnswer: proAiProcedure
    .input(
      z.object({
        questionId: z.string(),
        answer: z.string().min(1, "Answer cannot be empty"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      const question = await prisma.question.findUnique({
        where: { id: input.questionId },
      });
      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      await assertQuestionUnlocked(ctx, question);

      const graded = await evaluateTextAnswer(ctx.geminiApiKey, {
        questionTitle: question.title,
        questionPrompt: question.prompt,
        interviewType: question.type as PracticeType,
        answer: input.answer,
      });

      return prisma.practiceAttempt.upsert({
        where: { userId_questionId: { userId, questionId: question.id } },
        create: {
          userId,
          questionId: question.id,
          behavioralAnswer: input.answer,
          result: graded.result,
          aiFeedback: graded.feedback,
        },
        update: {
          behavioralAnswer: input.answer,
          result: graded.result,
          aiFeedback: graded.feedback,
        },
      });
    }),
  getHint: proAiProcedure
    .input(
      z.object({
        questionId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.user.id;

      const question = await prisma.question.findUnique({
        where: { id: input.questionId },
      });
      if (!question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      await assertQuestionUnlocked(ctx, question);

      const existing = await prisma.practiceAttempt.findUnique({
        where: { userId_questionId: { userId, questionId: question.id } },
      });

      const currentLevel = existing?.hintLevel ?? 0;
      if (currentLevel >= DEFAULTS.MAX_HINT_LEVEL) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Maximum hints used for this problem.",
        });
      }

      const nextLevel = (currentLevel + 1) as 1 | 2 | 3;

      const hintText = await generateHint(ctx.geminiApiKey, {
        questionTitle: question.title,
        questionPrompt: question.prompt,
        code: input.code,
        language: input.language,
        level: nextLevel,
      });

      const updated = await prisma.practiceAttempt.upsert({
        where: { userId_questionId: { userId, questionId: question.id } },
        create: {
          userId,
          questionId: question.id,
          code: input.code,
          language: input.language,
          hints: [hintText],
          hintLevel: nextLevel,
        },
        update: {
          code: input.code,
          language: input.language,
          hints: { push: hintText },
          hintLevel: nextLevel,
        },
      });

      return { hint: hintText, level: nextLevel, attempt: updated };
    }),
});
