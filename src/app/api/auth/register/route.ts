import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '~/server/db';

export async function POST(req: Request) {
  const { name, email, password, role, departmentId, semesterId } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        departmentId,
        semesterId,
      },
    });

    return NextResponse.json({ message: 'User created', user });

  }   // ✅ Type guard: check if it's a Prisma error
     catch (error) {
      console.error("Registration error details:", error);
      if (typeof error === "object" && error !== null && "code" in error && (error as any).code === "P2002") {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }


  }
