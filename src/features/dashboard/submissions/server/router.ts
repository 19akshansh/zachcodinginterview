import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  PROGRAMMING_LANGUAGE_LABELS,
  ProgrammingLanguage,
} from "@/config/enums";
import {
  isExecutableLanguage,
  runAgainstTestCases,
  summarizeResults,
} from "@/lib/codeExecution";
import { generateHint } from "@/lib/ai";
import { autoEndIfExpired } from "@/lib/interviewTimeLimit";

const MAX_HINT_LEVEL = 3;

async function loadActiveInterviewQuestion(
  interviewQuestionId: string,
  userId: string,
) {
  const interviewQuestion = await prisma.interviewQuestion.findUnique({
    where: { id: interviewQuestionId },
    include: {
      question: { include: { testCases: true } },
      interview: true,
    },
  });

  if (
    !interviewQuestion ||
    interviewQuestion.interview.candidateId !== userId
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You cannot submit for this question.",
    });
  }

  const current = await autoEndIfExpired(interviewQuestion.interview);
  if (current.status !== "IN_PROGRESS") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This interview has ended and can no longer accept answers.",
    });
  }

  return interviewQuestion;
}

export const submissionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        interviewQuestionId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const interviewQuestion = await loadActiveInterviewQuestion(
        input.interviewQuestionId,
        ctx.auth.user.id,
      );

      if (!isExecutableLanguage(input.language)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${PROGRAMMING_LANGUAGE_LABELS[input.language]} is not supported yet - only JavaScript and Python can be executed.`,
        });
      }

      const results = await runAgainstTestCases({
        language: input.language,
        code: input.code,
        testCases: interviewQuestion.question.testCases,
      });

      const {
        totalTestCases,
        passedTestCases,
        result,
        executionTimeMs,
        memoryUsedKb,
      } = summarizeResults(results);

      return await prisma.interviewQuestion.update({
        where: { id: input.interviewQuestionId },
        data: {
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
  run: protectedProcedure
    .input(
      z.object({
        interviewQuestionId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const interviewQuestion = await loadActiveInterviewQuestion(
        input.interviewQuestionId,
        ctx.auth.user.id,
      );

      if (!isExecutableLanguage(input.language)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${PROGRAMMING_LANGUAGE_LABELS[input.language]} is not supported yet - only JavaScript and Python can be executed.`,
        });
      }

      const publicTestCases = interviewQuestion.question.testCases.filter(
        (tc) => tc.visibility === "PUBLIC",
      );

      const results = await runAgainstTestCases({
        language: input.language,
        code: input.code,
        testCases: publicTestCases,
      });

      return {
        results,
        success: results.every((r) => r.passed),
      };
    }),
  getByInterviewId: protectedProcedure
    .input(z.object({ interviewId: z.string() }))
    .query(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.interviewId },
        include: {
          questions: { orderBy: { order: "asc" } },
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
          message: "You do not have permission to view these submissions.",
        });
      }

      return interview.questions;
    }),
  getHint: protectedProcedure
    .input(
      z.object({
        interviewQuestionId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const interviewQuestion = await loadActiveInterviewQuestion(
        input.interviewQuestionId,
        ctx.auth.user.id,
      );

      const currentLevel = interviewQuestion.hintLevel ?? 0;

      if (currentLevel >= MAX_HINT_LEVEL) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Maximum hints used for this problem.",
        });
      }

      const nextLevel = (currentLevel + 1) as 1 | 2 | 3;

      const hintText = await generateHint({
        questionTitle: interviewQuestion.question.title,
        questionPrompt: interviewQuestion.question.prompt,
        code: input.code,
        language: input.language,
        level: nextLevel,
      });

      const updated = await prisma.interviewQuestion.update({
        where: { id: input.interviewQuestionId },
        data: {
          code: input.code,
          language: input.language,
          hints: { push: hintText },
          hintLevel: nextLevel,
        },
      });

      return { hint: hintText, level: nextLevel, interviewQuestion: updated };
    }),
  saveTextAnswer: protectedProcedure
    .input(
      z.object({
        interviewQuestionId: z.string(),
        answer: z.string().min(1, "Answer cannot be empty"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await loadActiveInterviewQuestion(
        input.interviewQuestionId,
        ctx.auth.user.id,
      );

      return await prisma.interviewQuestion.update({
        where: { id: input.interviewQuestionId },
        data: { behavioralAnswer: input.answer },
      });
    }),
});
