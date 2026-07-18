import { AppHeader } from "@/components/layout/shared/appHeader";
import { AppSidebar } from "@/components/layout/shared/appSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { envSchem } from "@/config/envSchema";
import { requireRecruiter } from "@/lib/auth/utils";
import { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const metadata: Metadata = {
  title: "Recruiter - ZACH Coding Interview",
  description: "An AI Powered Coding Interview Platform",
  openGraph: {
    title: "ZACH Coding Interview",
    description: "Recruiter - An AI Powered Coding Interview Platform",
    url: envSchem.NEXT_PUBLIC_APP_URL,
    siteName: "ZACH Coding Interview",
    images: [{ url: envSchem.NEXT_PUBLIC_APP_URL + "/images/logo.svg" }],
  },
};

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const auth = await requireRecruiter();

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
