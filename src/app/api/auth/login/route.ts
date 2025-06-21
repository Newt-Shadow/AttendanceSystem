import { NextResponse } from "next/server";
import { login } from "~/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const { token, user } = await login(email, password);
    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}