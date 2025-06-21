import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subjectId } = await req.json();
  // Input validation
  if (!subjectId || typeof subjectId !== 'number') {
    return NextResponse.json({ error: 'Invalid subjectId' }, { status: 400 });
  }

  // Verify subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });
  if (!subject) {
    return NextResponse.json({ error: 'Subject not found' }, { status: 400 });
  }

  // Generate unique code
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!isUnique && attempts < maxAttempts) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Declare code inside loop
    const existingSession = await prisma.attendanceSession.findUnique({
      where: { code },
    });
    if (!existingSession) {
      isUnique = true;
      try {
        const session = await prisma.attendanceSession.create({
          data: {
            code,
            subjectId,
            teacherId: user.id,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          },
        });

        return NextResponse.json({
          message: 'Session created successfully',
          session: {
            id: session.id,
            code: session.code,
            expiresAt: session.expiresAt,
            subjectId: session.subjectId,
            teacherId: session.teacherId,
          },
        });
      } catch (error) {
        console.error('Create session error:', error);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }
    }
    attempts++;
  }

  return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
}