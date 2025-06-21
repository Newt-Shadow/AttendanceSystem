import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "~/server/api/routers";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();
