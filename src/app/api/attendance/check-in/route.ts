import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';
import { checkVPN } from '~/lib/vpnCheck';
import { calculateDistance } from '~/lib/haversine';

export async function POST(req: Request) {
  const user = await getUser(); // Add await
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, lat, lng, ip } = await req.json();
  const isVPN = await checkVPN(ip);
  if (isVPN) {
    return NextResponse.json({ error: 'VPN detected' }, { status: 403 });
  }

  const session = await prisma.attendanceSession.findUnique({
    where: { code },
    include: { subject: { include: { department: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  const distance = calculateDistance(lat, lng, session.subject.department.lat, session.subject.department.lng);
  if (distance > 200) {
    return NextResponse.json({ error: 'Outside geofence' }, { status: 400 });
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      studentId: user.id,
      sessionId: session.id,
      checkInTime: new Date(),
      method: 'geofence',
      lat,
      lng,
    },
  });

  return NextResponse.json({ message: 'Check-in successful', record });
}