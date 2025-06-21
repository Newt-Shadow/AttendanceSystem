import { z } from "zod";
import { router, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { haversineDistance, checkVPN } from "~/lib/geolocation";
import { randomBytes } from "crypto";
import { TRPCError } from "@trpc/server";

export const attendanceRouter = router({
  generateCode: protectedProcedure
    .input(z.object({ subjectId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "TEACHER") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only teachers can generate codes" });
      }
      const code = randomBytes(3).toString("hex").toUpperCase();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      return db.attendanceSession.create({
        data: {
          code,
          subjectId: input.subjectId,
          teacherId: ctx.user.id,
          expiresAt,
        },
        select: {
          id: true,
          code: true,
          subjectId: true,
          teacherId: true,
          expiresAt: true,
          createdAt: true,
        },
      });
    }),
  markAttendance: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        lat: z.number(),
        lon: z.number(),
        ip: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "STUDENT") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only students can mark attendance" });
      }
      const session = await db.attendanceSession.findUnique({
        where: { code: input.code },
        include: { subject: { include: { department: true } } },
      });
      if (!session || session.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired code" });
      }
      const distance = haversineDistance(
        input.lat,
        input.lon,
        session.subject.department.lat,
        session.subject.department.lon
      );
      if (distance > 200) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Outside geofence" });
      }
      if (!(await checkVPN(input.ip, input.lat, input.lon))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "VPN detected" });
      }
      return db.attendanceRecord.create({
        data: {
          studentId: ctx.user.id,
          sessionId: session.id,
          method: "geofence",
          lat: input.lat,
          lng: input.lon,
        },
        select: {
          id: true,
          studentId: true,
          sessionId: true,
          method: true,
          lat: true,
          lng: true,
          checkInTime: true,
          checkOutTime: true,
        },
      });
    }),
  manualCheckIn: protectedProcedure
    .input(
      z.object({
        studentId: z.number(),
        sessionId: z.number(),
        method: z.string(),
        lat: z.number().optional(),
        lng: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "TEACHER") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only teachers can perform manual check-in" });
      }
      return db.attendanceRecord.create({
        data: {
          studentId: input.studentId,
          sessionId: input.sessionId,
          method: input.method,
          lat: input.lat,
          lng: input.lng,
        },
        select: {
          id: true,
          studentId: true,
          sessionId: true,
          method: true,
          lat: true,
          lng: true,
          checkInTime: true,
          checkOutTime: true,
        },
      });
    }),
  getAttendanceSummary: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "STUDENT") {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Only students can view attendance summary" });
    }
    const records = await db.attendanceRecord.findMany({
      where: { studentId: ctx.user.id },
      select: {
        session: {
          select: {
            subject: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    const summary = records.reduce((acc, record) => {
      const subjectId = record.session.subject.id;
      if (!acc[subjectId]) {
        acc[subjectId] = { subject: record.session.subject.name, attended: 0, total: 0 };
      }
      acc[subjectId].attended += 1;
      acc[subjectId].total += 1;
      return acc;
    }, {} as Record<number, { subject: string; attended: number; total: number }>);
    return Object.values(summary).map((s) => ({
      ...s,
      percentage: (s.attended / s.total) * 100,
    }));
  }),
  getAttendanceLogs: protectedProcedure
    .input(z.object({ subjectId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "TEACHER") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only teachers can view attendance logs" });
      }
      return db.attendanceRecord.findMany({
        where: { session: { subjectId: input.subjectId } },
        select: {
          id: true,
          student: {
            select: {
              id: true,
              name: true,
            },
          },
          session: {
            select: {
              id: true,
              subject: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          checkInTime: true,
          checkOutTime: true,
          method: true,
          lat: true,
          lng: true,
        },
      });
    }),
  getSessions: protectedProcedure
    .input(z.object({ subjectId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== "TEACHER") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only teachers can view sessions" });
      }
      return db.attendanceSession.findMany({
        where: { subjectId: input.subjectId, teacherId: ctx.user.id },
        select: {
          id: true,
          code: true,
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          createdAt: true,
          expiresAt: true,
        },
      });
    }),
  updateAttendance: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        checkInTime: z.date().optional(),
        checkOutTime: z.date().optional(),
        method: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "TEACHER") {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Only teachers can update attendance" });
      }
      return db.attendanceRecord.update({
        where: { id: input.id },
        data: {
          checkInTime: input.checkInTime,
          checkOutTime: input.checkOutTime,
          method: input.method,
        },
        select: {
          id: true,
          studentId: true,
          sessionId: true,
          method: true,
          lat: true,
          lng: true,
          checkInTime: true,
          checkOutTime: true,
        },
      });
    }),
});