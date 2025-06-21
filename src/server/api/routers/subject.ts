import { z } from "zod";
import { router, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { TRPCError } from "@trpc/server";

export const subjectRouter = router({
  createSubject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        departmentId: z.number(),
        semesterId: z.number().optional(),
        teacherId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return db.subject.create({
        data: input,
        select: {
          id: true,
          name: true,
          departmentId: true,
          semesterId: true,
          teacherId: true,
        },
      });
    }),
  getSubjects: protectedProcedure.query(async () => {
    return db.subject.findMany({
      select: {
        id: true,
        name: true,
        department: {
          select: {
            id: true,
            name: true,
            lat: true,
            lon: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }),
  updateSubject: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        departmentId: z.number().optional(),
        semesterId: z.number().optional(),
        teacherId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return db.subject.update({
        where: { id: input.id },
        data: {
          name: input.name,
          departmentId: input.departmentId,
          semesterId: input.semesterId,
          teacherId: input.teacherId,
        },
        select: {
          id: true,
          name: true,
          departmentId: true,
          semesterId: true,
          teacherId: true,
        },
      });
    }),
  deleteSubject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.subject.delete({
        where: { id: input.id },
        select: {
          id: true,
        },
      });
    }),
});