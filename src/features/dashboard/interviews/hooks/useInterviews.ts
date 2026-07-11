import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useInterviewsParams } from "./useInterviewsParams";
import { useRouter } from "next/navigation";

export const useSuspenseInterviews = () => {
  const trpc = useTRPC();
  const [params] = useInterviewsParams();
  return useSuspenseQuery(
    trpc.interviews.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      status: params.status ?? undefined,
    }),
  );
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const router = useRouter();

  return useMutation(
    trpc.interviews.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Interview session created!");
        queryClient.invalidateQueries({
          queryKey: [trpc.interviews.getMany.queryOptions({}).queryKey[0]],
        });
        router.push(`/interviews/${data.id}`);
      },
      onError: (error) => {
        toast.error(`Failed to start interview: ${error.message}`);
      },
    }),
  );
};

export const useRemoveInterview = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  return useMutation(
    trpc.interviews.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Interview deleted");
        queryClient.invalidateQueries({
          queryKey: [trpc.interviews.getMany.queryOptions({}).queryKey[0]],
        });
      },
      onError: (err) => toast.error(err.message),
    }),
  );
};
