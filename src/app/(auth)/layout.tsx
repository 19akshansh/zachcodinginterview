import { envSchem } from "@/config/envSchema";
import { AuthLayout } from "@/features/auth/components/authLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - ZACH Coding Interview",
    description: "An AI Powered Coding Interview Platform",
    openGraph: {
      title: "ZACH Coding Interview",
      description: "Authentication - An AI Powered Coding Interview Platform",
      url: envSchem.NEXT_PUBLIC_APP_URL,
      siteName: "ZACH Coding Interview",
      images: [{ url: envSchem.NEXT_PUBLIC_APP_URL + "/images/logo.svg" }],
    },
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthLayout children={children} />;
};

export default Layout;
