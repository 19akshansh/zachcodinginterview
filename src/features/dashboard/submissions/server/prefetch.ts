import { prefetch, trpc } from "@/trpc/server";

export const prefetchSubmissions = (interviewId: string) => {
  return prefetch(
    trpc.submissions.getByInterviewId.queryOptions({ interviewId }),
  );
};
