import prisma from "@/lib/db/db";
import type { Prisma } from "@/generated/prisma/client";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import { UserRole, ProfileVisibility, InterviewStatus } from "@/config/enums";
import { envSchem } from "@/config/envSchema";
import { transporter } from "@/helpers/mail";

function emailShell(params: { heading: string; bodyHtml: string }) {
  const appUrl = envSchem.NEXT_PUBLIC_APP_URL;

  return `<div
  style="
    background-color: #f4f4f5;
    padding: 40px 20px;
    font-family: Arial, Helvetica, sans-serif;"
>
  <div
    style="
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 48px 32px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    "
  >
    <div style="margin-bottom: 32px;">
      <img
        src="${appUrl}/mainAssets/logo.svg"
        alt="Zach Coding Interview"
        width="80"
        height="80"
        style="display: block; margin: 0 auto;"
      />
    </div>

    <h1
      style="
        margin: 0 0 16px;
        color: #111827;
        font-size: 28px;
        font-weight: 700;
      "
    >
      ${params.heading}
    </h1>

    ${params.bodyHtml}
  </div>
</div>`;
}

export const usersRouter = createTRPCRouter({
  getMe: protectedProcedure.query(async ({ ctx }) => {
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
  updateSettings: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        profileVisibility: z.enum(ProfileVisibility).optional(),
        webhookUrl: z.union([z.url(), z.literal("")]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.emailNotifications === undefined &&
        input.profileVisibility === undefined &&
        input.webhookUrl === undefined
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Nothing to update.",
        });
      }

      return await prisma.settings.upsert({
        where: { userId: ctx.auth.user.id },
        update: {
          ...input,
          webhookUrl: input.webhookUrl === "" ? null : input.webhookUrl,
        },
        create: {
          userId: ctx.auth.user.id,
          ...input,
          webhookUrl: input.webhookUrl === "" ? null : input.webhookUrl,
        },
      });
    }),
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.user.delete({
      where: { id: ctx.auth.user.id },
    });

    return { success: true };
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
      const isAdmin = ctx.auth.user.role === "ADMIN";
      const isRecruiter = ctx.auth.user.role === "RECRUITER";

      if (!isAdmin && !isRecruiter) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin or recruiter access required",
        });
      }

      const { page, pageSize, search } = input;
      const role = isAdmin ? input.role : UserRole.CANDIDATE;

      const where: Prisma.UserWhereInput = {
        role,
        ...(isAdmin
          ? {}
          : { settings: { profileVisibility: ProfileVisibility.PUBLIC } }),
        OR: search
          ? [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      };

      const select = {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        ...(isAdmin
          ? { banned: true, bannedReason: true, bannedAt: true }
          : {}),
      } satisfies Prisma.UserSelect;

      const [items, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          select,
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
  ban: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
        banned: z.boolean(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await prisma.user.update({
        where: { id: input.userId },
        data: {
          banned: input.banned,
          bannedReason: input.banned ? input.reason : null,
          bannedAt: input.banned ? new Date() : null,
        },
      });

      if (input.banned) {
        await prisma.session.deleteMany({
          where: { userId: input.userId },
        });
      }

      try {
        if (input.banned) {
          await transporter.sendMail({
            from: envSchem.EMAIL_FROM,
            to: user.email,
            subject: "Your account has been suspended",
            html: emailShell({
              heading: "Your Account Has Been Suspended",
              bodyHtml: `<p
        style="
          margin: 0 0 24px;
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        Your account on Zach Coding Interview has been suspended by an administrator.
      </p>

      <div
        style="
          margin: 0 0 32px;
          padding: 16px;
          background: #f3f4f6;
          border-radius: 10px;
          text-align: left;
          color: #374151;
          font-size: 14px;
          line-height: 1.8;
        "
      >
        <div><strong>Reason:</strong> ${
          input.reason?.trim() ||
          "No specific reason was provided. Please contact support if you have questions."
        }</div>
      </div>

      <p style="margin-top: 8px; color: #9ca3af; font-size: 14px; line-height: 1.5;">
        If you believe this was a mistake, please reach out to our support team.
      </p>`,
            }),
          });
        } else {
          await transporter.sendMail({
            from: envSchem.EMAIL_FROM,
            to: user.email,
            subject: "Your account has been reinstated",
            html: emailShell({
              heading: "Your Account Has Been Reinstated",
              bodyHtml: `<p
        style="
          margin: 0 0 8px;
          color: #6b7280;
          font-size: 16px;
          line-height: 1.6;
        "
      >
        Good news — your account on Zach Coding Interview has been reinstated. You can sign in and pick up right where you left off.
      </p>`,
            }),
          });
        }
      } catch (error) {
        console.error("USER_BAN_EMAIL_ERROR", error);
      }

      return user;
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
  getById: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const viewer = ctx.auth.user;

      const target = await prisma.user.findUnique({
        where: { id: input.userId },
        include: { settings: true },
      });

      if (!target) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

      const isAdmin = viewer.role === UserRole.ADMIN;
      const isSelf = viewer.id === target.id;

      if (!isAdmin && !isSelf) {
        const isPublicCandidate =
          target.role === UserRole.CANDIDATE &&
          target.settings?.profileVisibility === ProfileVisibility.PUBLIC;

        if (!isPublicCandidate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found.",
          });
        }
      }

      const tier: "admin" | "self" | "recruiter" | "public" = isAdmin
        ? "admin"
        : isSelf
          ? "self"
          : viewer.role === UserRole.RECRUITER
            ? "recruiter"
            : "public";

      const { _count } = await prisma.user.findUniqueOrThrow({
        where: { id: target.id },
        select: {
          _count: { select: { interviews: true, practiceAttempts: true } },
        },
      });

      const profile = {
        id: target.id,
        name: target.name,
        image: target.image,
        bio: target.bio,
        role: target.role,
        createdAt: target.createdAt,
        counts: _count,
      };

      if (tier === "public") {
        return { tier, profile } as const;
      }

      const interviews = await prisma.interview.findMany({
        where: {
          candidateId: target.id,
          ...(tier === "recruiter"
            ? { status: InterviewStatus.COMPLETED }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          difficulty: true,
          seniorityLevel: true,
          createdAt: true,
          report: {
            select: { id: true, overallScore: true, verdict: true },
          },
        },
      });

      if (tier === "recruiter") {
        return { tier, profile, interviews } as const;
      }

      const [practiceAttempts, recruiterApplications] = await Promise.all([
        prisma.practiceAttempt.findMany({
          where: { userId: target.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            result: true,
            createdAt: true,
            question: {
              select: { title: true, type: true, difficulty: true },
            },
          },
        }),
        prisma.recruiterApplication.findMany({
          where: { userId: target.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            description: true,
            reviewNote: true,
            reviewedAt: true,
            createdAt: true,
          },
        }),
      ]);

      return {
        tier,
        profile: {
          ...profile,
          email: target.email,
          banned: target.banned,
          bannedReason: target.bannedReason,
          bannedAt: target.bannedAt,
          profileVisibility:
            target.settings?.profileVisibility ?? ProfileVisibility.PRIVATE,
        },
        interviews,
        practiceAttempts,
        recruiterApplications,
      } as const;
    }),
});
