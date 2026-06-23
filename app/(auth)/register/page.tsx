"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Terjadi kesalahan.");
      setLoading(false);
    } else {
      router.push("/login?registered=1");
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF9EA] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500 shadow-lg mb-4">
            <span className="text-4xl">🗣️</span>
          </div>
          <h1 className="text-3xl font-black text-amber-600">AAC</h1>
          <p className="text-slate-500 font-semibold mt-1">by Star Champs Indonesia</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border-4 border-amber-100 p-8">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Buat Akun</h2>
          <p className="text-slate-500 text-sm font-semibold mb-6">
            Kosa kata default akan otomatis dimuat setelah mendaftar 🎉
          </p>

          {error && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-600 rounded-2xl p-4 mb-5 text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Nama</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Bu Ani / Terapis Budi"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-semibold text-slate-800 bg-slate-50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Email</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ortu@email.com"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-semibold text-slate-800 bg-slate-50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Password</label>
              <input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-semibold text-slate-800 bg-slate-50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              id="register-btn"
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow-md transition-all card-press disabled:opacity-60 text-lg mt-2"
            >
              {loading ? "Mendaftar & memuat kosa kata..." : "Daftar Sekarang →"}
            </button>
          </form>

          <p className="text-center text-slate-500 font-semibold mt-6 text-sm">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-amber-600 font-black hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
