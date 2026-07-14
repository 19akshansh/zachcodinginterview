import { AppHeader } from "@/components/appHeader";
import { AppSidebar } from "@/components/appSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { envSchem } from "@/config/envSchema";
import { requireAuth } from "@/lib/authUtils";
import { BreadcrumbLabelsProvider } from "@/hooks/useBreadcrumbsLabel";
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
    <BreadcrumbLabelsProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppHeader />
          <NuqsAdapter>{children}</NuqsAdapter>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbLabelsProvider>
  );
};

export default Layout;
