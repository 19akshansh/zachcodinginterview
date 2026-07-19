import { headers } from "next/headers";
import { auth } from "./server";
import { redirect } from "next/navigation";

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  if (session.user.banned) {
    redirect("/suspended");
  }

  return session;
};

export const requireUnAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
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

  if (session?.user.banned) {
    redirect("/suspended");
  }

  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
};

export const requireRecruiter = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.banned) {
    redirect("/suspended");
  }

  if (session?.user.role !== "RECRUITER" && session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return session;
};
