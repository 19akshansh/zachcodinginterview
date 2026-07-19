import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useSuspenseUserDetail = (userId: string) => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.users.getById.queryOptions({ userId }));
};
