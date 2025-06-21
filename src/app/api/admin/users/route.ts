import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client'; // Import Prisma for error types

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, password, role, departmentId, semesterId } = await req.json();
  // Input validation
  if (
    !name ||
    typeof name !== 'string' ||
    !email ||
    typeof email !== 'string' ||
    !password ||
    typeof password !== 'string' ||
    !role ||
    !['ADMIN', 'TEACHER', 'STUDENT'].includes(role) ||
    (departmentId && typeof departmentId !== 'number') ||
    (semesterId && typeof semesterId !== 'number')
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  // Verify department and semester (if provided)
  if (departmentId) {
    const department = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 400 });
    }
  }
  if (semesterId) {
    const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
    if (!semester) {
      return NextResponse.json({ error: 'Semester not found' }, { status: 400 });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        departmentId: departmentId || null,
        semesterId: semesterId || null,
      },
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json({ message: 'User created', user: userWithoutPassword });
  } catch (error) {
    console.error('Create user error:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      include: { department: true, semester: true },
    });
    // Exclude passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}