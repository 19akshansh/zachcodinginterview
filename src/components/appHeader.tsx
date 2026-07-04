"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "./ui/sidebar";

const routeLabels: Record<string, string> = {
  urls: "All Links",
  "qr-codes": "QR Codes",
  analytics: "Analytics",
  history: "Click History",
  settings: "Settings",
  billing: "Plans & Billing",
};

export const AppHeader = () => {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-background">
      <SidebarTrigger />

      <nav className="ml-4 flex items-center text-sm">
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          const label = routeLabels[segment] ?? segment;
          const isLast = index === segments.length - 1;

          return (
            <div key={href} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground">/</span>
              )}

              {isLast ? (
                <span className="font-medium text-foreground">{label}</span>
              ) : (
                <Link
                  href={href}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </header>
  );
};
