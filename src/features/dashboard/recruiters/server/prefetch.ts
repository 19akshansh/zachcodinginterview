import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.recruiters.listInvited>;

export const prefetchRecruitersInvited = (params: GetManyInput) => {
  return prefetch(trpc.recruiters.listInvited.queryOptions(params));
};

export const prefetchMyApplication = () => {
  return prefetch(trpc.recruiters.getMyApplication.queryOptions());
};
