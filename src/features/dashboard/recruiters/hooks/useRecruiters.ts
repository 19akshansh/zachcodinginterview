import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";

export const useMyApplication = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.recruiters.getMyApplication.queryOptions());
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
