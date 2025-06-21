// src/app/api/semesters/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';

export async function GET() {
  const semesters = await prisma.semester.findMany();
  return NextResponse.json(semesters);
}
