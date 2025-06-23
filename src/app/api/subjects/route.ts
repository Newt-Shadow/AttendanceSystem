// src/app/api/subjects/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    const semesterId = searchParams.get('semesterId');

    const whereConditions: any = {};
    if (departmentId) {
      whereConditions.departmentId = parseInt(departmentId);
    }
    if (semesterId) {
      whereConditions.semesterId = parseInt(semesterId);
    }

    const subjects = await prisma.subject.findMany({
      where: whereConditions,
      include: { department: true, semester: true },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}