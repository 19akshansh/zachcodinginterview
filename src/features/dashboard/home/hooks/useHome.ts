import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useHomeParams } from "./useHomeParams";

export const useSuspenseDashboardSummary = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.home.getSummary.queryOptions());
};

export const useDashboardSummary = () => {
  const trpc = useTRPC();
  return useQuery(trpc.home.getSummary.queryOptions());
};

export const useSuspenseDashboardScoreTrend = (limit = 5) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.home.getScoreTrend.queryOptions({ limit }));
};

export const useSuspenseDashboardRecentInterviews = () => {
  const trpc = useTRPC();
  const [params] = useHomeParams();

  return useSuspenseQuery(
    trpc.home.getRecentInterviews.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
    }),
  );
};

export const useSuspenseDashboardActivity = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.profile.getActivity.queryOptions());
};
