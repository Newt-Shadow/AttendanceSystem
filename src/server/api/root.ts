import { userRouter } from "~/server/api/routers/user";
import { subjectRouter } from "~/server/api/routers/subject";
import { attendanceRouter } from "~/server/api/routers/attendance";
import { createCallerFactory, router } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  user: userRouter,
  subject: subjectRouter,
  attendance: attendanceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.user.getUsers();
 *       ^? User[]
 */
export const createCaller = createCallerFactory(appRouter);