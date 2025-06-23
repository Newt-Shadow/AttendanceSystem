import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';

export async function GET() {
  const departments = await prisma.department.findMany({});
  return NextResponse.json(departments);
}