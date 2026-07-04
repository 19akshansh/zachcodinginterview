import { AuthLayout } from "@/features/auth/components/authLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - ZACH Coding Interview",
  description: "An AI Powered Coding Interview Platform",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <AuthLayout children={children} />;
};

export default Layout;
