import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.practice.getMany>;

export const prefetchPracticeQuestions = (params: GetManyInput) => {
  return prefetch(trpc.practice.getMany.queryOptions(params));
};

export const prefetchPracticeQuestion = (id: string) => {
  return prefetch(trpc.practice.getOne.queryOptions({ id }));
};
