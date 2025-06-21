import type { inferAsyncReturnType } from "@trpc/server";
import { db } from "~/server/db";
import { verifyToken } from "~/lib/auth";
import { NextRequest } from "next/server";

export async function createContext({ req }: { req: NextRequest }) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  let user = null;
  if (token) {
    try {
      user = await verifyToken(token);
    } catch {}
  }
  return { db, user, headers: req.headers };
}

export type Context = inferAsyncReturnType<typeof createContext>;