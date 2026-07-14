import prisma from "@/lib/db/db";
import type { Prisma } from "@/generated/prisma/client";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGINATION } from "@/config/constants";
import {
  InviteStatus,
  InterviewType,
  Difficulty,
  SeniorityLevel,
} from "@/config/enums";
import { envSchem } from "@/config/envSchema";
import { transporter } from "@/helpers/mail";

export async function sendRecruiterInviteEmail(params: {
  to: string;
  recruiterName: string;
  interviewType: string;
  difficulty: string;
  seniorityLevel: string;
}) {
  const { to, recruiterName, interviewType, difficulty, seniorityLevel } =
    params;

  const appUrl = envSchem.NEXT_PUBLIC_APP_URL;
  const ctaUrl = `${appUrl}/signup?email=${encodeURIComponent(to)}`;

  await transporter.sendMail({
    from: envSchem.EMAIL_FROM,
    to,
    subject: `${recruiterName} invited you to a technical interview`,
    html: `<div
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
      You've Been Invited to an Interview
    </h1>
 
    <p
      style="
        margin: 0 0 24px;
        color: #6b7280;
        font-size: 16px;
        line-height: 1.6;
      "
    >
      <strong>${recruiterName}</strong> has invited you to complete a technical interview.
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
      <div><strong>Type:</strong> ${interviewType}</div>
      <div><strong>Difficulty:</strong> ${difficulty}</div>
      <div><strong>Level:</strong> ${seniorityLevel}</div>
    </div>
 
    <a
      href="${ctaUrl}"
      style="
        display: inline-block;
        background: #111827;
        color: white;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 10px;
        font-weight: 600;
        font-size: 16px;
      "
    >
      Get Started
    </a>
 
    <p style="margin-top:24px;color:#6b7280;font-size:14px;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
 
    <p style="word-break:break-all;font-size:13px;">
      <a href="${ctaUrl}">
        ${ctaUrl}
      </a>
    </p>
 
    <p
      style="
        margin-top: 32px;
        color: #9ca3af;
        font-size: 14px;
        line-height: 1.5;
      "
    >
      If you weren't expecting this invite, you can safely ignore this email.
    </p>
  </div>
</div>`,
  });
}

export const recruitersRouter = createTRPCRouter({
  inviteCandidate: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        type: z.enum(InterviewType),
        difficulty: z.enum(Difficulty),
        seniorityLevel: z.enum(SeniorityLevel),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        ctx.auth.user.role !== "RECRUITER" &&
        ctx.auth.user.role !== "ADMIN"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only recruiters can invite candidates.",
        });
      }

      const recruiterId = ctx.auth.user.id;

      const existingCandidate = await prisma.user.findUnique({
        where: { email: input.email },
      });

      const invite = await prisma.$transaction(async (tx) => {
        const invite = await tx.recruiterInvite.create({
          data: {
            recruiterId,
            candidateEmail: input.email,
            candidateId: existingCandidate?.id,
            status: "PENDING",
          },
        });

        if (existingCandidate) {
          await tx.interview.create({
            data: {
              type: input.type,
              difficulty: input.difficulty,
              seniorityLevel: input.seniorityLevel,
              candidateId: existingCandidate.id,
              assignedByRecruiterId: recruiterId,
              status: "SCHEDULED",
            },
          });
        }

        return invite;
      });

      try {
        await sendRecruiterInviteEmail({
          to: input.email,
          recruiterName: ctx.auth.user.name,
          interviewType: input.type,
          difficulty: input.difficulty,
          seniorityLevel: input.seniorityLevel,
        });
      } catch (error) {
        console.error("RECRUITER_INVITE_EMAIL_ERROR", error);
      }

      return invite;
    }),
  listInvited: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(1)
          .max(100)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        status: z.enum(InviteStatus).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, status } = input;

      if (
        ctx.auth.user.role !== "RECRUITER" &&
        ctx.auth.user.role !== "ADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const isAdmin = ctx.auth.user.role === "ADMIN";

      const where: Prisma.RecruiterInviteWhereInput = {
        ...(isAdmin ? {} : { recruiterId: ctx.auth.user.id }),
        status,
      };

      const interviewSelect = {
        status: true,
        report: {
          select: {
            overallScore: true,
          },
        },
      } satisfies Prisma.InterviewSelect;

      const [items, totalCount] = await Promise.all([
        prisma.recruiterInvite.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: "desc" },
          include: {
            candidate: {
              select: {
                name: true,
                image: true,
                interviews: isAdmin
                  ? {
                      select: interviewSelect,
                    }
                  : {
                      where: {
                        assignedByRecruiterId: ctx.auth.user.id,
                      },
                      select: interviewSelect,
                    },
              },
            },
            recruiter: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        }),
        prisma.recruiterInvite.count({ where }),
      ]);

      return {
        items,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        hasNextPage: page * pageSize < totalCount,
        hasPrevPage: page > 1,
      };
    }),
  compareCandidate: protectedProcedure
    .input(z.object({ reportIds: z.array(z.string()).min(2) }))
    .query(async ({ ctx, input }) => {
      if (
        ctx.auth.user.role !== "RECRUITER" &&
        ctx.auth.user.role !== "ADMIN"
      ) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const isAdmin = ctx.auth.user.role === "ADMIN";

      const reports = await prisma.report.findMany({
        where: {
          id: { in: input.reportIds },
          ...(isAdmin
            ? {}
            : { interview: { assignedByRecruiterId: ctx.auth.user.id } }),
        },
        include: {
          interview: {
            include: {
              candidate: { select: { name: true, image: true, email: true } },
              questions: {
                orderBy: { order: "asc" },
                take: 1,
                select: { question: { select: { title: true } } },
              },
            },
          },
        },
      });

      if (reports.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No matching reports found.",
        });
      }

      const ranked = [...reports].sort(
        (a, b) => b.overallScore - a.overallScore,
      );

      const allTopics = new Set<string>();
      reports.forEach((r) => {
        const scores = (r.topicScores as Record<string, number>) || {};
        Object.keys(scores).forEach((t) => allTopics.add(t));
      });

      return {
        ranked,
        comparisonMatrix: Array.from(allTopics).map((topic) => ({
          topic,
          scores: reports.map((r) => ({
            candidateName: r.interview.candidate.name,
            score: (r.topicScores as Record<string, number>)?.[topic] || 0,
          })),
        })),
        recommendation: `Based on overall scores, ${ranked[0].interview.candidate.name} is the top candidate for this role.`,
      };
    }),
});
