import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetUsersInput = inferInput<typeof trpc.users.getMany>;
type GetSignupTrendInput = inferInput<typeof trpc.admin.getSignupTrend>;
type GetApplicationsInput = inferInput<typeof trpc.recruiters.listApplications>;
type GetPendingQuestionsInput = inferInput<
  typeof trpc.questions.listPendingReview
>;

export const prefetchAdminOverview = () => {
  return prefetch(trpc.admin.getOverview.queryOptions());
};

export const prefetchAdminSignupTrend = (params?: GetSignupTrendInput) => {
  return prefetch(trpc.admin.getSignupTrend.queryOptions(params ?? {}));
};

export const prefetchAdminUsers = (params: GetUsersInput) => {
  return prefetch(trpc.users.getMany.queryOptions(params));
};

export const prefetchAdminApplications = (params: GetApplicationsInput) => {
  return prefetch(trpc.recruiters.listApplications.queryOptions(params));
};

export const prefetchAdminPendingQuestions = (
  params: GetPendingQuestionsInput,
) => {
  return prefetch(trpc.questions.listPendingReview.queryOptions(params));
};
