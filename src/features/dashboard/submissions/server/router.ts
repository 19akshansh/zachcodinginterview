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

export const submissionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        interviewId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { interviewId, code, language } = input;

      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          question: { include: { testCases: true } },
        },
      });

      if (!interview || interview.candidateId !== ctx.auth.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot submit for this interview.",
        });
      }

      const current = await autoEndIfExpired(interview);
      if (current.status !== "IN_PROGRESS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "This interview has ended and can no longer accept submissions.",
        });
      }

      if (!interview.question) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This interview has no coding question to submit against.",
        });
      }

      if (!isExecutableLanguage(language)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${PROGRAMMING_LANGUAGE_LABELS[language]} is not supported yet - only JavaScript and Python can be executed.`,
        });
      }

      const results = await runAgainstTestCases({
        language,
        code,
        testCases: interview.question.testCases,
      });

      const {
        totalTestCases,
        passedTestCases,
        result,
        executionTimeMs,
        memoryUsedKb,
      } = summarizeResults(results);

      return await prisma.submission.upsert({
        where: { interviewId },
        update: {
          code,
          language,
          result,
          passedTestCases,
          totalTestCases,
          executionTimeMs,
          memoryUsedKb,
          createdAt: new Date(),
        },
        create: {
          interviewId,
          code,
          language,
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
        interviewId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.interviewId },
        include: {
          question: {
            include: {
              testCases: {
                where: { visibility: "PUBLIC" },
              },
            },
          },
        },
      });

      if (!interview || !interview.question) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found",
        });
      }

      if (interview.candidateId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const current = await autoEndIfExpired(interview);
      if (current.status !== "IN_PROGRESS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This interview has ended and code can no longer be run.",
        });
      }

      if (!isExecutableLanguage(input.language)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `${PROGRAMMING_LANGUAGE_LABELS[input.language]} is not supported yet - only JavaScript and Python can be executed.`,
        });
      }

      const results = await runAgainstTestCases({
        language: input.language,
        code: input.code,
        testCases: interview.question.testCases,
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
          submission: true,
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
          message: "You do not have permission to view this submission.",
        });
      }

      if (!interview.submission) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No submission found for this interview.",
        });
      }

      return interview.submission;
    }),
  getHint: protectedProcedure
    .input(
      z.object({
        interviewId: z.string(),
        code: z.string(),
        language: z.enum(ProgrammingLanguage),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.interviewId },
        include: { question: true, submission: true },
      });

      if (!interview) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found",
        });
      }

      if (interview.candidateId !== ctx.auth.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const current = await autoEndIfExpired(interview);
      if (current.status !== "IN_PROGRESS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Hints are only available during an active interview.",
        });
      }

      if (!interview.question) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This interview has no question to hint against.",
        });
      }

      const currentLevel = interview.submission?.hintLevel ?? 0;

      if (currentLevel >= MAX_HINT_LEVEL) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Maximum hints used for this problem.",
        });
      }

      const nextLevel = (currentLevel + 1) as 1 | 2 | 3;

      const hintText = await generateHint({
        questionTitle: interview.question.title,
        questionPrompt: interview.question.prompt,
        code: input.code,
        language: input.language,
        level: nextLevel,
      });

      const submission = await prisma.submission.upsert({
        where: { interviewId: input.interviewId },
        update: {
          hints: { push: hintText },
          hintLevel: nextLevel,
        },
        create: {
          interviewId: input.interviewId,
          code: input.code,
          language: input.language,
          hints: [hintText],
          hintLevel: nextLevel,
        },
      });

      return { hint: hintText, level: nextLevel, submission };
    }),

  saveBehavioralAnswer: protectedProcedure
    .input(
      z.object({
        interviewId: z.string(),
        answer: z.string().min(1, "Answer cannot be empty"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.interviewId },
      });

      if (!interview || interview.candidateId !== ctx.auth.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot answer for this interview.",
        });
      }

      const current = await autoEndIfExpired(interview);
      if (current.status !== "IN_PROGRESS") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This interview has ended and can no longer accept answers.",
        });
      }

      return await prisma.submission.upsert({
        where: { interviewId: input.interviewId },
        update: { behavioralAnswer: input.answer },
        create: {
          interviewId: input.interviewId,
          behavioralAnswer: input.answer,
        },
      });
    }),
});
