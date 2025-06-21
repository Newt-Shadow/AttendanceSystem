import { NextResponse } from 'next/server';
import { prisma } from '~/server/db';
import { getUser } from '~/lib/auth';
import { checkVPN } from '~/lib/vpnCheck';
import { calculateDistance } from '~/lib/haversine';

export async function POST(req: Request) {
  const user = await getUser(); // Fix: Await getUser
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, lat, lng, ip } = await req.json();
  // Input validation
  if (
    !sessionId ||
    typeof sessionId !== 'number' ||
    isNaN(lat) ||
    isNaN(lng) ||
    !ip ||
    typeof ip !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const isVPN = await checkVPN(ip);
  if (isVPN) {
    return NextResponse.json({ error: 'VPN detected' }, { status: 403 });
  }

  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId }, // Fix: Use 'id' field (adjust if sessionId is different)
    include: { subject: { include: { department: true } } },
  });

  if (!session || session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 400 });
  }

  const distance = calculateDistance(lat, lng, session.subject.department.lat, session.subject.department.lng);
  if (distance <= 200) {
    return NextResponse.json({ error: 'Still within geofence. Check-out requires leaving the area.' }, { status: 400 });
  }

  const record = await prisma.attendanceRecord.findFirst({
    where: {
      studentId: user.id,
      sessionId: session.id,
      checkOutTime: null,
    },
  });

  if (!record) {
    return NextResponse.json({ error: 'No active check-in found' }, { status: 400 });
  }

  const updatedRecord = await prisma.attendanceRecord.update({
    where: { id: record.id },
    data: {
      checkOutTime: new Date(),
      method: 'geofence',
      lat,
      lng,
    },
  });

  return NextResponse.json({ message: 'Check-out successful', record: updatedRecord });
}