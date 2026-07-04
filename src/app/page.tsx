import { requireAuth } from "@/lib/authUtils";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { LogoutButton } from "@/features/auth/components/logoutBtn";

const Page = async () => {
  const auth = await requireAuth();
  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(trpc.getUsers.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-8 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Hi, {auth.user.email}</h1>
          <LogoutButton />
        </div>
        <p>Welcome to your dashboard.</p>
      </div>
    </HydrationBoundary>
  );
};

export default Page;
