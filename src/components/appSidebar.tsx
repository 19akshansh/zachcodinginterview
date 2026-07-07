"use client";

import {
  CreditCardIcon,
  LogOutIcon,
  PlusCircleIcon,
  UserIcon,
  LayoutDashboard,
  MessagesSquare,
  Dumbbell,
  UserCircle,
  FileBarChart,
  FileText,
  Settings,
  ShieldCheck,
  Briefcase,
  StarIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/authClient";
import { useQueryClient } from "@tanstack/react-query";
import { useHasActivePROSubscription } from "@/hooks/useSubscription";
import { Button } from "./ui/button";

type UserRole = "CANDIDATE" | "RECRUITER" | "ADMIN";

const navGroups: {
  label: string;
  roles: UserRole[];
  items: { title: string; icon: any; url: string }[];
}[] = [
  {
    label: "Dashboard",
    roles: ["CANDIDATE", "RECRUITER", "ADMIN"],
    items: [
      { title: "Dashboard", icon: LayoutDashboard, url: "/dashboard" },
      { title: "Interview", icon: MessagesSquare, url: "/interviews" },
      { title: "Practice", icon: Dumbbell, url: "/practice" },
      { title: "Profile", icon: UserCircle, url: "/profile" },
      { title: "Reports", icon: FileBarChart, url: "/reports" },
      { title: "Resume", icon: FileText, url: "/resume" },
      { title: "Settings", icon: Settings, url: "/settings" },
    ],
  },
  {
    label: "Admin",
    roles: ["ADMIN"],
    items: [{ title: "Admin Portal", icon: ShieldCheck, url: "/admin" }],
  },
  {
    label: "Recruiter",
    roles: ["RECRUITER", "ADMIN"],
    items: [{ title: "Recruiter", icon: Briefcase, url: "/recruiter" }],
  },
];

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const { hasActivePROSubscription, isLoading: isSubLoading } =
    useHasActivePROSubscription();

  if (isPending) {
    return null;
  }

  const currentRole = (session?.user?.role ?? "CANDIDATE") as UserRole;

  const visibleGroups = navGroups.filter((group) =>
    group.roles.includes(currentRole),
  );
  const initials = session?.user?.name
    ? session?.user?.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "G";

  const handleUpgrade = async () => {
    try {
      toast.info("Generating checkout link...");
      const { data, error } = await authClient.checkout({
        slug: "pro",
      });

      if (error) {
        toast.error(error.message || "Failed to initiate checkout.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred.");
    }
  };

  const handlePortal = async () => {
    try {
      const { data, error } = await authClient.customer.portal();

      if (error) {
        toast.error(error.message || "Could not open billing portal.");
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      toast.error("Could not open billing portal.");
    }
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          queryClient.clear();

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
    <Sidebar
      collapsible="icon"
      className="border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent group-data-[state=collapsed]:px-2"
            >
              <Image
                src="/mainAssets/logo.svg"
                alt="Zach Coding Interview"
                width={28}
                height={28}
                className="shrink-0"
              />
              <div className="flex flex-col gap-0.5 leading-none ml-2 group-data-[state=collapsed]:hidden">
                <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                  Zach Coding Interview
                </span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-sidebar-primary/80">
                  Crack those interviews!
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="group-data-[state=collapsed]:px-0 px-1 mt-4">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link href="/interviews/new" />}
                className="h-11 w-full bg-primary font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:text-primary-foreground hover:shadow-[0_0_15px_var(--color-primary)]/40 active:scale-[0.98] group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:justify-start"
              >
                <PlusCircleIcon className="size-5 shrink-0 fill-primary-foreground/20" />
                <span className="group-data-[state=collapsed]:hidden whitespace-nowrap">
                  Start an Interview
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-3">
            <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 group-data-[state=collapsed]:hidden">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent className="px-2 group-data-[state=collapsed]:px-0 mt-1">
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    pathname === item.url ||
                    pathname.startsWith(`${item.url}/`);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        render={<Link href={item.url} />}
                        tooltip={item.title}
                        isActive={active}
                        className={cn(
                          "relative h-10 px-3 transition-colors duration-200 group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:justify-start",
                          active
                            ? "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/15 hover:text-sidebar-primary"
                            : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon
                          className={cn(
                            "size-4 shrink-0",
                            active ? "text-sidebar-primary" : "opacity-70",
                          )}
                        />
                        <span className="font-medium group-data-[state=collapsed]:hidden whitespace-nowrap">
                          {item.title}
                        </span>
                        {active && (
                          <div className="absolute left-0 h-5 w-1 rounded-full bg-sidebar-primary group-data-[state=collapsed]:hidden" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {!hasActivePROSubscription && !isSubLoading && (
            <SidebarMenuItem>
              <SidebarMenuButton
                render={
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUpgrade();
                    }}
                  />
                }
                tooltip="Upgrade to PRO"
                className="text-amber-400 hover:bg-amber-400/10 hover:text-amber-300 transition-colors group-data-[state=collapsed]:px-2"
              >
                <StarIcon className="size-4 shrink-0 fill-amber-400/20" />
                <span className="font-semibold text-sm group-data-[state=collapsed]:hidden">
                  Upgrade to PRO
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePortal();
                  }}
                />
              }
              tooltip="Billing Portal"
              className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:justify-start"
            >
              <CreditCardIcon className="size-4 shrink-0 opacity-70" />
              <span className="font-medium text-sm group-data-[state=collapsed]:hidden whitespace-nowrap">
                Plans & Billing
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-4 bg-sidebar-border" />

          <SidebarMenuItem>
            <SidebarMenuButton
              render={<div />}
              size="lg"
              className="group h-14 rounded-xl bg-sidebar-accent/40 p-2 border border-sidebar-border transition-all hover:bg-sidebar-accent/70 hover:border-sidebar-ring/40 group-data-[state=collapsed]:border-none group-data-[state=collapsed]:bg-transparent group-data-[state=collapsed]:px-1"
            >
              <div className="flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/40 text-sidebar-primary ring-1 ring-sidebar-primary/20">
                <UserIcon className="size-5 shrink-0" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 ml-2 text-left group-data-[state=collapsed]:hidden">
                <span className="text-sm font-semibold text-sidebar-foreground/90 truncate w-24">
                  {session?.user?.name ?? "User"}
                </span>
                <span className="text-[11px] text-muted-foreground group-hover:text-sidebar-primary transition-colors capitalize">
                  {session?.user?.role ?? "CANDIDATE"}
                </span>
                <span className="text-[11px] text-muted-foreground group-hover:text-sidebar-primary transition-colors">
                  Sign out
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign out"
                className="group-data-[state=collapsed]:hidden"
              >
                <LogOutIcon className="size-4 text-muted-foreground/50 group-hover:text-sidebar-foreground transition-colors" />
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
