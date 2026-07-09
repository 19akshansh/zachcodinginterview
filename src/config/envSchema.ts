import z from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url("NEXT_PUBLIC_APP_URL is required for redirects"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().min(1, "BETTER_AUTH_URL is required"),
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  EMAIL_USER: z.string().min(1, "EMAIL_USER is required"),
  EMAIL_PASS: z.string().min(1, "EMAIL_PASS is required"),
  EMAIL_FROM: z.string().min(1, "EMAIL_FROM is required"),
  POLAR_ACCESS_TOKEN: z.string().min(1, "POLAR_ACCESS_TOKEN is required"),
  POLAR_SERVER: z.enum(["production", "sandbox"]).default("sandbox"),
  POLAR_PRO_PRODUCT_ID: z
    .string()
    .min(1, "POLAR_PRO_PRODUCT_ID (UUID) is required"),
  POLAR_SUCCESS_URL: z.url("POLAR_SUCCESS_URL must be a valid full URL"),
  CODESERVER_API_URL: z.url(
    "CODESERVER_API_URL is required (base URL of the zachcodinginterview_codeserver instance, no trailing slash)",
  ),
  CODESERVER_APIKEY: z.string().min(1, "CODESERVER_APIKEY is required"),
  CODESERVER_TIMEOUT_MS: z.coerce.number().positive().default(15000),
  BLOB_READ_WRITE_TOKEN: z.string().min(1, "VERCEL_BLOB_URL is required"),
});

export const envSchem = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
  POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN,
  POLAR_SERVER: process.env.POLAR_SERVER,
  POLAR_PRO_PRODUCT_ID: process.env.POLAR_PRO_PRODUCT_ID,
  POLAR_SUCCESS_URL: process.env.POLAR_SUCCESS_URL,
  CODESERVER_API_URL: process.env.CODESERVER_API_URL,
  CODESERVER_APIKEY: process.env.CODESERVER_APIKEY,
  CODESERVER_TIMEOUT_MS: process.env.CODESERVER_TIMEOUT_MS,
  BLOB_READ_WRITE_TOKEN: process.env.VERCEL_BLOB_URL,
});
