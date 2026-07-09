import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { getSubscriptionStatus } from "@/lib/subscriptions";

export const createTRPCContext = cache(async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  return {
    session,
    headers: opts.headers,
  };
});

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
  });

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

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.auth.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required.",
    });
  }

  return next({ ctx });
});

export const recruiterProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (ctx.auth.user.role !== "RECRUITER" && ctx.auth.user.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Recruiter access required.",
      });
    }

    return next({ ctx });
  },
);

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
