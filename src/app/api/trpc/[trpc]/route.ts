// import { fetchRequestHandler } from "@trpc/server/adapters/next";
// import { appRouter } from "~/server/api/routers";
// import { createContext } from "~/server/api/context";

// export const runtime = "edge";

// export async function GET(req: Request) {
//   return fetchRequestHandler({
//     endpoint: "/api/trpc",
//     req,
//     router: appRouter,
//     createContext: () => createContext({ req: req as any }),
//   });
// }

// export async function POST(req: Request) {
//   return fetchRequestHandler({
//     endpoint: "/api/trpc",
//     req,
//     router: appRouter,
//     createContext: () => createContext({ req: req as any }),
//   });
// }

// app/api/trpc/route.ts

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/api/routers";
import { createContext } from "~/server/api/context";

export const runtime = "edge"; // ensures use of Edge runtime

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({req: req as any}),
  });

// Combine GET and POST handlers using the same handler
export { handler as GET, handler as POST };
