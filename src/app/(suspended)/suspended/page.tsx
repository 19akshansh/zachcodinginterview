import { AuthLayout } from "@/features/auth/components/authLayout";
import { SuspendedNotice } from "@/features/auth/components/suspendedNotice";
import { checkAuth } from "@/lib/auth/utils";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Suspended - ZACH Coding Interview",
};

const Page = async () => {
  const session = await checkAuth();

  if (!session) {
    redirect("/signin");
  }

  if (!session.user.banned) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout>
      <SuspendedNotice reason={session.user.bannedReason} />
    </AuthLayout>
  );
};

export default Page;
