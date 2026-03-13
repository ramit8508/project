import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Account already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, credits: 10 });
    const tokenValue = signSession(user._id.toString(), user.email);

    const response = NextResponse.json({ ok: true, user: { email: user.email } });
    response.headers.append("Set-Cookie", setSessionCookie(tokenValue));
    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create account";
    return NextResponse.json(
      { ok: false, message },
      { status: 500 }
    );
  }
}
