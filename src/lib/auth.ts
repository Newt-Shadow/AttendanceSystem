// import jwt from 'jsonwebtoken';
// import { cookies } from 'next/headers';

// export function getUser() {
//   const token = cookies().get('token')?.value;
//   if (!token) return null;

//   try {
//     return jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
//   } catch {
//     return null;
//   }
// }
// lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface User {
  id: number;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  semesterId?: number;
  semesterAsStudentId?: number;
  name: string;
  email: string;
}

export async function getUser(): Promise<User | null> {
  const token = (await cookies()).get('token')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };

    // Fetch additional user data
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        semesterId: true,
        semesterAsStudentId: true,
      },
    });

    if (!user || user.role !== payload.role) return null;

    return user as User;
  } catch {
    return null;
  }
}