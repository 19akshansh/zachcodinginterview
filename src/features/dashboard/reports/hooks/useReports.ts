import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useReportsParams } from "./useReportsParams";

export const useSuspenseReports = () => {
  const trpc = useTRPC();
  const [params] = useReportsParams();

  return useSuspenseQuery(
    trpc.reports.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    }),
  );
};

export const useSuspenseReport = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.reports.getOne.queryOptions({ id }));
};

export const useReports = () => {
  const trpc = useTRPC();
  const [params] = useReportsParams();

  return useQuery(
    trpc.reports.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    }),
  );
};

export const useRegenerateReport = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.reports.regenerateForInterview.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.interviews.getOne.queryKey({
            id: variables.interviewId,
          }),
        });
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to generate report. Please try again.",
        );
      },
    }),
  );
};

export const useExportReport = () => {
  const trpc = useTRPC();

  return useMutation(
    trpc.reports.export.mutationOptions({
      onSuccess: (data) => {
        window.open(data.url, "_blank", "noopener,noreferrer");
      },
      onError: (error) => {
        toast.error(`Failed to export report: ${error.message}`);
      },
    }),
  );
};

export const useSetReportShared = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.reports.setShared.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.reports.getOne.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(`Failed to update sharing: ${error.message}`);
      },
    }),
  );
};

export const usePublicReport = (shareId: string) => {
  const trpc = useTRPC();
  return useQuery(trpc.reports.getByShareId.queryOptions({ shareId }));
};
