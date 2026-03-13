import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { History } from "@/models/History";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const item = await History.findById(params.id).lean();

    if (!item) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    if (String(item.userId) !== String(user._id)) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item });
  } catch {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const item = await History.findById(params.id);

    if (!item || String(item.userId) !== String(user._id)) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    const result = await History.deleteOne({ _id: params.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
}
