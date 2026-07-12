import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/authClient";

export const useSubscription = () => {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      const { data, error } = await authClient.customer.state();

      if (error) {
        // throw new Error(error.message || "Failed to fetch subscription state");
      }

      return data;
    },

    enabled: !!userId && !isAuthLoading,
    staleTime: 1000 * 60 * 5,
  });
};

export const useHasActivePROSubscription = () => {
  const { data, isLoading, isError, error } = useSubscription();

  if (isError) {
    console.error("Subscription Error:", error);
  }

  const hasActivePROSubscription = !!data?.activeSubscriptions?.length;

  return {
    hasActivePROSubscription,
    isLoading,
    isError,
  };
};
