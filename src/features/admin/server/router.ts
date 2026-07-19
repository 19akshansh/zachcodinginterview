import { z } from "zod";
import {
  ApplicationStatus,
  InterviewStatus,
  QuestionApprovalStatus,
  UserRole,
} from "@/config/enums";
import prisma from "@/lib/db/db";
import { adminProcedure, createTRPCRouter } from "@/trpc/init";

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const adminRouter = createTRPCRouter({
  getOverview: adminProcedure.query(async () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const [
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalAdmins,
      bannedUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      activeInterviews,
      activePracticeAttempts,
      totalInterviews,
      completedInterviews,
      totalPracticeAttempts,
      pendingApplications,
      pendingQuestions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.CANDIDATE } }),
      prisma.user.count({ where: { role: UserRole.RECRUITER } }),
      prisma.user.count({ where: { role: UserRole.ADMIN } }),
      prisma.user.count({ where: { banned: true } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.interview.count({
        where: { status: InterviewStatus.IN_PROGRESS },
      }),
      prisma.practiceAttempt.count({
        where: { createdAt: { gte: oneDayAgo }, result: null },
      }),
      prisma.interview.count(),
      prisma.interview.count({ where: { status: InterviewStatus.COMPLETED } }),
      prisma.practiceAttempt.count(),
      prisma.recruiterApplication.count({
        where: { status: ApplicationStatus.PENDING },
      }),
      prisma.question.count({
        where: {
          isPublic: true,
          approvalStatus: QuestionApprovalStatus.PENDING,
        },
      }),
    ]);

    return {
      totalUsers,
      totalCandidates,
      totalRecruiters,
      totalAdmins,
      bannedUsers,
      newUsersLast7Days,
      newUsersLast30Days,
      activeSolvingNow: activeInterviews + activePracticeAttempts,
      activeInterviews,
      activePracticeAttempts,
      totalInterviews,
      completedInterviews,
      totalPracticeAttempts,
      pendingApplications,
      pendingQuestions,
    };
  }),
  getSignupTrend: adminProcedure
    .input(z.object({ days: z.number().min(7).max(90).default(30) }))
    .query(async ({ input }) => {
      const since = new Date();
      since.setDate(since.getDate() - (input.days - 1));
      since.setUTCHours(0, 0, 0, 0);

      const users = await prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      });

      const counts = new Map<string, number>();
      for (const user of users) {
        const key = toDateKey(user.createdAt);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const trend: { date: string; count: number }[] = [];
      for (let i = input.days - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setUTCDate(day.getUTCDate() - i);
        const key = toDateKey(day);
        trend.push({ date: key, count: counts.get(key) ?? 0 });
      }

      return trend;
    }),
});
