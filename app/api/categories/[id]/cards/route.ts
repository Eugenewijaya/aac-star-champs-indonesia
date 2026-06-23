import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { vocabularyCards, categories } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

const CardSchema = z.object({
  word: z.string().min(1),
  emoji: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

// GET /api/categories/[id]/cards
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(session.user.id);

  // Verify ownership
  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, parseInt(id)), eq(categories.userId, userId)))
    .limit(1);

  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const cards = await db
    .select()
    .from(vocabularyCards)
    .where(eq(vocabularyCards.categoryId, parseInt(id)))
    .orderBy(asc(vocabularyCards.sortOrder));

  return NextResponse.json(cards);
}

// POST /api/categories/[id]/cards
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(session.user.id);
  const categoryId = parseInt(id);

  // Verify ownership
  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
    .limit(1);

  if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = CardSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Get next sort order
  const existing = await db
    .select({ sortOrder: vocabularyCards.sortOrder })
    .from(vocabularyCards)
    .where(eq(vocabularyCards.categoryId, categoryId));

  const nextOrder = existing.length > 0
    ? Math.max(...existing.map((c) => c.sortOrder)) + 1
    : 0;

  const [card] = await db
    .insert(vocabularyCards)
    .values({ ...parsed.data, categoryId, sortOrder: nextOrder })
    .returning();

  return NextResponse.json(card, { status: 201 });
}
