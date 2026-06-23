import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { vocabularyCards, categories } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const UpdateSchema = z.object({
  word: z.string().min(1).optional(),
  emoji: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  sortOrder: z.number().optional(),
});

async function verifyCardOwnership(cardId: number, userId: number) {
  const [card] = await db
    .select({ id: vocabularyCards.id, categoryId: vocabularyCards.categoryId })
    .from(vocabularyCards)
    .where(eq(vocabularyCards.id, cardId))
    .limit(1);
  if (!card) return null;

  const [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.id, card.categoryId), eq(categories.userId, userId)))
    .limit(1);
  if (!cat) return null;

  return card;
}

// PUT /api/cards/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(session.user.id);
  const cardId = parseInt(id);

  const card = await verifyCardOwnership(cardId, userId);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const [updated] = await db
    .update(vocabularyCards)
    .set(parsed.data)
    .where(eq(vocabularyCards.id, cardId))
    .returning();

  return NextResponse.json(updated);
}

// DELETE /api/cards/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = parseInt(session.user.id);
  const cardId = parseInt(id);

  const card = await verifyCardOwnership(cardId, userId);
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(vocabularyCards).where(eq(vocabularyCards.id, cardId));

  return NextResponse.json({ success: true });
}
