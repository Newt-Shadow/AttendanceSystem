// src/lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface User {
  id: number;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  name: string;
  email: string;
  departmentId?: number;
  department?: { id: number; name: string; lat?: number; lng?: number };
  semesterId?: number;
  semester?: { id: number; name: string };
  departmentAsStudentId?: number;
  semesterAsStudentId?: number;
}

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get('token')?.value;
  if (!token) {
    console.log('No token found in cookies');
    return null;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    console.log('JWT payload:', payload);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, lat: true, lng: true },
        },
        semesterId: true,
        semester: {
          select: { id: true, name: true },
        },
        departmentAsStudentId: true,
        semesterAsStudentId: true,
      },
    });

    if (!user || user.role !== payload.role) {
      console.log('User not found or role mismatch:', user);
      return null;
    }

    // console.log('User fetched:', user);
    return user as User;
  } catch (error) {
    console.error('Error verifying token or fetching user:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}