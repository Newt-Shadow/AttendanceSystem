import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
    const user = await getUser(token);
    if (!user || user.role !== 'ADMIN') {
      console.log('UserStats GET: Unauthorized user:', user ? user.role : 'no user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const totalUsers = await prisma.user.count();

    const usersByDepartmentAndSemester = await prisma.user.groupBy({
      by: ['departmentId', 'semesterId'],
      _count: { id: true },
      where: { role: 'STUDENT' }, // Only count students for department/semester breakdown
    });

    const formattedStats = await Promise.all(
      usersByDepartmentAndSemester.map(async (group) => {
        const department = group.departmentId
          ? await prisma.department.findUnique({ where: { id: group.departmentId }, select: { id: true, name: true } })
          : null;
        const semester = group.semesterId
          ? await prisma.semester.findUnique({ where: { id: group.semesterId }, select: { id: true, name: true } })
          : null;
        return {
          department: department ? { id: department.id, name: department.name } : null,
          semester: semester ? { id: semester.id, name: semester.name } : null,
          count: group._count.id,
        };
      })
    );

    console.log('UserStats GET: Fetched stats:', { totalUsers, formattedStats });
    return NextResponse.json({ totalUsers, usersByDepartmentAndSemester: formattedStats });
  } catch (error) {
    console.error('UserStats GET: Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}