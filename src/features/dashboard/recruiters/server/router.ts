import { randomInt } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  PAGINATION,
  RECRUITER_APPLICATION,
  RECRUITER_INVITE_QUESTION_COUNT,
} from "@/config/constants";
import {
  ApplicationStatus,
  CompanyTier,
  Difficulty,
  InterviewStatus,
  InterviewType,
  InviteStatus,
  QuestionApprovalStatus,
  RecruiterDecision,
  SeniorityLevel,
  UserRole,
} from "@/config/enums";
import { envSchem } from "@/config/envSchema";
import type { Prisma } from "@/generated/prisma/client";
import { transporter } from "@/helpers/mail";
import prisma from "@/lib/db/db";
import {
  createTRPCRouter,
  protectedProcedure,
  recruiterProcedure,
} from "@/trpc/init";

const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const INVITE_CODE_LENGTH = 8;

function generateInviteCode(): string {
  let code = "";
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

async function generateUniqueInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateInviteCode();
    const existing = await prisma.recruiterInvite.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existing) return code;
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Couldn't generate a unique invite code. Please try again.",
  });
}

export async function sendRecruiterInviteEmail(params: {
  to: string;
  recruiterName: string;
  interviewType: string;
  difficulty: string;
  seniorityLevel: string;
  code: string;
}) {
  const { to, recruiterName, interviewType, difficulty, seniorityLevel, code } =
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

    <p
      style="
        margin: 0 0 8px;
        color: #6b7280;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      "
    >
      Your invite code
    </p>
    <div
      style="
        margin: 0 0 32px;
        padding: 18px;
        background: #111827;
        border-radius: 10px;
        color: #ffffff;
        font-family: 'Courier New', Courier, monospace;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.3em;
      "
    >
      ${code}
    </div>
    <p style="margin: -20px 0 32px;color:#6b7280;font-size:13px;">
      Create an account (or sign in) and enter this code to start your interview.
    </p>
 
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

      if (
        input.type === InterviewType.RESUME_BASED ||
        input.type === InterviewType.DOMAIN_SPECIFIC
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Resume Based and Domain Specific interviews are generated from the candidate's own resume and can't be assigned by invite.",
        });
      }

      const recruiterId = ctx.auth.user.id;

      const existingCandidate = await prisma.user.findUnique({
        where: { email: input.email },
      });

      const code = await generateUniqueInviteCode();

      const invite = await prisma.recruiterInvite.create({
        data: {
          recruiterId,
          candidateEmail: input.email,
          candidateId: existingCandidate?.id,
          status: "PENDING",
          code,
          type: input.type,
          difficulty: input.difficulty,
          seniorityLevel: input.seniorityLevel,
        },
      });

      try {
        await sendRecruiterInviteEmail({
          to: input.email,
          recruiterName: ctx.auth.user.name,
          interviewType: input.type,
          difficulty: input.difficulty,
          seniorityLevel: input.seniorityLevel,
          code,
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
  applyToBeRecruiter: protectedProcedure
    .input(
      z.object({
        description: z
          .string()
          .trim()
          .min(
            RECRUITER_APPLICATION.MIN_DESCRIPTION_LENGTH,
            `Tell us a bit more — at least ${RECRUITER_APPLICATION.MIN_DESCRIPTION_LENGTH} characters.`,
          )
          .max(RECRUITER_APPLICATION.MAX_DESCRIPTION_LENGTH),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.auth.user.role !== UserRole.CANDIDATE) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only candidates can apply for recruiter access.",
        });
      }

      const existingPending = await prisma.recruiterApplication.findFirst({
        where: {
          userId: ctx.auth.user.id,
          status: ApplicationStatus.PENDING,
        },
      });

      if (existingPending) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a pending application.",
        });
      }

      return await prisma.recruiterApplication.create({
        data: {
          userId: ctx.auth.user.id,
          description: input.description,
        },
      });
    }),
  getMyApplication: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.recruiterApplication.findFirst({
      where: { userId: ctx.auth.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),
  createQuestion: recruiterProcedure
    .input(
      z.object({
        type: z.enum(InterviewType),
        title: z.string().trim().min(1),
        prompt: z.string().trim().min(1),
        difficulty: z.enum(Difficulty),
        seniorityLevel: z.enum(SeniorityLevel).optional(),
        companyTier: z.enum(CompanyTier).optional(),
        topics: z.array(z.string()).default([]),
        isPublic: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { isPublic, ...rest } = input;

      return await prisma.question.create({
        data: {
          ...rest,
          createdByUserId: ctx.auth.user.id,
          isPublic,
          approvalStatus: isPublic
            ? QuestionApprovalStatus.PENDING
            : QuestionApprovalStatus.APPROVED,
        },
      });
    }),
  listMyQuestions: recruiterProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;

      const where: Prisma.QuestionWhereInput = {
        createdByUserId: ctx.auth.user.id,
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
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { interviewQuestions: true } },
          },
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
  deleteQuestion: recruiterProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const question = await prisma.question.findUnique({
        where: { id: input.id },
        include: { _count: { select: { interviewQuestions: true } } },
      });

      if (!question || question.createdByUserId !== ctx.auth.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Question not found.",
        });
      }

      if (question._count.interviewQuestions > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "This question is already used in a candidate's interview and can't be deleted.",
        });
      }

      return await prisma.question.delete({ where: { id: input.id } });
    }),
  redeemInviteCode: protectedProcedure
    .input(z.object({ code: z.string().trim().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const code = input.code.trim().toUpperCase();

      const invite = await prisma.recruiterInvite.findUnique({
        where: { code },
      });

      if (
        !invite ||
        invite.status !== "PENDING" ||
        invite.interviewId !== null
      ) {
        return { found: false as const };
      }

      const questionPool = await prisma.question.findMany({
        where: {
          type: invite.type,
          difficulty: invite.difficulty,
          OR: [
            { isPublic: true, approvalStatus: QuestionApprovalStatus.APPROVED },
            { createdByUserId: invite.recruiterId },
          ],
        },
        take: RECRUITER_INVITE_QUESTION_COUNT * 3,
      });

      if (questionPool.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "No questions are available for this invite's configuration yet. Ask the recruiter to add one, or try again later.",
        });
      }

      const questionIds = [...questionPool]
        .sort(() => Math.random() - 0.5)
        .slice(0, RECRUITER_INVITE_QUESTION_COUNT)
        .map((q) => q.id);

      const interview = await prisma.$transaction(async (tx) => {
        const created = await tx.interview.create({
          data: {
            type: invite.type,
            difficulty: invite.difficulty,
            seniorityLevel: invite.seniorityLevel,
            candidateId: ctx.auth.user.id,
            assignedByRecruiterId: invite.recruiterId,
            status: "SCHEDULED",
            questions: {
              create: questionIds.map((questionId, order) => ({
                questionId,
                order,
              })),
            },
          },
        });

        await tx.recruiterInvite.update({
          where: { id: invite.id },
          data: {
            interviewId: created.id,
            status: "ACCEPTED",
            respondedAt: new Date(),
            candidateId: ctx.auth.user.id,
          },
        });

        return created;
      });

      return { found: true as const, interviewId: interview.id };
    }),
  listReviewQueue: recruiterProcedure
    .input(
      z.object({
        page: z.number().min(1).default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;

      const where: Prisma.InterviewWhereInput = {
        assignedByRecruiterId: ctx.auth.user.id,
        status: InterviewStatus.COMPLETED,
        recruiterDecision: RecruiterDecision.PENDING,
      };

      const [items, totalCount] = await Promise.all([
        prisma.interview.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { endedAt: "asc" },
          include: {
            candidate: { select: { name: true, email: true, image: true } },
            report: { select: { id: true, overallScore: true, verdict: true } },
          },
        }),
        prisma.interview.count({ where }),
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
  decide: recruiterProcedure
    .input(
      z.object({
        interviewId: z.string(),
        decision: z.enum(["ACCEPTED", "REJECTED"] as const),
        feedback: z.string().trim().max(2000).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const interview = await prisma.interview.findUnique({
        where: { id: input.interviewId },
      });

      if (!interview || interview.assignedByRecruiterId !== ctx.auth.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Interview not found.",
        });
      }

      if (interview.status !== InterviewStatus.COMPLETED) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This interview hasn't been completed yet.",
        });
      }

      if (interview.recruiterDecision !== RecruiterDecision.PENDING) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You've already made a decision on this candidate.",
        });
      }

      return await prisma.interview.update({
        where: { id: input.interviewId },
        data: {
          recruiterDecision: input.decision,
          recruiterDecisionAt: new Date(),
          recruiterFeedback: input.feedback || null,
        },
      });
    }),
});
