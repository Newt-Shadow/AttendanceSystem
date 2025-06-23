// app/api/attendance/mark/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studentId, sessionId } = await req.json();

    // Validate input
    if (!studentId || !sessionId) {
      return NextResponse.json({ error: 'Student ID and Session ID are required' }, { status: 400 });
    }

    const parsedStudentId = parseInt(studentId);
    const parsedSessionId = parseInt(sessionId);
    if (isNaN(parsedStudentId) || isNaN(parsedSessionId)) {
      return NextResponse.json({ error: 'Invalid Student ID or Session ID' }, { status: 400 });
    }

    // Verify session exists and belongs to the teacher
    const session = await prisma.attendanceSession.findUnique({
      where: { id: parsedSessionId },
      select: {
        id: true,
        teacherId: true,
        expiresAt: true,
        subject: {
          select: { id: true, name: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.teacherId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to mark attendance for this session' }, { status: 403 });
    }

    if (session.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Session has expired' }, { status: 400 });
    }

    // Verify student exists and is a STUDENT
    const student = await prisma.user.findUnique({
      where: { id: parsedStudentId },
      select: { id: true, role: true },
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Invalid or non-student ID' }, { status: 400 });
    }

    // Check if an attendance record already exists for this student and session
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        studentId: parsedStudentId,
        sessionId: parsedSessionId,
      },
    });

    if (existingRecord) {
      return NextResponse.json({ error: 'Attendance already recorded for this student in this session' }, { status: 400 });
    }

    // Create attendance record
    const record = await prisma.attendanceRecord.create({
      data: {
        studentId: parsedStudentId,
        sessionId: parsedSessionId,
        checkInTime: new Date(),
        method: 'manual',
      },
      select: {
        id: true,
        checkInTime: true,
        method: true,
        student: {
          select: { id: true, name: true },
        },
        session: {
          select: {
            id: true,
            subject: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ message: 'Attendance marked successfully', record });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}