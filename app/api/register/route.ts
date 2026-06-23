import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { seedUserVocabulary } from "@/lib/db/seed";

const RegisterSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if email already exists
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({ email, passwordHash, name })
      .returning();

    // Create default settings
    await db.insert(appSettings).values({ userId: newUser.id, seeded: false });

    // Seed default vocabulary
    await seedUserVocabulary(newUser.id);

    // Mark seeded
    await db
      .update(appSettings)
      .set({ seeded: true })
      .where(eq(appSettings.userId, newUser.id));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
