import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = parseInt(session.user.id);
  const body = await req.json();
  const { pin } = body;

  const [settings] = await db
    .select({ pinCode: appSettings.pinCode })
    .from(appSettings)
    .where(eq(appSettings.userId, userId))
    .limit(1);

  if (!settings) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (settings.pinCode !== pin) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
