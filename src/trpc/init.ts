import { auth } from "@/lib/auth/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { getSubscriptionStatus } from "@/lib/billing/subscriptions";
import { LIMITS, GEMINI_KEY_HEADER } from "@/config/constants";
import { InvalidGeminiKeyError } from "@/helpers/ai";

export class GeminiKeyRequiredError extends Error {
  constructor() {
    super("Add your Gemini API key in Settings to use AI features.");
    this.name = "GeminiKeyRequiredError";
  }
}

export const createTRPCContext = cache(async (opts: { headers: Headers }) => {
  const session = await auth.api.getSession({
    headers: opts.headers,
  });

  const geminiApiKey = opts.headers.get(GEMINI_KEY_HEADER)?.trim() || null;

  return {
    session,
    headers: opts.headers,
    geminiApiKey,
  };
});

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
    errorFormatter: ({ shape, error }) => ({
      ...shape,
      data: {
        ...shape.data,
        geminiKeyIssue:
          error.cause instanceof GeminiKeyRequiredError ||
          error.cause instanceof InvalidGeminiKeyError,
      },
    }),
  });

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export function assertGeminiKey(
  apiKey: string | null | undefined,
): asserts apiKey is string {
  if (!apiKey) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Add your Gemini API key in Settings to use AI features.",
      cause: new GeminiKeyRequiredError(),
    });
  }
}

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

const geminiKeyMiddleware = t.middleware(async ({ ctx, next }) => {
  assertGeminiKey(ctx.geminiApiKey);

  return next({
    ctx: {
      ...ctx,
      geminiApiKey: ctx.geminiApiKey,
    },
  });
});

export const aiProcedure = protectedProcedure.use(geminiKeyMiddleware);

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
            interviews: LIMITS.PRO_INTERVIEWS,
            practice: LIMITS.PRO_PRACTICE,
            interviewLimitMinutes: LIMITS.PRO_INTERVIEW_LIMIT_MINUTES,
            maxQuestions: LIMITS.PRO_MAX_QUESTIONS,
            practiceAccessPercent: LIMITS.PRO_PRACTICE_ACCESS_PERCENT,
          }
        : {
            interviews: LIMITS.FREE_INTERVIEWS,
            practice: LIMITS.FREE_PRACTICE,
            interviewLimitMinutes: LIMITS.FREE_INTERVIEW_LIMIT_MINUTES,
            maxQuestions: LIMITS.FREE_MAX_QUESTIONS,
            practiceAccessPercent: LIMITS.FREE_PRACTICE_ACCESS_PERCENT,
          },
      hasPro,
    },
  });
});

export const proAiProcedure = proProcedure.use(geminiKeyMiddleware);
