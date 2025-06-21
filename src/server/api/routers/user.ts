import { z } from "zod";
import { router, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { hashPassword } from "~/lib/auth";
import { TRPCError } from "@trpc/server";

export const userRouter = router({
  createUser: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
        departmentId: z.number().optional(),
        semesterId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const hashedPassword = await hashPassword(input.password);
      return db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          departmentId: input.departmentId,
          semesterId: input.semesterId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          semesterId: true,
        },
      });
    }),
  getUsers: protectedProcedure.query(async () => {
    return db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }),
  updateUser: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["ADMIN", "TEACHER", "STUDENT"]).optional(),
        departmentId: z.number().optional(),
        semesterId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.user.update({
        where: { id: input.id },
        data: {
          name: input.name,
          email: input.email,
          role: input.role,
          departmentId: input.departmentId,
          semesterId: input.semesterId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          departmentId: true,
          semesterId: true,
        },
      });
    }),
  deleteUser: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.user.delete({
        where: { id: input.id },
        select: {
          id: true,
        },
      });
    }),
});