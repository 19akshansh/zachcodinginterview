"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import { LogOut, User, KeyRound, Check, X } from "lucide-react";
import { toast } from "sonner";
import { SidebarTrigger } from "../../ui/sidebar";
import { authClient } from "@/lib/auth/client";
import { useBreadcrumbLabels } from "@/hooks/useBreadcrumbsLabel";
import { useGeminiKey } from "@/hooks/useGeminiKey";
import { cn } from "@/lib/others/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

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
  new: "New",
};

export const AppHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { labels } = useBreadcrumbLabels();

  const allSegments = pathname.split("/").filter(Boolean);

  const breadcrumbs = allSegments
    .map((segment, index) => {
      const href = "/" + allSegments.slice(0, index + 1).join("/");

      const label =
        routeLabels[segment] ??
        labels[segment] ??
        segment.charAt(0).toUpperCase() + segment.slice(1);
      return { label, href, segment };
    })
    .filter((bc, index, array) => {
      if (bc.segment === "dashboard" && array.length > 1) return false;
      return true;
    });

  const { data: session } = authClient.useSession();
  const {
    apiKey: geminiApiKey,
    isLoaded: isGeminiKeyLoaded,
    clearKey,
  } = useGeminiKey();
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

      <Breadcrumb className="ml-4 min-w-0">
        <BreadcrumbList className="flex-nowrap">
          {(() => {
            const MAX_VISIBLE = 3;
            const shouldCollapse = breadcrumbs.length > MAX_VISIBLE;
            const first = breadcrumbs[0];
            const hidden = shouldCollapse ? breadcrumbs.slice(1, -2) : [];
            const visible = shouldCollapse
              ? [first, ...breadcrumbs.slice(-2)]
              : breadcrumbs;

            return visible.map((bc, index) => {
              const isLast = index === visible.length - 1;
              const showEllipsisBefore = shouldCollapse && index === 1;

              return (
                <div key={bc.href} className="flex items-center min-w-0">
                  {index > 0 && <BreadcrumbSeparator />}

                  {showEllipsisBefore && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="flex items-center outline-none"
                          render={
                            <button type="button">
                              <BreadcrumbEllipsis className="hover:text-foreground" />
                            </button>
                          }
                        />
                        <DropdownMenuContent>
                          {hidden.map((hiddenBc) => (
                            <DropdownMenuItem
                              key={hiddenBc.href}
                              render={
                                <Link
                                  href={hiddenBc.href}
                                  className="max-w-[240px] truncate"
                                  title={hiddenBc.label}
                                >
                                  {hiddenBc.label}
                                </Link>
                              }
                            />
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <BreadcrumbSeparator />
                    </>
                  )}

                  <BreadcrumbItem className="min-w-0">
                    {isLast ? (
                      <BreadcrumbPage
                        className="block max-w-[110px] truncate sm:max-w-[200px]"
                        title={bc.label}
                      >
                        {bc.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        className="block max-w-[90px] truncate sm:max-w-[140px]"
                        title={bc.label}
                        render={<Link href={bc.href}>{bc.label}</Link>}
                      />
                    )}
                  </BreadcrumbItem>
                </div>
              );
            });
          })()}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center gap-2">
        {isGeminiKeyLoaded && (
          <Popover>
            <PopoverTrigger
              className="outline-none"
              render={
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                    geminiApiKey
                      ? "bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
                  )}
                  onClick={() => {
                    if (!geminiApiKey) router.push("/settings?tab=api-keys");
                  }}
                >
                  <KeyRound className="size-3.5" />
                  {geminiApiKey ? "Your Key Active" : "Add Gemini Key"}
                </button>
              }
            />
            {geminiApiKey && (
              <PopoverContent className="w-64">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Check className="size-4 text-green-500" />
                    Gemini key active
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    AI features use the key stored in this browser. It's never
                    sent anywhere except directly to your requests.
                  </p>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <Link
                      href="/settings?tab=api-keys"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Manage in Settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        clearKey();
                      }}
                      className="flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline w-fit"
                    >
                      <X className="size-3.5" />
                      Remove My Custom Key
                    </button>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            className="w-8 h-8 rounded-full overflow-hidden border border-border hover:ring-2 hover:ring-primary/50 transition cursor-pointer"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={displayName}
                className="w-full h-full object-cover"
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
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                  {session?.user?.email}
                </p>
              </div>
              <Link
                href="/profile"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground rounded-lg text-left hover:bg-muted hover:text-foreground transition-colors"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Profile</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
