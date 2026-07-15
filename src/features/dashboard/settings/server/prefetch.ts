import { prefetch, trpc } from "@/trpc/server";

export const prefetchMe = () => prefetch(trpc.users.getMe.queryOptions());
