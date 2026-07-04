"use client";

import { authClient } from "@/lib/authClient";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export const LogoutButton = () => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onBeforeRequest: () => setIsPending(true),
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.push("/signin");
          router.refresh();
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
          setIsPending(false);
        },
      },
    });
  };

  return (
    <Button variant="outline" onClick={handleLogout} disabled={isPending}>
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
};
