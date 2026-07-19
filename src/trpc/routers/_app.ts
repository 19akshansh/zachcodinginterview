import { homeRouter } from "@/features/dashboard/home/server/router";
import { interviewsRouter } from "@/features/dashboard/interviews/server/router";
import { practiceRouter } from "@/features/dashboard/practice/server/router";
import { profileRouter } from "@/features/dashboard/profile/server/router";
import { questionsRouter } from "@/features/dashboard/questions/server/router";
import { recruitersRouter } from "@/features/recruiters/server/router";
import { reportsRouter } from "@/features/dashboard/reports/server/router";
import { resumeRouter } from "@/features/dashboard/resume/server/router";
import { submissionsRouter } from "@/features/dashboard/submissions/server/router";
import { usersRouter } from "@/features/dashboard/users/server/router";
import { createTRPCRouter } from "../init";
import { adminRouter } from "@/features/admin/server/router";
export const appRouter = createTRPCRouter({
  home: homeRouter,
  interviews: interviewsRouter,
  practice: practiceRouter,
  questions: questionsRouter,
  submissions: submissionsRouter,
  reports: reportsRouter,
  users: usersRouter,
  recruiters: recruitersRouter,
  resume: resumeRouter,
  profile: profileRouter,
  admin: adminRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
