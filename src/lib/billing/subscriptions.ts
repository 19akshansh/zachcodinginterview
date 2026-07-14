import { envSchem } from "@/config/envSchema";
import { polarClient } from "@/lib/billing/polar";

type SubscriptionStatus = "PRO" | "FREE" | "UNKNOWN";

type CacheEntry = {
  status: SubscriptionStatus;
  expiresAt: number;
};

const subscriptionCache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 60 * 1 * 1000;
const MAX_CACHE_SIZE = 1000;
export async function getSubscriptionStatus(
  userId: string,
): Promise<SubscriptionStatus> {
  const now = Date.now();
  const cached = subscriptionCache.get(userId);

  if (cached) {
    if (cached.expiresAt <= now) {
      subscriptionCache.delete(userId);
    } else {
      return cached.status;
    }
  }

  try {
    const customer = await polarClient.customers.getStateExternal({
      externalId: userId,
    });

    const hasPro =
      customer.activeSubscriptions?.some(
        (sub) =>
          sub.status === "active" &&
          sub.productId === envSchem.POLAR_PRO_PRODUCT_ID,
      ) ?? false;

    const status: SubscriptionStatus = hasPro ? "PRO" : "FREE";

    if (subscriptionCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = subscriptionCache.keys().next().value;
      if (oldestKey !== undefined) {
        subscriptionCache.delete(oldestKey);
      }
    }

    subscriptionCache.set(userId, {
      status,
      expiresAt: now + CACHE_TTL_MS,
    });

    return status;
  } catch (error) {
    console.error("[POLAR_SUBSCRIPTION_CHECK_FAILED]", userId, error);

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("not found")
    ) {
      return "FREE";
    }

    return "UNKNOWN";
  }
}
