import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(), // Optional for migrations
    JWT_SECRET: z.string().min(32),
    IPAPI_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_OFFICE_LAT: z.string().regex(/^-?\d+(\.\d+)?$/, 'Must be a valid latitude'),
    NEXT_PUBLIC_OFFICE_LNG: z.string().regex(/^-?\d+(\.\d+)?$/, 'Must be a valid longitude'),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    IPAPI_KEY: process.env.IPAPI_KEY,
    NEXT_PUBLIC_OFFICE_LAT: process.env.NEXT_PUBLIC_OFFICE_LAT,
    NEXT_PUBLIC_OFFICE_LNG: process.env.NEXT_PUBLIC_OFFICE_LNG,
  },
});