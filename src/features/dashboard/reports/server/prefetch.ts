import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.reports.getMany>;

export const prefetchReports = (params: GetManyInput) => {
  return prefetch(trpc.reports.getMany.queryOptions(params));
};

export const prefetchReport = (id: string) => {
  return prefetch(trpc.reports.getOne.queryOptions({ id }));
};
