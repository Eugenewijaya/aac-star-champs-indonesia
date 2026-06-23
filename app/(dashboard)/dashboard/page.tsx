import { auth } from "@/auth";
import { db } from "@/lib/db";
import { categories, vocabularyCards } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import Link from "next/link";
import { Layers, Tag, Monitor } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userId = parseInt(session!.user!.id!);

  // Category count for this user
  const [catCountRow] = await db
    .select({ value: count() })
    .from(categories)
    .where(eq(categories.userId, userId));
  const catCount = catCountRow?.value ?? 0;

  // Total card count via JOIN
  const [cardCountRow] = await db
    .select({ value: count() })
    .from(vocabularyCards)
    .innerJoin(categories, eq(vocabularyCards.categoryId, categories.id))
    .where(eq(categories.userId, userId));
  const cardCount = cardCountRow?.value ?? 0;

  const stats = [
    {
      label: "Total Kategori",
      value: catCount,
      icon: Layers,
      color: "bg-sky-50 text-sky-600 border-sky-200",
      href: "/dashboard/categories",
    },
    {
      label: "Total Kartu Kata",
      value: cardCount,
      icon: Tag,
      color: "bg-amber-50 text-amber-600 border-amber-200",
      href: "/dashboard/categories",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-800">
          Halo, {session?.user?.name?.split(" ")[0] ?? "Admin"} 👋
        </h2>
        <p className="text-slate-500 font-semibold mt-1">
          Kelola papan komunikasi dan masuk ke Mode Anak di sini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className={`bg-white rounded-3xl border-2 ${stat.color} p-6 flex items-center gap-4 shadow-sm card-press`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm mb-6">
        <h3 className="font-black text-slate-800 text-lg mb-4">Aksi Cepat</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/categories"
            id="manage-categories-btn"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-2xl card-press transition-colors"
          >
            <Layers size={18} />
            Kelola Kategori &amp; Kartu
          </Link>
          <Link
            href="/board"
            id="enter-board-btn"
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow card-press transition-colors"
          >
            <Monitor size={18} />
            Masuk Mode Anak
          </Link>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6">
        <h3 className="font-black text-amber-700 mb-3">💡 Tips</h3>
        <ul className="space-y-2 text-sm font-semibold text-amber-800">
          <li>• Atur PIN di <Link href="/dashboard/settings" className="underline">Pengaturan</Link> sebelum menyerahkan tablet ke anak</li>
          <li>• Unggah foto nyata dari keseharian anak agar lebih mudah dikenali</li>
          <li>• Sesuaikan kecepatan &amp; nada suara di Pengaturan → Suara</li>
          <li>• Instal aplikasi ke Homescreen untuk tampilan layar penuh</li>
        </ul>
      </div>
    </div>
  );
}
