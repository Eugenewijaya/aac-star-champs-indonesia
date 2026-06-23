import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  label: z.string().min(1).optional(),
  iconEmoji: z.string().min(1).optional(),
  bgColorClass: z.string().min(1).optional(),
  sortOrder: z.number().optional(),
});

// PUT /api/categories/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(session.user.id);
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const [updated] = await db
    .update(categories)
    .set(parsed.data)
    .where(and(eq(categories.id, parseInt(id)), eq(categories.userId, userId)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}

// DELETE /api/categories/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(session.user.id);

  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, parseInt(id)), eq(categories.userId, userId)))
    .returning();

  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
