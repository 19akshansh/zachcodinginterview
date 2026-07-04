import { AppHeader } from "@/components/appHeader";
import { AppSidebar } from "@/components/appSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { envSchem } from "@/config/envSchema";
import { requireAuth } from "@/lib/authUtils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - ZACH Coding Interview",
    description: "An AI Powered Coding Interview Platform",
    openGraph: {
      title: "ZACH Coding Interview",
      description: "Admin - An AI Powered Coding Interview Platform",
      url: envSchem.NEXT_PUBLIC_APP_URL,
      siteName: "ZACH Coding Interview",
      images: [{ url: envSchem.NEXT_PUBLIC_APP_URL + "/images/logo.svg" }],
    },
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const auth = requireAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
