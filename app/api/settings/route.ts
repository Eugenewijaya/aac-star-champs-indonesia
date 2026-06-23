import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

// GET /api/settings
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt(session.user.id);

  const [settings] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1);

  if (!settings) return NextResponse.json({ error: "Settings not found" }, { status: 404 });

  // Don't expose password hash via this endpoint
  return NextResponse.json({
    id: settings.id,
    ttsPitch: settings.ttsPitch,
    ttsSpeed: settings.ttsSpeed,
    ttsLang: settings.ttsLang,
    pronunciationMap: settings.pronunciationMap,
    hasPinCode: !!settings.pinCode,
  });
}

const SettingsSchema = z.object({
  ttsPitch: z.number().min(0.5).max(2.0).optional(),
  ttsSpeed: z.number().min(0.3).max(1.5).optional(),
  ttsLang: z.string().optional(),
  pronunciationMap: z.string().optional(),
  pinCode: z.string().length(4).regex(/^\d+$/).optional(),
});

// PUT /api/settings
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt(session.user.id);
  const body = await req.json();
  const parsed = SettingsSchema.safeParse(body);

  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const [updated] = await db
    .update(appSettings)
    .set(parsed.data)
    .where(eq(appSettings.userId, userId))
    .returning();

  return NextResponse.json({ success: true, updated });
}
