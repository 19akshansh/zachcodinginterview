import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useInterviewsParams } from "./useInterviewsParams";
import { PAGINATION } from "@/config/constants";

const getInterviewsListBaseKey = (trpc: ReturnType<typeof useTRPC>) => {
  const key = trpc.interviews.getMany.queryOptions({
    page: PAGINATION.DEFAULT_PAGE,
    pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
    search: "",
  }).queryKey;

  return [key[0]];
};

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

export const useSuspenseInterview = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.interviews.getOne.queryOptions({ id }));
};

export const useInterviewStats = () => {
  const trpc = useTRPC();

  return useQuery(trpc.interviews.getStats.queryOptions());
};

export const useCreateInterview = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.interviews.create.mutationOptions({
      onSuccess: () => {
        toast.success("Interview session scheduled!");
        queryClient.invalidateQueries({
          queryKey: getInterviewsListBaseKey(trpc),
        });
      },
      onError: (error) => {
        toast.error(`Failed to create interview: ${error.message}`);
      },
    }),
  );
};

export const useStartInterview = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.interviews.start.mutationOptions({
      onSuccess: (data) => {
        toast.success("Interview started!");
        queryClient.invalidateQueries({
          queryKey: trpc.interviews.getOne.queryOptions({ id: data.id })
            .queryKey,
        });
      },
      onError: (error) => {
        toast.error(`Failed to start session: ${error.message}`);
      },
    }),
  );
};

export const useEndInterview = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.interviews.end.mutationOptions({
      onSuccess: (data) => {
        toast.success("Interview submitted! AI is generating your report...");
        queryClient.invalidateQueries({
          queryKey: getInterviewsListBaseKey(trpc),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.interviews.getOne.queryOptions({ id: data.id })
            .queryKey,
        });
      },
      onError: (error) => {
        toast.error(`Failed to end session: ${error.message}`);
      },
    }),
  );
};

export const useAbandonInterview = () => {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return useMutation(
    trpc.interviews.abandon.mutationOptions({
      onSuccess: (data) => {
        toast.warning("Interview abandoned.");
        queryClient.invalidateQueries({
          queryKey: getInterviewsListBaseKey(trpc),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.interviews.getOne.queryOptions({ id: data.id })
            .queryKey,
        });
      },
      onError: (error) => {
        toast.error(error.message);
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
        toast.success("Interview deleted successfully.");
        queryClient.invalidateQueries({
          queryKey: getInterviewsListBaseKey(trpc),
        });
      },
      onError: (error) => {
        toast.error(`Failed to delete: ${error.message}`);
      },
    }),
  );
};

export const useInterviews = () => {
  const trpc = useTRPC();
  const [params] = useInterviewsParams();

  return useQuery(
    trpc.interviews.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      status: params.status ?? undefined,
    }),
  );
};
