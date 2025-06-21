// app/api/attendance/summary/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import type { getUser, User } from '~/lib/auth';

// Match StudentDashboard's interface
interface AttendanceSummary {
  subjectId: string;
  subject: { id: string; name: string };
  totalClasses: number;
  attendedClasses: number;
}

// Define groupBy output type
interface AttendanceRecordGroupBy {
  subjectId: number;
  _count: { id: number };
}

export async function GET() {
  try {
    const user: User | null = await getUser(); // Fix: Use await
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use semesterAsStudentId for students, fallback to semesterId
    const effectiveSemesterId = user.semesterAsStudentId ?? user.semesterId;
    if (!effectiveSemesterId) {
      return NextResponse.json({ error: 'Student not assigned to a semester' }, { status: 400 });
    }

    // Fetch attendance records grouped by subjectId
    const records: AttendanceRecordGroupBy[] = await prisma.attendanceRecord.groupBy({
      by: ['subjectId'],
      where: {
        studentId: user.id,
        checkInTime: { not: null }, // Ensure only checked-in records
      },
      _count: { id: true },
    });

    // Fetch subjects for the student's semester
    const subjects = await prisma.subject.findMany({
      where: { semesterId: effectiveSemesterId },
      select: {
        id: true,
        name: true,
        sessions: {
          where: { expiresAt: { lte: new Date() } }, // Only non-expired sessions
          select: { id: true },
        },
      },
    });

    // Generate summary with string IDs
    const summary: AttendanceSummary[] = subjects.map((subject) => {
      const record = records.find((r) => r.subjectId === subject.id); // Fix: Explicit find
      return {
        subjectId: String(subject.id), // Cast to string
        subject: {
          id: String(subject.id),
          name: subject.name,
        },
        totalClasses: subject.sessions.length,
        attendedClasses: record ? record._count.id : 0, // Fix: Safe access
      };
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating attendance summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}