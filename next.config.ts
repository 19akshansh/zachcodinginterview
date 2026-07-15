import { envSchem } from "@/config/envSchema";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["pdf-parse", "jsdom", "html-encoding-sniffer"],
  allowedDevOrigins: [
    envSchem.NEXT_PUBLIC_APP_URL,
    "3000-cs-7452aacf-6504-4c6a-8e1c-96d00bb63f05.cs-asia-southeast1-ajrg.cloudshell.dev",
  ],
};

export default nextConfig;
