"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export const SuspendedNotice = ({ reason }: { reason?: string | null }) => {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
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
    <div className="flex w-full max-w-sm flex-col gap-6 items-center text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <ShieldAlert className="w-10 h-10 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Your account has been suspended
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {reason
            ? reason
            : "An administrator has suspended this account. If you believe this is a mistake, please contact support."}
        </p>
      </div>

      <Button onClick={handleLogout} className="w-full">
        Sign out
      </Button>
    </div>
  );
};
