import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Users POST: Unauthorized user:', user ? user.role : 'no user');
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
      console.log('Users POST: Invalid input:', { name, email, role, departmentId, semesterId });
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Verify department (if provided)
    if (departmentId) {
      const department = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!department) {
        console.log('Users POST: Department not found:', departmentId);
        return NextResponse.json({ error: 'Department not found' }, { status: 404 });
      }
    }

    // Verify semester (if provided)
    if (semesterId) {
      const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
      if (!semester) {
        console.log('Users POST: Semester not found:', semesterId);
        return NextResponse.json({ error: 'Semester not found' }, { status: 404 });
      }
    }

    // Additional validation: semesterId required for STUDENT role
    if (role === 'STUDENT' && !semesterId) {
      console.log('Users POST: Semester ID required for STUDENT role');
      return NextResponse.json({ error: 'Semester ID required for students' }, { status: 400 });
    }

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
      include: {
        department: { select: { id: true, name: true } },
        semester: { select: { id: true, name: true } },
      },
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = newUser;
    console.log('Users POST: User created:', userWithoutPassword);
    return NextResponse.json({ message: 'User created', user: userWithoutPassword });
  } catch (error) {
    console.error('Users POST: Error creating user:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Users GET: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        department: { select: { id: true, name: true } },
        semester: { select: { id: true, name: true } },
      },
    });

    // Exclude passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    console.log('Users GET: Fetched users:', usersWithoutPasswords.length);
    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Users GET: Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('Users DELETE: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') ? parseInt(searchParams.get('userId')!) : undefined;

    if (!userId || isNaN(userId)) {
      console.log('Users DELETE: Invalid userId:', userId);
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      console.log('Users DELETE: User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });

    console.log('Users DELETE: User deleted:', userId);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Users DELETE: Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}