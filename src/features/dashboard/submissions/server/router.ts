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
});
