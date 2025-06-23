// app/api/attendance/check-in/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';
import { checkVPN } from '~/lib/vpnCheck';
import { calculateDistance } from '~/lib/haversine';

export async function POST(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || '';
  const user = await getUser(token);
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, lat, lng, ip } = await req.json();

  // VPN check
  console.log("📡 Calling checkVPN with IP:", ip);
  const isVPN = await checkVPN(ip);
  if (isVPN) {
    return NextResponse.json({ error: 'VPN detected' }, { status: 403 });
  }

  // Find session
  const session = await prisma.attendanceSession.findUnique({
    where: { code },
    include: { subject: { include: { department: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
  }

  // Check geofence
  const distance = calculateDistance(
    lat,
    lng,
    session.subject.department.lat,
    session.subject.department.lng
  );
  if (distance > 200000000000) {
    return NextResponse.json({ error: 'Outside geofence' }, { status: 400 });
  }

  // Check if student already checked in
  const existing = await prisma.attendanceRecord.findUnique({
    where: {
      studentId_sessionId: {
        studentId: user.id,
        sessionId: session.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'You have already checked in for this session' }, { status: 400 });
  }

  // Create new attendance record
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