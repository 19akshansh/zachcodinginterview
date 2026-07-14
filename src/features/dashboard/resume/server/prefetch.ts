import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.resume.getMany>;

export const prefetchResumes = (params: GetManyInput) => {
  return prefetch(trpc.resume.getMany.queryOptions(params));
};

export const prefetchResume = (id?: string) => {
  return prefetch(
    id
      ? trpc.resume.getOne.queryOptions({ id })
      : trpc.resume.getOne.queryOptions(),
  );
};
