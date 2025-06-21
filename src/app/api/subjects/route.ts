import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  const user = getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacherId');

  const subjects = await prisma.subject.findMany({
    where: teacherId ? { teacherId: parseInt(teacherId) } : {},
    include: { department: true, semester: true, teacher: true },
  });

  return NextResponse.json(subjects);
}