// app/api/attendance/logs/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUser(); // Add await
    if (!user || user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    const parsedSubjectId = parseInt(subjectId);
    if (isNaN(parsedSubjectId)) {
      return NextResponse.json({ error: 'Invalid Subject ID' }, { status: 400 });
    }

    // Verify teacher is authorized for the subject
    const subject = await prisma.subject.findFirst({
      where: {
        id: parsedSubjectId,
        teacherId: user.id,
      },
    });

    if (!subject) {
      return NextResponse.json({ error: 'Subject not found or unauthorized' }, { status: 403 });
    }

    const logs = await prisma.attendanceRecord.findMany({
      where: {
        session: { subjectId: parsedSubjectId },
      },
      select: {
        id: true,
        checkInTime: true,
        checkOutTime: true,
        method: true,
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
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching attendance logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}