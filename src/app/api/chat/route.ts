import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { getUserFromRequest } from "@/lib/auth";
import { History } from "@/models/History";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, message: "OPENAI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  const user = await getUserFromRequest(request);

  const { prompt } = await request.json();
  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { ok: false, message: "Prompt is required" },
      { status: 400 }
    );
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json(
      { ok: false, message: data?.error?.message || "Chat failed" },
      { status: 500 }
    );
  }

  const answer = data?.choices?.[0]?.message?.content || "";

  if (user) {
    await connectToDatabase();
    await History.create({
      userId: user._id,
      type: "Chat",
      prompt,
      resultText: answer,
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: answer },
      ],
    });
  }

  return NextResponse.json({ ok: true, answer });
}
