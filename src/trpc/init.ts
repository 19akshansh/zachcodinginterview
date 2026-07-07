import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { getSubscriptionStatus } from "@/lib/subscriptions";

export const createTRPCContext = cache(async (opts: { headers: Headers }) => {
  let session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    session,
    headers: opts.headers,
  };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
  });
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const unprotectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  return next({
    ctx: {
      ...ctx,
      auth: null,
    },
  });
});

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = ctx.session;

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You can't access this.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: session,
    },
  });
});

export const proProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const subscriptionStatus = await getSubscriptionStatus(ctx.auth.user.id);

  if (subscriptionStatus === "UNKNOWN") {
    throw new TRPCError({
      code: "SERVICE_UNAVAILABLE",
      message:
        "Unable to verify subscription status. Please try again shortly.",
    });
  }

  const hasPro = subscriptionStatus === "PRO";

  return next({
    ctx: {
      ...ctx,
      limits: hasPro
        ? {
            interviews: Infinity,
            practice: Infinity,
          }
        : {
            interviews: 2,
            practice: 2,
          },
      hasPro,
    },
  });
});
