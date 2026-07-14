import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ACTIVITY, AVATAR } from "@/config/constants";
import { InterviewStatus } from "@/config/enums";
import { buildActivityCalendar } from "@/helpers/activity";
import { deleteAvatarFile, uploadAvatarFile } from "@/helpers/storage";
import { sanitizeSvg } from "@/helpers/svgSanitize";
import prisma from "@/lib/db/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

function isOwnedAvatarUrl(url: string): boolean {
  try {
    return new URL(url).pathname.includes("/avatars/");
  } catch {
    return false;
  }
}

function getExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.[a-z0-9]+$/);
  return match ? match[0] : "";
}

export const profileRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.auth.user.id },
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    }

    return user;
  }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().trim().min(2).max(100).optional(),
        bio: z.string().trim().max(500).optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.name === undefined && input.bio === undefined) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nothing to update.",
        });
      }

      return prisma.user.update({
        where: { id: ctx.auth.user.id },
        data: {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.bio !== undefined ? { bio: input.bio || null } : {}),
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          bio: true,
          image: true,
          email: true,
          createdAt: true,
        },
      });
    }),
  uploadAvatar: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(255),
        fileBase64: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const extension = getExtension(input.fileName);

      if (!AVATAR.ALLOWED_EXTENSIONS.includes(extension)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only PNG, JPG, and SVG images are accepted.",
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

      if (buffer.length > AVATAR.MAX_FILE_SIZE_BYTES) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File is too large. Max size is ${
            AVATAR.MAX_FILE_SIZE_BYTES / (1024 * 1024)
          }MB.`,
        });
      }

      const isPng =
        buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a";
      const isJpeg = buffer.subarray(0, 3).toString("hex") === "ffd8ff";
      const isSvg =
        extension === ".svg" &&
        /<svg[\s>]/i.test(buffer.subarray(0, 1024).toString("utf8"));

      const looksValid =
        (extension === ".png" && isPng) ||
        ((extension === ".jpg" || extension === ".jpeg") && isJpeg) ||
        (extension === ".svg" && isSvg);

      if (!looksValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This file doesn't look like a valid image.",
        });
      }

      let uploadBuffer = buffer;

      if (extension === ".svg") {
        const sanitized = sanitizeSvg(buffer.toString("utf8"));

        if (!sanitized) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "This SVG couldn't be safely processed. Please try a PNG or JPG instead.",
          });
        }

        uploadBuffer = Buffer.from(sanitized, "utf8");
      }

      const existing = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
        select: { image: true },
      });

      const newUrl = await uploadAvatarFile(
        ctx.auth.user.id,
        uploadBuffer,
        extension,
      );

      if (existing?.image && isOwnedAvatarUrl(existing.image)) {
        await deleteAvatarFile(existing.image).catch((err) => {
          console.error("AVATAR_DELETE_FAILED", ctx.auth.user.id, err);
        });
      }

      return prisma.user.update({
        where: { id: ctx.auth.user.id },
        data: { image: newUrl, updatedAt: new Date() },
        select: {
          id: true,
          name: true,
          bio: true,
          image: true,
          email: true,
          createdAt: true,
        },
      });
    }),
  removeAvatar: protectedProcedure.mutation(async ({ ctx }) => {
    const existing = await prisma.user.findUnique({
      where: { id: ctx.auth.user.id },
      select: { image: true },
    });

    if (existing?.image && isOwnedAvatarUrl(existing.image)) {
      await deleteAvatarFile(existing.image).catch((err) => {
        console.error("AVATAR_DELETE_FAILED", ctx.auth.user.id, err);
      });
    }

    return prisma.user.update({
      where: { id: ctx.auth.user.id },
      data: { image: null, updatedAt: new Date() },
      select: {
        id: true,
        name: true,
        bio: true,
        image: true,
        email: true,
        createdAt: true,
      },
    });
  }),
  getActivity: protectedProcedure.query(async ({ ctx }) => {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (ACTIVITY.HISTORY_DAYS - 1));

    const [practiceAttempts, interviews] = await Promise.all([
      prisma.practiceAttempt.findMany({
        where: { userId: ctx.auth.user.id, createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.interview.findMany({
        where: {
          candidateId: ctx.auth.user.id,
          status: InterviewStatus.COMPLETED,
          OR: [{ endedAt: { gte: since } }, { endedAt: null }],
        },
        select: { endedAt: true, createdAt: true },
      }),
    ]);

    const interviewDates = interviews
      .map((i) => i.endedAt ?? i.createdAt)
      .filter((d) => d >= since);

    const days = buildActivityCalendar(
      practiceAttempts.map((p) => p.createdAt),
      interviewDates,
      ACTIVITY.HISTORY_DAYS,
    );

    return {
      days,
      totalPractice: practiceAttempts.length,
      totalInterviews: interviewDates.length,
    };
  }),
});
