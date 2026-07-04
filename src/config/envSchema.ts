import z from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL is required for redirects"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export const envSchem = envSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
});
