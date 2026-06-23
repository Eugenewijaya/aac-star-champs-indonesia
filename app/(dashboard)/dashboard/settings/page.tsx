"use client";

import { useEffect, useState, useRef } from "react";

type Settings = {
  ttsPitch: number;
  ttsSpeed: number;
  ttsLang: string;
  pronunciationMap: string;
  hasPinCode: boolean;
};

type PronunciationEntry = { word: string; spoken: string };

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [pitch, setPitch] = useState(1.1);
  const [speed, setSpeed] = useState(0.75);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pronMap, setPronMap] = useState<PronunciationEntry[]>([]);
  const [newWord, setNewWord] = useState("");
  const [newSpoken, setNewSpoken] = useState("");
  const [saving, setSaving] = useState(false);
  const [pinError, setPinError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((data: Settings) => {
      setSettings(data);
      setPitch(data.ttsPitch);
      setSpeed(data.ttsSpeed);
      try {
        const map = JSON.parse(data.pronunciationMap);
        setPronMap(Object.entries(map).map(([word, spoken]) => ({ word, spoken: spoken as string })));
      } catch { /* use empty */ }
    });
  }, []);

  function testVoice() {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (synth.speaking) synth.cancel();
    const voices = synth.getVoices();
    const idVoice = voices.find((v) => v.lang.startsWith("id") && v.name.toLowerCase().includes("female")) ||
                    voices.find((v) => v.lang.startsWith("id")) ||
                    voices[0];
    const u = new SpeechSynthesisUtterance("Halo, saya senang bisa berbicara hari ini!");
    if (idVoice) u.voice = idVoice;
    u.lang = "id-ID";
    u.pitch = pitch;
    u.rate = speed;
    synth.speak(u);
  }

  async function save() {
    if (pin && pin !== confirmPin) { setPinError("PIN tidak cocok"); return; }
    if (pin && !/^\d{4}$/.test(pin)) { setPinError("PIN harus 4 digit angka"); return; }
    setPinError("");
    setSaving(true);

    const mapObj = Object.fromEntries(pronMap.map((e) => [e.word.toLowerCase(), e.spoken]));

    const body: Record<string, unknown> = {
      ttsPitch: pitch,
      ttsSpeed: speed,
      pronunciationMap: JSON.stringify(mapObj),
    };
    if (pin) body.pinCode = pin;

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    setPin("");
    setConfirmPin("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!settings) {
    return <div className="max-w-2xl mx-auto pt-8 text-center text-slate-400 font-semibold">Memuat pengaturan...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Pengaturan</h2>
        <p className="text-slate-500 text-sm font-semibold">Suara, PIN, dan preferensi lainnya</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-700 font-bold rounded-2xl p-4">
          ✅ Pengaturan berhasil disimpan!
        </div>
      )}

      {/* Voice Settings */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm">
        <h3 className="font-black text-slate-800 text-lg mb-5">🔊 Pengaturan Suara</h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-slate-600">Nada Suara (Pitch)</label>
              <span className="text-sm font-black text-amber-600">{pitch.toFixed(1)}×</span>
            </div>
            <input
              id="tts-pitch"
              type="range" min="0.5" max="2.0" step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-400 font-semibold mt-1">
              <span>Rendah (0.5)</span><span>Normal (1.0)</span><span>Tinggi (2.0)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-slate-600">Kecepatan Bicara (Speed)</label>
              <span className="text-sm font-black text-amber-600">{speed.toFixed(2)}×</span>
            </div>
            <input
              id="tts-speed"
              type="range" min="0.3" max="1.5" step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="flex justify-between text-xs text-slate-400 font-semibold mt-1">
              <span>Lambat (0.3)</span><span>Normal (1.0)</span><span>Cepat (1.5)</span>
            </div>
          </div>

          <button
            onClick={testVoice}
            id="test-voice-btn"
            className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold px-5 py-3 rounded-2xl card-press transition-colors"
          >
            🗣️ Tes Suara Sekarang
          </button>
        </div>
      </div>

      {/* Pronunciation Map */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm">
        <h3 className="font-black text-slate-800 text-lg mb-2">📝 Override Pelafalan</h3>
        <p className="text-sm text-slate-500 font-semibold mb-5">
          Atur cara kata tertentu diucapkan (gunakan untuk perbaiki pengucapan TTS)
        </p>

        <div className="space-y-2 mb-4">
          {pronMap.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2">
              <span className="font-bold text-slate-700 flex-1">{entry.word}</span>
              <span className="text-slate-400">→</span>
              <span className="font-semibold text-amber-700 flex-1">{entry.spoken}</span>
              <button
                onClick={() => setPronMap((m) => m.filter((_, j) => j !== i))}
                className="text-rose-500 hover:text-rose-700 font-bold text-lg"
              >×</button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Kata asli"
            className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm font-semibold"
          />
          <span className="flex items-center text-slate-400 font-bold">→</span>
          <input
            value={newSpoken}
            onChange={(e) => setNewSpoken(e.target.value)}
            placeholder="Cara baca"
            className="flex-1 px-3 py-2 rounded-xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none text-sm font-semibold"
          />
          <button
            onClick={() => {
              if (newWord && newSpoken) {
                setPronMap((m) => [...m, { word: newWord, spoken: newSpoken }]);
                setNewWord(""); setNewSpoken("");
              }
            }}
            className="bg-amber-500 text-white font-black px-3 py-2 rounded-xl card-press"
          >+</button>
        </div>
      </div>

      {/* PIN Settings */}
      <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm">
        <h3 className="font-black text-slate-800 text-lg mb-2">🔒 PIN Mode Anak</h3>
        <p className="text-sm text-slate-500 font-semibold mb-5">
          PIN 4 digit untuk keluar dari papan komunikasi. {settings.hasPinCode ? "PIN sudah diatur." : "Belum ada PIN — default 1234."}
        </p>

        {pinError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl p-3 mb-4 text-sm font-semibold">
            {pinError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">PIN Baru</label>
            <input
              id="pin-input"
              type="password" inputMode="numeric" maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-black text-2xl tracking-[0.5em] text-center"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Konfirmasi PIN</label>
            <input
              id="pin-confirm"
              type="password" inputMode="numeric" maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-black text-2xl tracking-[0.5em] text-center"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400 font-semibold mt-2">Kosongkan jika tidak ingin mengubah PIN saat ini.</p>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        id="save-settings-btn"
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-4 rounded-2xl shadow card-press disabled:opacity-60 text-lg transition-colors"
      >
        {saving ? "Menyimpan..." : "💾 Simpan Semua Pengaturan"}
      </button>
    </div>
  );
}
