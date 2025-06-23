// app/api/departments/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const departmentId = parseInt(params.id);
    if (isNaN(departmentId)) {
      return NextResponse.json({ error: 'Invalid department ID' }, { status: 400 });
    }
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: {
        id: true,
        name: true,
        lat: true,
        lng: true,
      },
    });
    if (!department) {
      console.log(`Department: Department not found for ID ${departmentId}`);
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }
    console.log('Department: Fetched department:', department);
    return NextResponse.json(department);
  } catch (error) {
    console.error('Department: Error fetching department:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}