import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { hashPassword } from "~/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}