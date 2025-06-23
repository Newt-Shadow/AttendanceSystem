// app/api/attendance/active-session/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeRecord = await prisma.attendanceRecord.findFirst({
      where: {
        studentId: user.id,
        checkOutTime: null,
      },
      include: {
        session: {
          include: {
            subject: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!activeRecord) {
      return NextResponse.json({}, { status: 200 }); // No active session
    }

    return NextResponse.json({
      sessionId: activeRecord.session.id,
      subjectId: activeRecord.session.subject.id,
      subject: {
        id: activeRecord.session.subject.id,
        name: activeRecord.session.subject.name,
      },
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}