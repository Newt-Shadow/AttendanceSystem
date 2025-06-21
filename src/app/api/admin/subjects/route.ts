import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, departmentId, semesterId, email } = await req.json();
  // Input validation
  if (
    !name ||
    typeof name !== 'string' ||
    !departmentId ||
    typeof departmentId !== 'number' ||
    (semesterId && typeof semesterId !== 'number') ||
    (email && typeof email !== 'string')
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Validate department
  const department = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!department) {
    return NextResponse.json({ error: 'Department not found' }, { status: 404 });
  }

  // Validate semester (if provided)
  let validatedSemesterId: number | undefined = semesterId;
  if (semesterId) {
    const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
    }
  } else {
    validatedSemesterId = undefined; // Explicitly set to undefined
  }

  // Validate teacher (if provided)
  let teacherId: number | undefined;
  if (email) {
    const teacher = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (!teacher || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Invalid or non-teacher email' }, { status: 400 });
    }
    teacherId = teacher.id;
  }

  try {
    const subject = await prisma.subject.create({
      data: {
        name,
        departmentId,
        semesterId: validatedSemesterId, // Fix: Use undefined, not null
        teacherId, // Fix: Already number | undefined
      },
    });
    return NextResponse.json({ message: 'Subject created', subject });
  } catch (error) {
    console.error('Create subject error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Subject name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subjects = await prisma.subject.findMany({
      include: {
        department: true,
        semester: true,
        teacher: {
          select: { id: true, name: true, email: true, role: true }, // Exclude sensitive fields
        },
      },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Fetch subjects error:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}