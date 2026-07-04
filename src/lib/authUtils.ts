import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { envSchem } from "@/config/envSchema";

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  return session;
};

export const requireUnAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }
};

export const checkAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session ?? null;
};

export const requireAdmin = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

 if (session?.user.role !== "ADMIN") {
   redirect("/");
 }

  return session;
};

export const requireRecruiter = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

 if (session?.user.role !== "RECRUITER" && session?.user.role !== "ADMIN") {
   redirect("/");
 }

  return session;
};
