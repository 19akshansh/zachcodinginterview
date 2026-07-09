import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.interviews.getMany>;

export const prefetchInterviews = (params: GetManyInput) => {
  return prefetch(trpc.interviews.getMany.queryOptions(params));
};

export const prefetchInterview = (id: string) => {
  return prefetch(trpc.interviews.getOne.queryOptions({ id }));
};

export const prefetchInterviewStats = () => {
  return prefetch(trpc.interviews.getStats.queryOptions());
};
