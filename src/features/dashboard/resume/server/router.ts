import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION, RESUME } from "@/config/constants";
import type { Prisma } from "@/generated/prisma/client";
import { extractPdfText } from "@/helpers/pdfExtract";
import { scanPdfForMalware } from "@/helpers/malwareScan";
import { generateFeedbackForResume } from "@/helpers/resumeFeedback";
import { InvalidGeminiKeyError } from "@/helpers/ai";
import {
  deleteResumeFile,
  getResumeDownloadUrl,
  uploadResumeFile,
} from "@/helpers/storage";
import prisma from "@/lib/db/db";
import {
  createTRPCRouter,
  protectedProcedure,
  recruiterProcedure,
  aiProcedure,
} from "@/trpc/init";

export const resumeRouter = createTRPCRouter({
  upload: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        fileBase64: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { fileName } = input;

      if (!fileName.toLowerCase().endsWith(RESUME.ALLOWED_EXTENSION)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only PDF files are accepted.",
        });
      }

      let buffer: Buffer;
      try {
        buffer = Buffer.from(input.fileBase64, "base64");
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file data.",
        });
      }

      if (buffer.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The uploaded file is empty.",
        });
      }

      if (buffer.length > RESUME.MAX_FILE_SIZE_BYTES) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File is too large. Max size is ${
            RESUME.MAX_FILE_SIZE_BYTES / (1024 * 1024)
          }MB.`,
        });
      }

      const looksLikePdf = buffer.subarray(0, 5).toString("ascii") === "%PDF-";
      if (!looksLikePdf) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This file doesn't look like a valid PDF.",
        });
      }

      let scanResult: Awaited<ReturnType<typeof scanPdfForMalware>>;
      try {
        scanResult = await scanPdfForMalware(buffer, fileName);
      } catch (error) {
        console.error("RESUME_SCAN_ERROR", error);
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message:
            error instanceof Error
              ? error.message
              : "Could not scan this file right now. Please try again.",
        });
      }

      if (!scanResult.safe) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            scanResult.reason ||
            "This file failed our safety scan and was rejected.",
        });
      }

      let parsedText: string;
      try {
        parsedText = await extractPdfText(buffer);
      } catch (error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            error instanceof Error ? error.message : "Could not read this PDF.",
        });
      }

      const existing = await prisma.resume.findUnique({
        where: { userId: ctx.auth.user.id },
        select: { id: true, fileUrl: true },
      });

      const fileUrl = await uploadResumeFile(ctx.auth.user.id, buffer);

      if (existing) {
        await deleteResumeFile(existing.fileUrl).catch((err) => {
          console.error("RESUME_FILE_DELETE_FAILED", existing.id, err);
        });

        await prisma.resume.delete({ where: { id: existing.id } });
      }

      return prisma.resume.create({
        data: {
          userId: ctx.auth.user.id,
          fileName,
          fileUrl,
          fileSize: buffer.length,
          parsedText,
        },
      });
    }),
  delete: protectedProcedure.mutation(async ({ ctx }) => {
    const resume = await prisma.resume.findUnique({
      where: { userId: ctx.auth.user.id },
      select: { id: true, fileUrl: true },
    });

    if (!resume) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "You don't have a resume uploaded.",
      });
    }

    await deleteResumeFile(resume.fileUrl).catch((err) => {
      console.error("RESUME_FILE_DELETE_FAILED", resume.id, err);
    });

    await prisma.resume.delete({ where: { id: resume.id } });

    return { success: true };
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }).optional())
    .query(async ({ ctx, input }) => {
      const resume = input?.id
        ? await prisma.resume.findUnique({
            where: { id: input.id },
            include: { feedback: true },
          })
        : await prisma.resume.findUnique({
            where: { userId: ctx.auth.user.id },
            include: { feedback: true },
          });

      if (input?.id && !resume) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Resume not found.",
        });
      }

      if (!resume) return null;

      const isOwner = resume.userId === ctx.auth.user.id;
      const isAdmin = ctx.auth.user.role === "ADMIN";
      const isRecruiterAndVisible =
        ctx.auth.user.role === "RECRUITER" &&
        resume.visibleToRecruiters === true;

      if (!isOwner && !isAdmin && !isRecruiterAndVisible) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have access to this resume.",
        });
      }

      const downloadUrl = await getResumeDownloadUrl(resume.fileUrl);

      return { ...resume, downloadUrl, isOwner };
    }),
  getMany: recruiterProcedure
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
    .query(async ({ input }) => {
      const { page, pageSize, search } = input;

      const where: Prisma.ResumeWhereInput = {
        visibleToRecruiters: true,
        ...(search
          ? {
              user: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      };

      const [items, totalCount] = await Promise.all([
        prisma.resume.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            visibleToRecruiters: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            user: {
              select: { id: true, name: true, image: true, email: true },
            },
            feedback: { select: { atsScore: true, summary: true } },
          },
        }),
        prisma.resume.count({ where }),
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
  generateFeedback: aiProcedure.mutation(async ({ ctx }) => {
    const resume = await prisma.resume.findUnique({
      where: { userId: ctx.auth.user.id },
      select: { id: true },
    });

    if (!resume) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Upload a resume before requesting feedback.",
      });
    }

    let feedback: Awaited<ReturnType<typeof generateFeedbackForResume>>;
    try {
      feedback = await generateFeedbackForResume(ctx.geminiApiKey, resume.id);
    } catch (error) {
      if (error instanceof InvalidGeminiKeyError) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error.message,
          cause: error,
        });
      }

      console.error("RESUME_FEEDBACK_ERROR", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "We couldn't generate feedback for this resume. Please try again.",
      });
    }

    if (!feedback) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          "We couldn't generate feedback for this resume. Please try again.",
      });
    }

    return feedback;
  }),
  toggleVisibility: protectedProcedure
    .input(z.object({ visibleToRecruiters: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const resume = await prisma.resume.findUnique({
        where: { userId: ctx.auth.user.id },
        select: { id: true },
      });

      if (!resume) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload a resume first.",
        });
      }

      return prisma.resume.update({
        where: { id: resume.id },
        data: { visibleToRecruiters: input.visibleToRecruiters },
      });
    }),
});
