import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '~/server/db';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );

  const response = NextResponse.json({
    message: 'Login successful',
    user: {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
  });

  response.cookies.set('token', token, {
    httpOnly: true,
    maxAge: 86400, // 1 day
  });

  return response;
}
