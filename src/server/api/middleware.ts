// import { middleware } from "@trpc/server";
// import { verifyToken } from "~/lib/auth";

// export const authMiddleware = middleware(async ({ ctx, next }) => {
//   if (!ctx.user) throw new Error("Unauthorized");
//   return next({ ctx });
// });

// src/server/api/trpc.ts

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";
import { verifyToken } from "~/lib/auth";

/**
 * 1. CONTEXT
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const token = opts.headers.get("authorization")?.replace("Bearer ", "");
  let user = null;

  if (token) {
    try {
      user = await verifyToken(token);
    } catch {
      // Invalid token; user remains null
    }
  }

  return {
    db,
    user,
    ...opts,
  };
};

/**
 * 2. INIT TRPC
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const procedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. AUTH MIDDLEWARE (Protected Routes)
 */
export const authMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Unauthorized" });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});


