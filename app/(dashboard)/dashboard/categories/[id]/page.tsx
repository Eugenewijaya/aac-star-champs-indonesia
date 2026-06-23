"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, ArrowLeft, Upload, X } from "lucide-react";

type Card = { id: number; word: string; emoji: string | null; imageUrl: string | null; sortOrder: number };
type Category = { id: number; label: string; iconEmoji: string; bgColorClass: string; cards: Card[] };

export default function CategoryCardsPage() {
  const params = useParams();
  const router = useRouter();
  const catId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ word: "", emoji: "", imageUrl: "" });
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchCategory() {
    const res = await fetch("/api/categories");
    const all: Category[] = await res.json();
    const cat = all.find((c) => c.id === parseInt(catId));
    setCategory(cat || null);
    setLoading(false);
  }

  useEffect(() => { fetchCategory(); }, [catId]);

  async function handleFileUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) {
      setForm((f) => ({ ...f, imageUrl: data.url, emoji: "" }));
      setPreviewUrl(data.url);
    }
    setUploading(false);
  }

  async function saveCard() {
    if (!form.word.trim()) return;
    setSaving(true);
    await fetch(`/api/categories/${catId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: form.word,
        emoji: form.imageUrl ? null : (form.emoji || "📌"),
        imageUrl: form.imageUrl || null,
      }),
    });
    await fetchCategory();
    setSaving(false);
    setShowAddModal(false);
    setForm({ word: "", emoji: "", imageUrl: "" });
    setPreviewUrl("");
  }

  async function deleteCard(id: number) {
    if (!confirm("Hapus kartu ini?")) return;
    await fetch(`/api/cards/${id}`, { method: "DELETE" });
    await fetchCategory();
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto pt-8 text-center text-slate-400 font-semibold">Memuat...</div>;
  }
  if (!category) {
    return <div className="max-w-4xl mx-auto pt-8 text-center text-rose-500 font-bold">Kategori tidak ditemukan</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/dashboard/categories")} className="bg-white border-2 border-slate-200 p-2.5 rounded-2xl card-press">
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.iconEmoji}</span>
            <h2 className="text-2xl font-black text-slate-800">{category.label}</h2>
          </div>
          <p className="text-slate-500 text-sm font-semibold">{category.cards.length} kartu</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          id="add-card-btn"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-3 rounded-2xl shadow card-press transition-colors"
        >
          <Plus size={18} /> Tambah Kartu
        </button>
      </div>

      {category.cards.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">🃏</p>
          <p className="font-bold text-slate-500">Belum ada kartu kata.</p>
          <p className="text-sm text-slate-400 font-semibold mt-1">Tekan "Tambah Kartu" untuk mulai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {category.cards.map((card) => (
            <div
              key={card.id}
              className={`${category.bgColorClass} border-2 rounded-3xl p-3 flex flex-col items-center relative group`}
            >
              <button
                onClick={() => deleteCard(card.id)}
                className="absolute top-2 right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity card-press"
                aria-label="Hapus"
              >
                <X size={12} />
              </button>

              {card.imageUrl ? (
                <div className="w-16 h-16 relative rounded-2xl overflow-hidden bg-white/60">
                  <Image src={card.imageUrl} alt={card.word} fill className="object-contain blend-multiply" unoptimized />
                </div>
              ) : (
                <span className="text-5xl leading-none">{card.emoji}</span>
              )}
              <span className="font-bold text-xs text-center mt-2 text-slate-700 leading-tight">{card.word}</span>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-xl font-black text-slate-800 mb-5">Tambah Kartu Kata</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Kata / Label</label>
                <input
                  id="card-word"
                  value={form.word}
                  onChange={(e) => setForm({ ...form, word: e.target.value })}
                  placeholder="Contoh: Apel"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Gambar / Emoji</label>

                {previewUrl ? (
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-amber-200 mb-2">
                    <Image src={previewUrl} alt="preview" fill className="object-contain" unoptimized />
                    <button
                      onClick={() => { setPreviewUrl(""); setForm((f) => ({ ...f, imageUrl: "" })); }}
                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input
                      id="card-emoji"
                      value={form.emoji}
                      onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                      placeholder="Emoji 🍎"
                      className="flex-1 px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-semibold text-slate-800 text-center text-2xl"
                    />
                    <button
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-3 rounded-2xl card-press transition-colors"
                    >
                      <Upload size={16} />
                      {uploading ? "Upload..." : "Upload Foto"}
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setForm({ word: "", emoji: "", imageUrl: "" }); setPreviewUrl(""); }}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl card-press"
              >
                Batal
              </button>
              <button
                onClick={saveCard}
                disabled={saving || !form.word.trim()}
                id="save-card-btn"
                className="flex-1 bg-amber-500 text-white font-black py-3 rounded-2xl card-press disabled:opacity-60"
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
