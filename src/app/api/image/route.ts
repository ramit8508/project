import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: false,
    status: "coming_soon",
    message: "Image generation is coming soon.",
  });
}
