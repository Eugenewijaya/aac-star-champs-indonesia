"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Edit3, ChevronRight } from "lucide-react";

type Card = { id: number; word: string; emoji: string | null; imageUrl: string | null; sortOrder: number };
type Category = {
  id: number; label: string; iconEmoji: string; bgColorClass: string; sortOrder: number;
  cards: Card[];
};

const BG_OPTIONS = [
  { label: "Biru", value: "bg-sky-100 border-sky-300" },
  { label: "Oranye", value: "bg-orange-100 border-orange-300" },
  { label: "Merah", value: "bg-red-100 border-red-300" },
  { label: "Hijau", value: "bg-emerald-100 border-emerald-300" },
  { label: "Pink", value: "bg-pink-100 border-pink-300" },
  { label: "Kuning", value: "bg-amber-100 border-amber-300" },
  { label: "Ungu", value: "bg-purple-100 border-purple-300" },
  { label: "Indigo", value: "bg-indigo-100 border-indigo-300" },
  { label: "Cyan", value: "bg-cyan-100 border-cyan-300" },
  { label: "Abu", value: "bg-slate-100 border-slate-300" },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ label: "", iconEmoji: "📂", bgColorClass: BG_OPTIONS[0].value });
  const [saving, setSaving] = useState(false);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => { fetchCategories(); }, []);

  function openAdd() {
    setEditCat(null);
    setForm({ label: "", iconEmoji: "📂", bgColorClass: BG_OPTIONS[0].value });
    setShowAddModal(true);
  }

  function openEdit(cat: Category) {
    setEditCat(cat);
    setForm({ label: cat.label, iconEmoji: cat.iconEmoji, bgColorClass: cat.bgColorClass });
    setShowAddModal(true);
  }

  async function saveCategory() {
    if (!form.label.trim()) return;
    setSaving(true);
    if (editCat) {
      await fetch(`/api/categories/${editCat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    await fetchCategories();
    setSaving(false);
    setShowAddModal(false);
  }

  async function deleteCategory(id: number) {
    if (!confirm("Hapus kategori ini beserta semua kartunya?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await fetchCategories();
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Kategori</h2>
          <p className="text-slate-500 text-sm font-semibold">Kelola kategori dan kartu kata</p>
        </div>
        <button
          onClick={openAdd}
          id="add-category-btn"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-3 rounded-2xl shadow card-press transition-colors"
        >
          <Plus size={18} /> Tambah
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`${cat.bgColorClass} border-2 rounded-3xl p-4 flex items-center gap-4`}
            >
              <div className="text-3xl w-12 h-12 flex items-center justify-center bg-white/60 rounded-2xl shrink-0">
                {cat.iconEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-800 text-lg leading-tight truncate">{cat.label}</h3>
                <p className="text-slate-500 text-sm font-semibold">{cat.cards.length} kartu</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEdit(cat)}
                  className="bg-white/80 hover:bg-white p-2.5 rounded-2xl card-press transition-colors"
                  aria-label="Edit kategori"
                >
                  <Edit3 size={16} className="text-slate-600" />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="bg-rose-100 hover:bg-rose-200 p-2.5 rounded-2xl card-press transition-colors"
                  aria-label="Hapus kategori"
                >
                  <Trash2 size={16} className="text-rose-600" />
                </button>
                <Link
                  href={`/dashboard/categories/${cat.id}`}
                  className="bg-white/80 hover:bg-white p-2.5 rounded-2xl card-press transition-colors flex items-center"
                  aria-label="Kelola kartu"
                >
                  <ChevronRight size={16} className="text-slate-600" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-black text-slate-800 mb-5">
              {editCat ? "Edit Kategori" : "Tambah Kategori"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Nama Kategori</label>
                <input
                  id="cat-label"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Contoh: Aktivitas Sehari-hari"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Ikon Emoji</label>
                <input
                  id="cat-emoji"
                  value={form.iconEmoji}
                  onChange={(e) => setForm({ ...form, iconEmoji: e.target.value })}
                  placeholder="📂"
                  className="w-24 px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-2xl text-center"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Warna Latar</label>
                <div className="flex flex-wrap gap-2">
                  {BG_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm({ ...form, bgColorClass: opt.value })}
                      className={`${opt.value} border-2 px-3 py-2 rounded-xl font-bold text-xs card-press ${
                        form.bgColorClass === opt.value ? "ring-2 ring-amber-500 ring-offset-1" : ""
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl card-press transition-colors"
              >
                Batal
              </button>
              <button
                onClick={saveCategory}
                disabled={saving || !form.label.trim()}
                id="save-category-btn"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-black py-3 rounded-2xl card-press disabled:opacity-60 transition-colors"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
