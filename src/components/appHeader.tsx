"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { SidebarTrigger } from "./ui/sidebar";
import { authClient } from "@/lib/authClient";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  interviews: "Interviews",
  practice: "Practice",
  profile: "Profile",
  reports: "Reports",
  resume: "Resume",
  settings: "Settings",
  billing: "Plans & Billing",
  admin: "Admin",
  recruiter: "Recruiter",
};

export const AppHeader = () => {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname.split("/").filter(Boolean);

  const { data: session } = authClient.useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = session?.user?.name;
  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.push("/signin");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });
  };

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

      <div className="ml-auto relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((open) => !open)}
          className="w-8 h-8 rounded-full overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition cursor-pointer"
          aria-label="Profile menu"
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={displayName}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {initials}
            </div>
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-10 bg-popover border border-border rounded-xl p-2 shadow-lg min-w-[180px] z-50">
            <div className="px-3 py-2 border-b border-border mb-1.5">
              <p className="text-xs font-semibold text-foreground truncate">
                {displayName}
              </p>
              {session?.user?.email && (
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {session.user.email}
                </p>
              )}
            </div>

            <button
              type="button"
              disabled
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground/60 rounded-lg text-left cursor-not-allowed"
            >
              <User className="w-4 h-4 shrink-0" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
