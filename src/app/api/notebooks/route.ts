import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { rows } = await db.execute(`
    SELECT n.id, n.name, n.created_at, n.updated_at,
           (SELECT COUNT(*) FROM notes WHERE notebook_id = n.id AND archived = 0) AS note_count
    FROM notebooks n
    ORDER BY n.created_at ASC
  `);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = (body.name ?? "").trim() || "새 노트북";
  const result = await db.execute({
    sql: "INSERT INTO notebooks (name) VALUES (?) RETURNING id, name, created_at, updated_at",
    args: [name],
  });
  return NextResponse.json(result.rows[0]);
}
