import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { History } from "@/models/History";
import { User } from "@/models/User";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, message: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  if (user.credits <= 0) {
    return NextResponse.json(
      { ok: false, message: "No credits available" },
      { status: 402 }
    );
  }

  const { prompt } = await request.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { ok: false, message: "Prompt is required" },
      { status: 400 }
    );
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, message: data?.error?.message || "Logo generation failed" },
      { status: 500 }
    );
  }

  const base64 = data?.data?.[0]?.b64_json;
  const image = base64 ? `data:image/png;base64,${base64}` : undefined;

  await connectToDatabase();
  await History.create({
    userId: user._id,
    type: "Logo",
    prompt,
    resultUrl: image,
  });
  await User.updateOne({ _id: user._id }, { $inc: { credits: -1 } });

  return NextResponse.json({ ok: true, image, creditsUsed: 1 });
}
