import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useResumesParams } from "./useResumesParams";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () =>
      reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
};

export const useSuspenseMyResume = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.resume.getOne.queryOptions());
};

export const useMyResume = () => {
  const trpc = useTRPC();

  return useQuery(trpc.resume.getOne.queryOptions());
};

export const useSuspenseResume = (id: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.resume.getOne.queryOptions({ id }));
};

export const useSuspenseResumes = () => {
  const trpc = useTRPC();
  const [params] = useResumesParams();

  return useSuspenseQuery(
    trpc.resume.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    }),
  );
};

export const useResumes = () => {
  const trpc = useTRPC();
  const [params] = useResumesParams();

  return useQuery(
    trpc.resume.getMany.queryOptions({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    }),
  );
};

export const useUploadResume = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.resume.upload.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.resume.getOne.queryKey(),
        });
        toast.success("Resume uploaded.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to upload resume. Please try again.",
        );
      },
    }),
  );
};

export const useDeleteResume = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.resume.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.resume.getOne.queryKey(),
        });
        toast.success("Resume deleted.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to delete resume. Please try again.",
        );
      },
    }),
  );
};

export const useGenerateResumeFeedback = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.resume.generateFeedback.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.resume.getOne.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to generate feedback. Please try again.",
        );
      },
    }),
  );
};

export const useToggleResumeVisibility = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.resume.toggleVisibility.mutationOptions({
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: trpc.resume.getOne.queryKey(),
        });
        toast.success(
          variables.visibleToRecruiters
            ? "Recruiters and admins can now see your resume."
            : "Your resume is now hidden from recruiters and admins.",
        );
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update visibility.");
      },
    }),
  );
};
