import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { NextRequest } from "next/server";

export const maxDuration = 120;

const handler = (req: NextRequest) => {
  const cookie = req.headers.get("cookie");
  const host = req.headers.get("host");

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
  });
};

export { handler as GET, handler as POST };
