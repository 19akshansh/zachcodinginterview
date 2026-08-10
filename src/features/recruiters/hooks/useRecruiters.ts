import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  useRecruiterInvitesParams,
  useRecruiterReviewParams,
  useRecruitersParams,
} from "./useRecruitersParams";

export const useMyApplication = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.recruiters.getMyApplication.queryOptions());
};

export const useInviteCandidate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.recruiters.inviteCandidate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.recruiters.listInvited.queryKey(),
        });
        toast.success("Invite sent — the code is also in their inbox.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to send invite. Please try again.",
        );
      },
    }),
  );
};

export const useSuspenseInvites = () => {
  const trpc = useTRPC();
  const [params] = useRecruiterInvitesParams();

  return useSuspenseQuery(
    trpc.recruiters.listInvited.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status ?? undefined,
    }),
  );
};

export const useRedeemInviteCode = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.recruiters.redeemInviteCode.mutationOptions({
      onSuccess: (result) => {
        if (result.found) {
          toast.success("Code redeemed — starting your interview.");
        }
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to redeem that code. Please try again.",
        );
      },
    }),
  );
};

export const useApplyToBeRecruiter = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.recruiters.applyToBeRecruiter.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.recruiters.getMyApplication.queryKey(),
        });
        toast.success(
          "Application submitted — we'll email you once it's reviewed.",
        );
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to submit application. Please try again.",
        );
      },
    }),
  );
};

export const useSuspenseMyQuestions = () => {
  const trpc = useTRPC();
  const [params] = useRecruitersParams();

  return useSuspenseQuery(
    trpc.recruiters.listMyQuestions.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    }),
  );
};

export const useCreateQuestion = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.recruiters.createQuestion.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.recruiters.listMyQuestions.queryKey(),
        });
        toast.success("Question created.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to create question. Please try again.",
        );
      },
    }),
  );
};

export const useDeleteQuestion = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.recruiters.deleteQuestion.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.recruiters.listMyQuestions.queryKey(),
        });
        toast.success("Question deleted.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to delete question. Please try again.",
        );
      },
    }),
  );
};

export const useSuspenseReviewQueue = () => {
  const trpc = useTRPC();
  const [params] = useRecruiterReviewParams();

  return useSuspenseQuery(
    trpc.recruiters.listReviewQueue.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
    }),
  );
};

export const useSuspenseAnalytics = () => {
  const trpc = useTRPC();
  const [params] = useRecruitersParams();

  return useSuspenseQuery(
    trpc.recruiters.analytics.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    }),
  );
};

export const useDecideCandidate = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.recruiters.decide.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.recruiters.listReviewQueue.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.interviews.getOne.queryKey({
            id: variables.interviewId,
          }),
        });
        toast.success(
          variables.decision === "ACCEPTED"
            ? "Candidate marked as selected."
            : "Candidate marked as not selected.",
        );
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to record your decision. Please try again.",
        );
      },
    }),
  );
};
