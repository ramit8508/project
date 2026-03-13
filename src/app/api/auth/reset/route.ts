import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  const { email, code, password } = await request.json();
  if (!email || !code || !password) {
    return NextResponse.json(
      { ok: false, message: "Email, code, and password are required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
    return NextResponse.json(
      { ok: false, message: "Invalid or expired code" },
      { status: 400 }
    );
  }

  if (user.resetCodeExpiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { ok: false, message: "Code expired" },
      { status: 400 }
    );
  }

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  if (codeHash !== user.resetCodeHash) {
    return NextResponse.json(
      { ok: false, message: "Invalid code" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  user.passwordHash = passwordHash;
  user.resetCodeHash = undefined;
  user.resetCodeExpiresAt = undefined;
  await user.save();

  return NextResponse.json({ ok: true, message: "Password updated" });
}
