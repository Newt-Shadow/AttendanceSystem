import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import type { User } from '~/lib/auth';
import { getUser } from '~/lib/auth';

interface AttendanceSummary {
  subjectId: string;
  subject: { id: string; name: string };
  totalClasses: number;
  attendedClasses: number;
}

export async function GET(req: Request) {
  try {
    const user: User | null = await getUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const effectiveDepartmentId = user.departmentAsStudentId;
    if (!effectiveDepartmentId) {
      return NextResponse.json({ error: 'Student not assigned to a department' }, { status: 400 });
    }

    // Get semesterId from query parameter or fall back to user's semesterAsStudentId
    const { searchParams } = new URL(req.url);
    const semesterIdParam = searchParams.get('semesterId');
    let effectiveSemesterId: number | undefined;

    if (semesterIdParam) {
      effectiveSemesterId = parseInt(semesterIdParam);
      // Validate semester exists
      const semester = await prisma.semester.findUnique({ where: { id: effectiveSemesterId } });
      if (!semester) {
        return NextResponse.json({ error: 'Invalid semester ID' }, { status: 400 });
      }
    } else {
      effectiveSemesterId = user.semesterAsStudentId ?? user.semesterId;
      if (!effectiveSemesterId) {
        return NextResponse.json({ error: 'Student not assigned to a semester' }, { status: 400 });
      }
    }

    // Fetch attendance records with session details
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        studentId: user.id,
        checkInTime: { not: null },
        session: {
          subject: {
            semesterId: effectiveSemesterId,
            departmentId: effectiveDepartmentId,
          },
        },
      },
      select: {
        session: {
          select: {
            subjectId: true,
          },
        },
      },
    });

    // Count records per subject
    const recordCounts = attendanceRecords.reduce((acc, record) => {
      const subjectId = record.session.subjectId;
      acc[subjectId] = (acc[subjectId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Fetch subjects for the student's department and selected semester
    const subjects = await prisma.subject.findMany({
      where: {
        semesterId: effectiveSemesterId,
        departmentId: effectiveDepartmentId,
      },
      select: {
        id: true,
        name: true,
        sessions: {
          where: { expiresAt: { lte: new Date() } },
          select: { id: true },
        },
      },
    });

    // Generate summary
    const summary: AttendanceSummary[] = subjects.map((subject) => ({
      subjectId: String(subject.id),
      subject: {
        id: String(subject.id),
        name: subject.name,
      },
      totalClasses: subject.sessions.length,
      attendedClasses: recordCounts[subject.id] || 0,
    }));

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating attendance summary:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}