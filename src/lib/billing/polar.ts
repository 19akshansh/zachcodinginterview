import { envSchem } from "@/config/envSchema";
import { Polar } from "@polar-sh/sdk";

export const POLAR_CONFIG = {
  successUrl: envSchem.POLAR_SUCCESS_URL,
  productId: envSchem.POLAR_PRO_PRODUCT_ID,
  returnUrl: envSchem.NEXT_PUBLIC_APP_URL,
};

export const polarClient = new Polar({
  accessToken: envSchem.POLAR_ACCESS_TOKEN,
  server: envSchem.POLAR_SERVER,
});
