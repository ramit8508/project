import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendResetOtpEmail } from "@/lib/email";

const OTP_TTL_MINUTES = 10;

export async function POST(request: NextRequest) {
  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { ok: false, message: "Email is required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { ok: true, message: "If the account exists, we sent an OTP." },
      { status: 200 }
    );
  }

  const code = crypto.randomInt(100000, 999999).toString();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  user.resetCodeHash = codeHash;
  user.resetCodeExpiresAt = new Date(
    Date.now() + OTP_TTL_MINUTES * 60 * 1000
  );
  await user.save();

  const result = await sendResetOtpEmail({ to: email, code });

  return NextResponse.json({
    ok: true,
    message:
      result.ok
        ? "OTP sent to your email."
        : "RESEND not configured. Add RESEND_API_KEY.",
  });
}
