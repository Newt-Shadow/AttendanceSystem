import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Attendance GET: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId') ? parseInt(searchParams.get('departmentId')!) : undefined;
    const semesterId = searchParams.get('semesterId') ? parseInt(searchParams.get('semesterId')!) : undefined;
    const subjectId = searchParams.get('subjectId') ? parseInt(searchParams.get('subjectId')!) : undefined;
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;

    const whereConditions: any = {
      session: {},
    };

    if (departmentId) {
      whereConditions.session.subject = { departmentId };
    }
    if (semesterId) {
      whereConditions.session.subject = { ...whereConditions.session.subject, semesterId };
    }
    if (subjectId) {
      whereConditions.session.subjectId = subjectId;
    }
    if (userId) {
      whereConditions.studentId = userId;
    }

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: whereConditions,
      include: {
        student: { select: { id: true, name: true, email: true } },
        session: {
          include: {
            subject: { select: { id: true, name: true, department: { select: { id: true, name: true } }, semester: { select: { id: true, name: true } } } },
            teacher: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { checkInTime: 'desc' },
    });

    console.log('Attendance GET: Fetched records:', attendanceRecords.length);
    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error('Attendance GET: Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance records' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Attendance DELETE: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recordId = searchParams.get('recordId') ? parseInt(searchParams.get('recordId')!) : undefined;

    if (!recordId || isNaN(recordId)) {
      console.log('Attendance DELETE: Invalid recordId:', recordId);
      return NextResponse.json({ error: 'Invalid attendance record ID' }, { status: 400 });
    }

    const record = await prisma.attendanceRecord.findUnique({ where: { id: recordId } });
    if (!record) {
      console.log('Attendance DELETE: Record not found:', recordId);
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 });
    }

    await prisma.attendanceRecord.delete({ where: { id: recordId } });

    console.log('Attendance DELETE: Record deleted:', recordId);
    return NextResponse.json({ message: 'Attendance record deleted' });
  } catch (error) {
    console.error('Attendance DELETE: Error deleting attendance record:', error);
    return NextResponse.json({ error: 'Failed to delete attendance record' }, { status: 500 });
  }
}