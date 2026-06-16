import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name_required" }, { status: 400 });
  await db.execute({
    sql: "UPDATE notebooks SET name = ?, updated_at = unixepoch() WHERE id = ?",
    args: [name, Number(id)],
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await db.execute({
    sql: "DELETE FROM notes WHERE notebook_id = ?",
    args: [Number(id)],
  });
  await db.execute({
    sql: "DELETE FROM notebooks WHERE id = ?",
    args: [Number(id)],
  });
  return NextResponse.json({ ok: true });
}
