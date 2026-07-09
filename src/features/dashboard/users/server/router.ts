import prisma from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import { UserRole, Theme, ProfileVisibility } from "@/config/enums";

export const usersRouter = createTRPCRouter({
  getMe: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.auth.user.id },
        include: {
          settings: true,
        },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return user;
    }),
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).optional(),
        bio: z.string().max(500).optional(),
        githubUrl: z.string().url().optional().or(z.literal("")),
        linkedinUrl: z.string().url().optional().or(z.literal("")),
        skills: z.array(z.string()).optional(),
        image: z.string().url().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.user.update({
        where: { id: ctx.auth.user.id },
        data: {
          ...input,
          updatedAt: new Date(),
        },
      });
    }),
  updateSettings: protectedProcedure
    .input(
      z.object({
        theme: z.enum(Theme).optional(),
        language: z.string().optional(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        profileVisibility: z.enum(ProfileVisibility).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.settings.upsert({
        where: { userId: ctx.auth.user.id },
        update: input,
        create: {
          userId: ctx.auth.user.id,
          ...input,
        },
      });
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(1)
          .max(100)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
        role: z.enum(UserRole).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (ctx.auth.user.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      const { page, pageSize, search, role } = input;
      const where: Prisma.UserWhereInput = {
        role,
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      };

      const [items, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page * pageSize < totalCount,
        hasPrevPage: page > 1,
      };
    }),
  updateRole: protectedProcedure
    .input(z.object({ userId: z.string(), role: z.enum(UserRole) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await prisma.user.update({
        where: { id: input.userId },
        data: { role: input.role },
      });
    }),
  ban: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
        banned: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.user.role !== "ADMIN") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return await prisma.user.update({
        where: { id: input.userId },
        data: {
          banned: input.banned,
          bannedReason: input.banned ? input.reason : null,
          bannedAt: input.banned ? new Date() : null,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const isSelf = ctx.auth.user.id === input.id;
      const isAdmin = ctx.auth.user.role === "ADMIN";

      if (!isSelf && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own account.",
        });
      }

      return await prisma.user.delete({
        where: { id: input.id },
      });
    }),
});
