import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    JWT_SECRET: z.string().min(32), // Ensure JWT_SECRET is a non-empty string
    IPAPI_KEY: z.string().min(1), // Ensure IPAPI_KEY is a non-empty string
  },

  /**
   * Specify your client-side environment variables schema here.
   * Prefix with `NEXT_PUBLIC_` to expose to the client.
   */
  client: {
    NEXT_PUBLIC_OFFICE_LAT: z.string().regex(/^-?\d+\.\d+$/), // Validate as a float-like string
    NEXT_PUBLIC_OFFICE_LNG: z.string().regex(/^-?\d+\.\d+$/), // Validate as a float-like string
  },

  /**
   * Destructure environment variables manually for Next.js edge runtimes.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    JWT_SECRET: process.env.JWT_SECRET,
    IPAPI_KEY: process.env.IPAPI_KEY,
    NEXT_PUBLIC_OFFICE_LAT: process.env.NEXT_PUBLIC_OFFICE_LAT,
    NEXT_PUBLIC_OFFICE_LNG: process.env.NEXT_PUBLIC_OFFICE_LNG,
  },

  /**
   * Skip env validation if SKIP_ENV_VALIDATION is set (useful for Docker builds).
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined to avoid empty env vars.
   */
  emptyStringAsUndefined: true,
});