import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const { rows } = await db.execute({
    sql: `SELECT id, notebook_id, title, content, plain_text, pinned, archived, created_at, updated_at
          FROM notes WHERE id = ?`,
    args: [Number(id)],
  });
  if (rows.length === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(rows[0]);
}

type PatchBody = {
  title?: string;
  content?: string;
  plain_text?: string;
  notebook_id?: number | null;
  pinned?: 0 | 1 | boolean;
  archived?: 0 | 1 | boolean;
};

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as PatchBody;
  const fields: string[] = [];
  const args: (string | number | null)[] = [];

  if (body.title !== undefined) {
    fields.push("title = ?");
    args.push(body.title);
  }
  if (body.content !== undefined) {
    fields.push("content = ?");
    args.push(body.content);
  }
  if (body.plain_text !== undefined) {
    fields.push("plain_text = ?");
    args.push(body.plain_text);
  }
  if (body.notebook_id !== undefined) {
    fields.push("notebook_id = ?");
    args.push(body.notebook_id);
  }
  if (body.pinned !== undefined) {
    fields.push("pinned = ?");
    args.push(body.pinned ? 1 : 0);
  }
  if (body.archived !== undefined) {
    fields.push("archived = ?");
    args.push(body.archived ? 1 : 0);
  }
  if (fields.length === 0) {
    return NextResponse.json({ error: "no_fields" }, { status: 400 });
  }
  fields.push("updated_at = unixepoch()");
  args.push(Number(id));

  await db.execute({
    sql: `UPDATE notes SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await db.execute({
    sql: "DELETE FROM notes WHERE id = ?",
    args: [Number(id)],
  });
  return NextResponse.json({ ok: true });
}
