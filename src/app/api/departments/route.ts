// app/api/departments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      select: { id: true, name: true },
    });
    console.log('Departments: Fetched departments:', departments);
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Departments: Error fetching departments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}