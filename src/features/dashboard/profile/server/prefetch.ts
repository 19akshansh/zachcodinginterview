import { prefetch, trpc } from "@/trpc/server";

export const prefetchProfile = () =>
  prefetch(trpc.profile.getProfile.queryOptions());

export const prefetchActivity = () =>
  prefetch(trpc.profile.getActivity.queryOptions());
