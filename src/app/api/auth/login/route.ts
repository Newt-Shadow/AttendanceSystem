import { NextResponse } from "next/server";
import { login } from "~/lib/auth";
import { cookies } from "next/headers";


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const { token, user } = await login(email, password);

    cookies().set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ token, user });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 401 });
  }
}
