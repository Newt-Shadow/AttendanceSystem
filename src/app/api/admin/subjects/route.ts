import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Subjects POST: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, departmentId, semesterId, teacherId } = await req.json();

    // Input validation
    if (
      !name ||
      typeof name !== 'string' ||
      !departmentId ||
      typeof departmentId !== 'number' ||
      (semesterId && typeof semesterId !== 'number') ||
      (teacherId && typeof teacherId !== 'number')
    ) {
      console.log('Subjects POST: Invalid input:', { name, departmentId, semesterId, teacherId });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Validate department
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      console.log('Subjects POST: Department not found:', departmentId);
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Validate semester (if provided)
    let validatedSemesterId: number | null = semesterId || null;
    if (semesterId) {
      const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
      if (!semester) {
        console.log('Subjects POST: Semester not found:', semesterId);
        return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
      }
    }

    // Validate teacher (if provided)
    let validatedTeacherId: number | null = teacherId || null;
    if (teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: { id: true, role: true },
      });
      if (!teacher || teacher.role !== 'TEACHER') {
        console.log('Subjects POST: Invalid or non-teacher ID:', teacherId);
        return NextResponse.json({ error: 'Invalid or non-teacher ID' }, { status: 400 });
      }
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        departmentId,
        semesterId: validatedSemesterId,
        teacherId: validatedTeacherId,
      },
      include: {
        department: { select: { id: true, name: true } },
        semester: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
    });

    console.log('Subjects POST: Subject created:', subject);
    return NextResponse.json({ message: 'Subject created', subject });
  } catch (error) {
    console.error('Subjects POST: Error creating subject:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Subject name already exists in this department' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create subject' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Subjects GET: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get('departmentId') ? parseInt(searchParams.get('departmentId')!) : undefined;
    const semesterId = searchParams.get('semesterId') ? parseInt(searchParams.get('semesterId')!) : undefined;

    const whereConditions: any = {};
    if (departmentId) {
      whereConditions.departmentId = departmentId;
    }
    if (semesterId) {
      whereConditions.semesterId = semesterId;
    }

    const subjects = await prisma.subject.findMany({
      where: whereConditions,
      include: {
        department: { select: { id: true, name: true } },
        semester: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
    });

    console.log('Subjects GET: Fetched subjects:', subjects.length);
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Subjects GET: Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Subjects DELETE: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId') ? parseInt(searchParams.get('subjectId')!) : undefined;

    if (!subjectId || isNaN(subjectId)) {
      console.log('Subjects DELETE: Invalid subjectId:', subjectId);
      return NextResponse.json({ error: 'Invalid subject ID' }, { status: 400 });
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
      console.log('Subjects DELETE: Subject not found:', subjectId);
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    await prisma.subject.delete({ where: { id: subjectId } });

    console.log('Subjects DELETE: Subject deleted:', subjectId);
    return NextResponse.json({ message: 'Subject deleted' });
  } catch (error) {
    console.error('Subjects DELETE: Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Subjects PUT: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name } = await req.json();

    // Input validation
    if (!id || typeof id !== 'number' || !name || typeof name !== 'string') {
      console.log('Subjects PUT: Invalid input:', { id, name });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Validate subject existence
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      console.log('Subjects PUT: Subject not found:', id);
      return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
    }

    // Check for duplicate subject name in the same department
    const existingSubject = await prisma.subject.findFirst({
      where: {
        name,
        departmentId: subject.departmentId,
        NOT: { id },
      },
    });
    if (existingSubject) {
      console.log('Subjects PUT: Subject name already exists in this department:', name);
      return NextResponse.json({ error: 'Subject name already exists in this department' }, { status: 400 });
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: { name },
      include: {
        department: { select: { id: true, name: true } },
        semester: { select: { id: true, name: true } },
        teacher: { select: { id: true, name: true } },
      },
    });

    console.log('Subjects PUT: Subject updated:', updatedSubject);
    return NextResponse.json({ message: 'Subject updated', subject: updatedSubject });
  } catch (error) {
    console.error('Subjects PUT: Error updating subject:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Subject name already exists in this department' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}