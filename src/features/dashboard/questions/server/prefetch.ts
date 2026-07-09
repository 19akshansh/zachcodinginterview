import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.questions.getMany>;
type GetRandomInput = inferInput<typeof trpc.questions.getRandom>;

export const prefetchQuestions = (params: GetManyInput) => {
  return prefetch(trpc.questions.getMany.queryOptions(params));
};

export const prefetchQuestion = (id: string) => {
  return prefetch(trpc.questions.getOne.queryOptions({ id }));
};

export const prefetchQuestionRandom = (params: GetRandomInput) => {
  return prefetch(trpc.questions.getRandom.queryOptions(params));
};
