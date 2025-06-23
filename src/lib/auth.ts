// src/lib/auth.ts
import jwt from 'jsonwebtoken';
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

export async function getUser(token: string): Promise<User | null> {
  if (!token) {
    console.log('No token provided');
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

    return user as User;
  } catch (error) {
    console.error('Error verifying token or fetching user:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}