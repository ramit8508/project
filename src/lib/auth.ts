import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

const SESSION_COOKIE = "yw_session";
const SESSION_DAYS = 7;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

type SessionPayload = {
  sub: string;
  email: string;
};

export function signSession(userId: string, email: string) {
  return jwt.sign({ sub: userId, email } satisfies SessionPayload, JWT_SECRET, {
    expiresIn: `${SESSION_DAYS}d`,
  });
}

export function getSessionCookie(req: NextRequest) {
  return req.cookies.get(SESSION_COOKIE)?.value;
}

export function setSessionCookie(token: string) {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`;
}

export async function getUserFromRequest(req: NextRequest) {
  const token = getSessionCookie(req);
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    await connectToDatabase();
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}

export async function getUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    await connectToDatabase();
    return await User.findById(payload.sub);
  } catch {
    return null;
  }
}
