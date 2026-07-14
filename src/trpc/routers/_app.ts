import { createTRPCRouter, protectedProcedure } from "../init";
import { interviewsRouter } from "@/features/dashboard/interviews/server/router";
import { questionsRouter } from "@/features/dashboard/questions/server/router";
import { submissionsRouter } from "@/features/dashboard/submissions/server/router";
import { reportsRouter } from "@/features/dashboard/reports/server/router";
import { usersRouter } from "@/features/dashboard/users/server/router";
import { recruitersRouter } from "@/features/dashboard/recruiters/server/router";
import { practiceRouter } from "@/features/dashboard/practice/server/router";
import { resumeRouter } from "@/features/dashboard/resume/server/router";
export const appRouter = createTRPCRouter({
  interviews: interviewsRouter,
  practice: practiceRouter,
  questions: questionsRouter,
  submissions: submissionsRouter,
  reports: reportsRouter,
  users: usersRouter,
  recruiters: recruitersRouter,
  resume: resumeRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
