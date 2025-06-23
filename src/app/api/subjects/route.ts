// src/app/api/subjects/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    console.log('Subjects: Token:', token ? token.substring(0, 20) + '...' : 'none');
    const user = await getUser(token);
    if (!user) {
      console.log('Subjects: No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const semesterId = searchParams.get('semesterId');
    const teacherId = searchParams.get('teacherId');

    console.log('Subjects: Query params:', { departmentId, semesterId, teacherId, userId: user.id, role: user.role });

    const whereConditions: any = {};
    if (departmentId) {
      whereConditions.departmentId = parseInt(departmentId);
    }
    if (semesterId) {
      whereConditions.semesterId = parseInt(semesterId);
    }
 // Only apply teacherId filter for non-teachers if teacherId is provided
    if (teacherId && user.role !== 'TEACHER') {
      whereConditions.teacherId = parseInt(teacherId);
    }
    console.log('Subjects: Prisma query conditions:', whereConditions);
    const subjects = await prisma.subject.findMany({
      where: whereConditions,
      include: {
        department: { select: { id: true, name: true } },
        semester: { select: { id: true, name: true } },
      },
    });

    console.log('Subjects: Fetched for user:', user.id, 'Count:', subjects.length, 'Data:', subjects);
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Subjects: Error fetching subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}