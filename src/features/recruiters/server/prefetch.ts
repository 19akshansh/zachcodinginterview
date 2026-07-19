import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.recruiters.listInvited>;
type GetMyQuestionsInput = inferInput<typeof trpc.recruiters.listMyQuestions>;
type GetReviewQueueInput = inferInput<typeof trpc.recruiters.listReviewQueue>;

export const prefetchRecruitersInvited = (params: GetManyInput) => {
  return prefetch(trpc.recruiters.listInvited.queryOptions(params));
};

export const prefetchMyApplication = () => {
  return prefetch(trpc.recruiters.getMyApplication.queryOptions());
};

export const prefetchMyQuestions = (params: GetMyQuestionsInput) => {
  return prefetch(trpc.recruiters.listMyQuestions.queryOptions(params));
};

export const prefetchReviewQueue = (params: GetReviewQueueInput) => {
  return prefetch(trpc.recruiters.listReviewQueue.queryOptions(params));
};
