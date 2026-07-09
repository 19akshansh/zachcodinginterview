import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";

type GetManyInput = inferInput<typeof trpc.users.getMany>;

export const prefetchUsers = (params: GetManyInput) => {
  return prefetch(trpc.users.getMany.queryOptions(params));
};

export const prefetchUsersMe = (id: string) => {
  return prefetch(trpc.users.getMe.queryOptions({ id }));
};