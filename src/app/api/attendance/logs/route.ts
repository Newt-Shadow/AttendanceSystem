import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    console.log('Logs: Token:', token ? token.substring(0, 20) + '...' : 'none');
    const user = await getUser(token);
    if (!user || user.role !== 'TEACHER') {
      console.log('Logs: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const semesterId = searchParams.get('semesterId');

    if (!subjectId) {
      console.log('Logs: Missing subjectId');
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    const parsedSubjectId = parseInt(subjectId);
    if (isNaN(parsedSubjectId)) {
      console.log('Logs: Invalid subjectId:', subjectId);
      return NextResponse.json({ error: 'Invalid Subject ID' }, { status: 400 });
    }

    let parsedSemesterId: number | undefined;
    if (semesterId) {
      parsedSemesterId = parseInt(semesterId);
      if (isNaN(parsedSemesterId)) {
        console.log('Logs: Invalid semesterId:', semesterId);
        return NextResponse.json({ error: 'Invalid Semester ID' }, { status: 400 });
      }
    }

    // Verify the subject exists and belongs to the teacher's department
    const subject = await prisma.subject.findFirst({
      where: {
        id: parsedSubjectId,
        departmentId: user.departmentId, // Assumes user has departmentId
        ...(parsedSemesterId ? { semesterId: parsedSemesterId } : {}),
      },
      select: { id: true, name: true, teacherId: true, semesterId: true, departmentId: true },
    });

    console.log('Logs: Subject query result:', subject);
    if (!subject) {
      const subjectExists = await prisma.subject.findUnique({
        where: { id: parsedSubjectId },
        select: { id: true, departmentId: true, semesterId: true },
      });
      console.log('Logs: Subject exists check:', subjectExists);
      return NextResponse.json(
        { error: subjectExists ? 'Subject not in teacher\'s department or invalid semester' : 'Subject not found' },
        { status: 403 }
      );
    }

    const logs = await prisma.attendanceRecord.findMany({
      where: {
        session: {
          subjectId: parsedSubjectId,
          subject: {
            semesterId: parsedSemesterId ?? subject.semesterId,
          },
        },
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
      orderBy: { checkInTime: 'desc' },
    });

    console.log('Logs: Fetched logs:', logs.length);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Logs: Error fetching attendance logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}