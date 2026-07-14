import { AppHeader } from "@/components/layout/shared/appHeader";
import { AppSidebar } from "@/components/layout/shared/appSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { envSchem } from "@/config/envSchema";
import { requireAuth } from "@/lib/auth/utils";
import { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "Dashboard - ZACH Coding Interview",
  description: "An AI Powered Coding Interview Platform",
  openGraph: {
    title: "ZACH Coding Interview",
    description: "Dashboard - An AI Powered Coding Interview Platform",
    url: envSchem.NEXT_PUBLIC_APP_URL,
    siteName: "ZACH Coding Interview",
    images: [{ url: envSchem.NEXT_PUBLIC_APP_URL + "/images/logo.svg" }],
  },
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const auth = await requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <NuqsAdapter>{children}</NuqsAdapter>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
