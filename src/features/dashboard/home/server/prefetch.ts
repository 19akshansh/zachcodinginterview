import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetRecentInterviewsInput = inferInput<
  typeof trpc.home.getRecentInterviews
>;

export const prefetchDashboardSummary = () => {
  return prefetch(trpc.home.getSummary.queryOptions());
};

export const prefetchDashboardScoreTrend = (limit = 5) => {
  return prefetch(trpc.home.getScoreTrend.queryOptions({ limit }));
};

export const prefetchDashboardRecentInterviews = (
  params: GetRecentInterviewsInput,
) => {
  return prefetch(trpc.home.getRecentInterviews.queryOptions(params));
};

export const prefetchDashboardActivity = () => {
  return prefetch(trpc.profile.getActivity.queryOptions());
};
