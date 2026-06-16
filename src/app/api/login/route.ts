import { NextResponse } from "next/server";
import { checkPassword, createSession } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!body.password || typeof body.password !== "string") {
    return NextResponse.json({ error: "missing_password" }, { status: 400 });
  }
  if (!checkPassword(body.password)) {
    return NextResponse.json({ error: "invalid_password" }, { status: 401 });
  }
  await createSession();
  return NextResponse.json({ ok: true });
}
