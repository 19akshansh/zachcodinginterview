import { requireUnAuth } from "@/lib/auth/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import LandingPage from "@/components/layout/individual/landingPage";

const Page = async () => {
  const auth = await requireUnAuth();
  const queryClient = getQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LandingPage />
    </HydrationBoundary>
  );
};

export default Page;
