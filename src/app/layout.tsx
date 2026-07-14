import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/others/utils";
import { TRPCReactProvider } from "@/trpc/client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { envSchem } from "@/config/envSchema";
import { BreadcrumbLabelsProvider } from "@/hooks/useBreadcrumbsLabel";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ZACH Coding Interview",
  description: "An AI Powered Coding Interview Platform",
  openGraph: {
    title: "ZACH Coding Interview",
    description: "An AI Powered Coding Interview Platform",
    url: envSchem.NEXT_PUBLIC_APP_URL,
    siteName: "ZACH Coding Interview",
    images: [{ url: envSchem.NEXT_PUBLIC_APP_URL + "/images/logo.svg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        raleway.variable,
      )}
    >
      <body className="min-h-full flex flex-col dark">
        <TooltipProvider>
          <TRPCReactProvider>
            <BreadcrumbLabelsProvider>
              {children} <Toaster />
            </BreadcrumbLabelsProvider>
          </TRPCReactProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
