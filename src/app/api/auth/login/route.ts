import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: "Email and password are required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const tokenValue = signSession(user._id.toString(), user.email);
  const response = NextResponse.json({ ok: true, user: { email: user.email } });
  response.headers.append("Set-Cookie", setSessionCookie(tokenValue));
  return response;
}
