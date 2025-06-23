// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '~/server/db';

export async function POST(req: Request) {
  try {
    const { name, email, password, role, departmentId, semesterId } = await req.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
    }
    if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    if (role === 'STUDENT' && (!departmentId || !semesterId)) {
      return NextResponse.json({ error: 'Department and semester required for students' }, { status: 400 });
    }
    if (departmentId) {
      const department = await prisma.department.findUnique({ where: { id: departmentId } });
      if (!department) {
        return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 });
      }
    }
    if (semesterId) {
      const semester = await prisma.semester.findUnique({ where: { id: semesterId } });
      if (!semester) {
        return NextResponse.json({ error: 'Invalid semester ID' }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        ...(role === 'STUDENT' && departmentId ? { departmentAsStudentId: departmentId } : {}),
        ...(role === 'STUDENT' && semesterId ? { semesterAsStudentId: semesterId } : {}),
        ...(role === 'TEACHER' && departmentId ? { departmentAsTeacherId: departmentId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        departmentAsStudentId: true,
        semesterAsStudentId: true,
        departmentAsTeacherId: true,
      },
    });

    // Generate JWT token for immediate login
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      message: 'User created',
      user,
      token,
    });
  } catch (error) {
    console.error('Registration error details:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'P2002') {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}