import { router } from "~/server/api/trpc";
import { userRouter } from "./user";
import { subjectRouter } from "./subject";
import { attendanceRouter } from "./attendance";

export const appRouter = router({
  user: userRouter,
  subject: subjectRouter,
  attendance: attendanceRouter,
});

export type AppRouter = typeof appRouter;