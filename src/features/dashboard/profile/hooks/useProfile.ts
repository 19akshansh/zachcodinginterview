import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { fileToBase64 } from "@/features/dashboard/resume/hooks/useResume";

export { fileToBase64 };

export const useSuspenseMyProfile = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.profile.getProfile.queryOptions());
};

export const useMyProfile = () => {
  const trpc = useTRPC();

  return useQuery(trpc.profile.getProfile.queryOptions());
};

export const useUpdateProfile = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.profile.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getProfile.queryKey(),
        });
        toast.success("Profile updated.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to update profile. Please try again.",
        );
      },
    }),
  );
};

export const useUploadAvatar = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.profile.uploadAvatar.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getProfile.queryKey(),
        });
        toast.success("Avatar updated.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to upload avatar. Please try again.",
        );
      },
    }),
  );
};

export const useRemoveAvatar = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.profile.removeAvatar.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getProfile.queryKey(),
        });
        toast.success("Avatar removed.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to remove avatar. Please try again.",
        );
      },
    }),
  );
};

export const useSuspenseMyActivity = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.profile.getActivity.queryOptions());
};

export const useMyActivity = () => {
  const trpc = useTRPC();

  return useQuery(trpc.profile.getActivity.queryOptions());
};
