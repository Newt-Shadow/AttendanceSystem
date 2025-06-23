// app/api/semesters/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';

export async function GET() {
  try {
    const semesters = await prisma.semester.findMany({
      select: { id: true, name: true },
    });
    console.log('Semesters: Fetched semesters:', semesters);
    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Semesters: Error fetching semesters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}