"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Card = { id: number; word: string; emoji: string | null; imageUrl: string | null; sortOrder: number };
type Category = { id: number; label: string; iconEmoji: string; bgColorClass: string; cards: Card[] };
type Settings = { ttsPitch: number; ttsSpeed: number; pronunciationMap: string };
type SentenceItem = { word: string; categoryId: number };

// Special categories that concatenate characters without spaces
const CHAR_CATEGORIES = ["alfabet", "Alfabet", "Angka", "angka"];

export default function BoardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCatId, setActiveCatId] = useState<number | null>(null);
  const [sentence, setSentence] = useState<SentenceItem[]>([]);
  const [settings, setSettings] = useState<Settings>({ ttsPitch: 1.1, ttsSpeed: 0.75, pronunciationMap: "{}" });
  const [pinModal, setPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [correctPin, setCorrectPin] = useState("1234");
  const [loading, setLoading] = useState(true);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinInputRef = useRef<HTMLInputElement>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Load voices
  useEffect(() => {
    function pickVoice() {
      const voices = window.speechSynthesis.getVoices();
      voiceRef.current =
        voices.find((v) => v.lang.startsWith("id") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("perempuan"))) ||
        voices.find((v) => v.lang.startsWith("id")) ||
        voices[0] ||
        null;
    }
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  // Fetch data
  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/settings").then((r) => r.json()),
    ]).then(([cats, s]) => {
      setCategories(cats);
      if (cats.length > 0) setActiveCatId(cats[0].id);
      setSettings(s);
      // Load stored PIN from a hidden endpoint not exposed via settings GET
      // We re-use a simple flag: settings has hasPinCode not the actual code
      // The PIN check is done server-side via /api/board/verify-pin
      setLoading(false);
    });
  }, []);

  // Prevent back button
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", "/board");
      setPinModal(true);
    };
    window.history.pushState(null, "", "/board");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Request fullscreen
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  }, []);

  function speak(text: string) {
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();

    let processed = text.toLowerCase();
    try {
      const map: Record<string, string> = JSON.parse(settings.pronunciationMap);
      const words = processed.split(" ");
      processed = words.map((w) => map[w] || w).join(" ");
    } catch { /* ignore parse errors */ }

    const u = new SpeechSynthesisUtterance(processed);
    if (voiceRef.current) u.voice = voiceRef.current;
    u.lang = "id-ID";
    u.pitch = settings.ttsPitch;
    u.rate = settings.ttsSpeed;
    synth.speak(u);
  }

  function addWord(word: string, catId: number) {
    setSentence((s) => [...s, { word, categoryId: catId }]);
    speak(word);
  }

  function speakAll() {
    const parts: string[] = [];
    let charBuffer = "";

    for (const item of sentence) {
      const cat = categories.find((c) => c.id === item.categoryId);
      const isChar = cat && (cat.label === "Alfabet" || cat.label === "Angka");
      if (isChar) {
        charBuffer += item.word;
      } else {
        if (charBuffer) { parts.push(charBuffer); charBuffer = ""; }
        parts.push(item.word);
      }
    }
    if (charBuffer) parts.push(charBuffer);
    speak(parts.join(" "));
  }

  // Long press to trigger PIN modal
  function startLongPress() {
    longPressTimer.current = setTimeout(() => {
      setPinModal(true);
      setPinInput("");
      setPinError(false);
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }, 2000);
  }

  function cancelLongPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }

  async function submitPin() {
    // Verify against server to avoid exposing PIN in client
    const res = await fetch("/api/verify-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: pinInput }),
    });
    if (res.ok) {
      document.exitFullscreen?.().catch(() => {});
      router.push("/dashboard");
    } else {
      setPinError(true);
      setPinInput("");
    }
  }

  const activeCategory = categories.find((c) => c.id === activeCatId);

  if (loading) {
    return (
      <div className="h-screen bg-[#FFF9EA] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce">🗣️</div>
          <p className="font-black text-amber-600 text-xl mt-4">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#FFF9EA] flex flex-col overflow-hidden select-none safe-top safe-bottom">

      {/* ─── Header / Sentence Builder ─── */}
      <header className="bg-white shadow-lg z-10 px-3 py-2.5 flex flex-col gap-2 shrink-0 rounded-b-[1.5rem] border-b-4 border-amber-200">
        <div className="flex justify-between items-center px-1">
          <h1 className="font-black text-xl text-amber-600">AAC</h1>
          {/* Lock button — long press 2s to exit */}
          <button
            id="lock-btn"
            onMouseDown={startLongPress}
            onMouseUp={cancelLongPress}
            onMouseLeave={cancelLongPress}
            onTouchStart={startLongPress}
            onTouchEnd={cancelLongPress}
            className="w-10 h-10 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-center text-xl card-press"
            title="Tahan 2 detik untuk keluar"
            aria-label="Tahan untuk keluar dari Mode Anak"
          >
            🔒
          </button>
        </div>

        {/* Sentence strip */}
        <div className="bg-amber-50/60 border-4 border-amber-100 rounded-2xl p-2.5 min-h-[80px] flex items-center justify-between gap-2 shadow-inner">
          <div className="flex-1 flex flex-wrap gap-1.5 items-center overflow-y-auto max-h-[100px] p-1">
            {sentence.length === 0 ? (
              <span className="text-slate-400 text-sm font-semibold italic">Tekan gambar untuk menyusun kata...</span>
            ) : (
              sentence.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSentence((s) => s.filter((_, j) => j !== i))}
                  className="bg-white px-3 py-1.5 rounded-xl shadow border text-sm font-bold text-slate-700 card-press"
                >
                  {item.word}
                </button>
              ))
            )}
          </div>
          <div className="flex gap-2 shrink-0 border-l-4 border-amber-100 pl-2">
            <button
              id="clear-btn"
              onClick={() => setSentence([])}
              className="bg-rose-100 text-rose-600 p-2.5 rounded-2xl w-14 h-14 flex flex-col items-center justify-center card-press text-2xl"
              aria-label="Hapus kalimat"
            >
              🗑️
            </button>
            <button
              id="speak-btn"
              onClick={speakAll}
              className="bg-amber-500 text-white p-2.5 rounded-2xl w-14 h-14 flex flex-col items-center justify-center card-press text-2xl shadow"
              aria-label="Ucapkan kalimat"
            >
              🗣️
            </button>
          </div>
        </div>
      </header>

      {/* ─── Category Tabs ─── */}
      <nav className="shrink-0 px-3 pt-2 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              className={`px-3 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all card-press flex items-center gap-1.5 ${
                activeCatId === cat.id
                  ? "bg-amber-500 text-white shadow"
                  : "bg-white text-slate-600 border-2 border-slate-200"
              }`}
            >
              <span>{cat.iconEmoji}</span>
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ─── Vocabulary Grid ─── */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-4">
        {activeCategory && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 pb-4">
            {activeCategory.cards.map((card) => (
              <button
                key={card.id}
                id={`card-${card.id}`}
                onClick={() => addWord(card.word, activeCategory.id)}
                className={`${activeCategory.bgColorClass} border-b-4 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 card-press min-h-[90px]`}
              >
                {card.imageUrl ? (
                  <div className="w-14 h-14 relative">
                    <Image
                      src={card.imageUrl}
                      alt={card.word}
                      fill
                      className="object-contain blend-multiply"
                      unoptimized
                    />
                  </div>
                ) : (
                  <span className="text-4xl leading-none">{card.emoji}</span>
                )}
                <span className="font-bold text-xs text-center leading-tight text-slate-700">{card.word}</span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ─── PIN Modal ─── */}
      {pinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🔐</div>
              <h2 className="text-xl font-black text-slate-800">Masukkan PIN</h2>
              <p className="text-sm text-slate-500 font-semibold mt-1">Untuk keluar dari Mode Anak</p>
            </div>

            {pinError && (
              <div className="bg-rose-50 border-2 border-rose-200 text-rose-600 text-sm font-bold rounded-2xl p-3 mb-4 text-center">
                ❌ PIN salah, coba lagi
              </div>
            )}

            <input
              ref={pinInputRef}
              id="pin-modal-input"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pinInput}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPinInput(val);
                setPinError(false);
                if (val.length === 4) {
                  // Auto-submit on 4th digit
                  setTimeout(() => {
                    const event = new Event("autosubmit");
                    document.dispatchEvent(event);
                  }, 100);
                }
              }}
              placeholder="••••"
              className="w-full text-center text-4xl font-black tracking-[1em] border-4 border-slate-200 focus:border-amber-400 rounded-2xl py-4 outline-none mb-4"
              autoFocus
            />

            {/* PIN Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (k === "⌫") {
                      setPinInput((p) => p.slice(0, -1));
                    } else if (k !== "" && pinInput.length < 4) {
                      const newVal = pinInput + k.toString();
                      setPinInput(newVal);
                      setPinError(false);
                    }
                  }}
                  className={`py-4 rounded-2xl font-black text-xl card-press ${
                    k === "" ? "invisible" :
                    k === "⌫" ? "bg-slate-100 text-slate-600" :
                    "bg-slate-100 text-slate-800 hover:bg-slate-200"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPinModal(false); setPinInput(""); setPinError(false); }}
                className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-2xl card-press"
              >
                Batal
              </button>
              <button
                onClick={submitPin}
                disabled={pinInput.length !== 4}
                id="pin-submit-btn"
                className="flex-1 bg-amber-500 text-white font-black py-3 rounded-2xl card-press disabled:opacity-40"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-submit listener */}
      <AutoSubmitListener onSubmit={submitPin} pinLength={pinInput.length} />
    </div>
  );
}

// Helper component to auto-submit when PIN reaches 4 digits
function AutoSubmitListener({ onSubmit, pinLength }: { onSubmit: () => void; pinLength: number }) {
  const submitted = useRef(false);
  useEffect(() => {
    if (pinLength === 4 && !submitted.current) {
      submitted.current = true;
      const t = setTimeout(() => {
        onSubmit();
        submitted.current = false;
      }, 150);
      return () => clearTimeout(t);
    }
    if (pinLength < 4) submitted.current = false;
  }, [pinLength, onSubmit]);
  return null;
}
