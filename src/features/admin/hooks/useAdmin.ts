import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  useAdminApplicationsParams,
  useAdminQuestionsParams,
  useAdminUsersParams,
} from "./useAdminParams";

export const useSuspenseAdminOverview = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.admin.getOverview.queryOptions());
};

export const useSuspenseAdminSignupTrend = (days = 30) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.admin.getSignupTrend.queryOptions({ days }));
};

export const useSuspenseAdminUsers = () => {
  const trpc = useTRPC();
  const [params] = useAdminUsersParams();

  return useSuspenseQuery(
    trpc.users.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      role: params.role ?? undefined,
    }),
  );
};

export const useUpdateUserRole = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.updateRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.users.getMany.queryKey(),
        });
        toast.success("Role updated.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to update role. Please try again.",
        );
      },
    }),
  );
};

export const useBanUser = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.ban.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.users.getMany.queryKey(),
        });
        toast.success(variables.banned ? "User banned." : "User unbanned.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to update user. Please try again.",
        );
      },
    }),
  );
};

export const useSuspenseAdminApplications = () => {
  const trpc = useTRPC();
  const [params] = useAdminApplicationsParams();

  return useSuspenseQuery(
    trpc.recruiters.listApplications.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status ?? undefined,
    }),
  );
};

export const useDecideApplication = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.recruiters.decideApplication.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.recruiters.listApplications.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getOverview.queryKey(),
        });
        toast.success(
          variables.decision === "APPROVED"
            ? "Application approved."
            : "Application rejected.",
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

export const useSuspenseAdminPendingQuestions = () => {
  const trpc = useTRPC();
  const [params] = useAdminQuestionsParams();

  return useSuspenseQuery(
    trpc.questions.listPendingReview.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      status: params.status ?? undefined,
      search: params.search,
    }),
  );
};

export const useDecideQuestionApproval = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.questions.decideApproval.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.questions.listPendingReview.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getOverview.queryKey(),
        });
        toast.success(
          variables.decision === "APPROVED"
            ? "Question approved."
            : "Question rejected.",
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

export const useAdminCreateQuestion = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.questions.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.questions.listPendingReview.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getOverview.queryKey(),
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

export const useAdminUpdateQuestion = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.questions.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.questions.listPendingReview.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getOverview.queryKey(),
        });
        toast.success("Question updated.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to update question. Please try again.",
        );
      },
    }),
  );
};

export const useAdminDeleteQuestion = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.questions.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.questions.listPendingReview.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.admin.getOverview.queryKey(),
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
