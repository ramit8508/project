import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { History } from "@/models/History";

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();
  const history = await History.find({ userId: user._id })
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  return NextResponse.json({ ok: true, history });
}
