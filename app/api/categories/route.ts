import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { categories, vocabularyCards } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

// GET /api/categories — list all categories with their cards
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt(session.user.id);

  const cats = await db.query.categories.findMany({
    where: eq(categories.userId, userId),
    orderBy: [asc(categories.sortOrder)],
    with: {
      cards: {
        orderBy: [asc(vocabularyCards.sortOrder)],
      },
    },
  });

  return NextResponse.json(cats);
}

const CategorySchema = z.object({
  label: z.string().min(1),
  iconEmoji: z.string().min(1),
  bgColorClass: z.string().min(1),
});

// POST /api/categories — create a new category
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt(session.user.id);
  const body = await req.json();
  const parsed = CategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Get next sort order
  const existing = await db
    .select({ sortOrder: categories.sortOrder })
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.sortOrder));

  const nextOrder = existing.length > 0
    ? Math.max(...existing.map((c) => c.sortOrder)) + 1
    : 0;

  const [cat] = await db
    .insert(categories)
    .values({ ...parsed.data, userId, sortOrder: nextOrder })
    .returning();

  return NextResponse.json(cat, { status: 201 });
}
