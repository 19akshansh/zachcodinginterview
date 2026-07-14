import { checkAuth } from "@/lib/auth/utils";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/shared/appSidebar";
import { AppHeader } from "@/components/layout/shared/appHeader";
import LandingPage from "@/components/layout/individual/landingPage";
import { prefetchUsersMe } from "@/features/dashboard/users/server/prefetch";

const Page = async () => {
  const auth = await checkAuth();
  const queryClient = getQueryClient();

  if (auth) {
    await prefetchUsersMe();
  }

  const AuthComp = () => {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {" "}
          <AppHeader />
          <div className="p-8 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Hi, {auth?.user?.name}</h1>
            </div>
            <p>Welcome to your dashboard.</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  };

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {auth ? <AuthComp /> : <LandingPage />}
    </HydrationBoundary>
  );
};

export default Page;
