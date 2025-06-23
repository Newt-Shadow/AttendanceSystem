import { NextResponse } from 'next/server';
import { getUser } from '~/lib/auth';

export async function GET(req: Request) {
  try {
   const authHeader = req.headers.get('authorization');
    console.log('GET /api/auth/me: Authorization header:', authHeader || 'none');
    const token = authHeader?.replace('Bearer ', '') || '';
    console.log('GET /api/auth/me: Extracted token:', token ? token.substring(0, 20) + '...' : 'none');
    const user = await getUser(token);

    if (!user) {
      console.log('GET /api/auth/me: No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('GET /api/auth/me: User found:', user.id, user.role);
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}