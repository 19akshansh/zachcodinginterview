import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { useTRPC } from "@/trpc/client";

export const useSuspenseMe = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.users.getMe.queryOptions());
};

export const useUpdateSettings = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.users.updateSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.users.getMe.queryKey(),
        });
        toast.success("Settings updated.");
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to update settings. Please try again.",
        );
      },
    }),
  );
};

export const useDeleteAccount = () => {
  const trpc = useTRPC();
  const router = useRouter();

  return useMutation(
    trpc.users.deleteAccount.mutationOptions({
      onSuccess: async () => {
        toast.success("Your account has been deleted.");
        await authClient.signOut();
        router.push("/signin");
        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error.message || "Failed to delete account. Please try again.",
        );
      },
    }),
  );
};
