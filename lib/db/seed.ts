import { db } from "./index";
import { categories, vocabularyCards } from "./schema";

/** Default vocabulary from the static prototype */
const DEFAULT_VOCABULARY = [
  {
    id: "frasa",
    label: "Frasa Umum",
    bgColorClass: "bg-sky-100 border-sky-300",
    iconEmoji: "💬",
    words: [
      { word: "Ya", emoji: "👍" },
      { word: "Tidak", emoji: "👎" },
      { word: "Terima kasih", emoji: "🙏" },
      { word: "Maaf", emoji: "🥺" },
      { word: "Tolong", emoji: "🤝" },
      { word: "Halo", emoji: "👋" },
      { word: "Suka", emoji: "😍" },
      { word: "Tidak suka", imageUrl: "https://imgh.in/host/f8yr5t" },
      { word: "Permisi", emoji: "🤗" },
      { word: "Mau", emoji: "👐" },
      { word: "Sama", emoji: "🟰" },
      { word: "Berbeda", imageUrl: "https://imgh.in/host/aq9ayn" },
    ],
  },
  {
    id: "orang",
    label: "Orang",
    bgColorClass: "bg-orange-100 border-orange-300",
    iconEmoji: "👪",
    words: [
      { word: "Saya", imageUrl: "https://imgh.in/host/3nxxzo" },
      { word: "Kamu", imageUrl: "https://imgh.in/host/jfqlv4" },
      { word: "Dia", imageUrl: "https://imgh.in/host/vop7t6" },
      { word: "Ibu", emoji: "👩" },
      { word: "Ayah", emoji: "👨" },
      { word: "Kakak Perempuan", emoji: "👱‍♀️" },
      { word: "Kakak Laki-laki", emoji: "👦" },
      { word: "Adik", emoji: "👶" },
      { word: "Suster", emoji: "👩‍🍼" },
      { word: "Teman", emoji: "👭" },
      { word: "Guru", emoji: "👩‍🏫" },
      { word: "Terapis", emoji: "🧑‍⚕️" },
      { word: "Om", emoji: "👨" },
      { word: "Tante", emoji: "👩" },
    ],
  },
  {
    id: "makanan",
    label: "Makanan",
    bgColorClass: "bg-red-100 border-red-300",
    iconEmoji: "🍎",
    words: [
      { word: "Pepaya", imageUrl: "https://imgh.in/host/la9tnt" },
      { word: "Bayam", imageUrl: "https://imgh.in/host/87p17d" },
      { word: "Kangkung", imageUrl: "https://imgh.in/host/33bvto" },
      { word: "Wortel", emoji: "🥕" },
      { word: "Melon", emoji: "🍈" },
      { word: "Mangga", emoji: "🥭" },
      { word: "Pisang", emoji: "🍌" },
      { word: "Stroberi", emoji: "🍓" },
      { word: "Air", imageUrl: "https://imgh.in/host/6pvtzm" },
      { word: "Susu", emoji: "🥛" },
      { word: "Sayur", emoji: "🥗" },
      { word: "Kiwi", emoji: "🥝" },
      { word: "Kelapa", emoji: "🥥" },
      { word: "Apel", emoji: "🍎" },
      { word: "Brokoli", emoji: "🥦" },
      { word: "Jagung", emoji: "🌽" },
      { word: "Roti", emoji: "🍞" },
      { word: "Bluberi", emoji: "🫐" },
      { word: "Kentang", emoji: "🥔" },
      { word: "Ayam", emoji: "🍗" },
      { word: "Sup", emoji: "🥣" },
      { word: "Telur", emoji: "🍳" },
    ],
  },
  {
    id: "binatang",
    label: "Binatang",
    bgColorClass: "bg-emerald-100 border-emerald-300",
    iconEmoji: "🐶",
    words: [
      { word: "Anjing", emoji: "🐶" },
      { word: "Kucing", emoji: "🐱" },
      { word: "Beruang", emoji: "🐻" },
      { word: "Panda", emoji: "🐼" },
      { word: "Sapi", emoji: "🐮" },
      { word: "Katak", emoji: "🐸" },
      { word: "Singa", emoji: "🦁" },
      { word: "Kelinci", emoji: "🐰" },
      { word: "Babi", emoji: "🐷" },
      { word: "Ayam", emoji: "🐔" },
      { word: "Kuda", emoji: "🐴" },
      { word: "Kura-kura", emoji: "🐢" },
      { word: "Ikan", emoji: "🐟" },
      { word: "Zebra", emoji: "🦓" },
      { word: "Hiu", emoji: "🦈" },
      { word: "Burung", emoji: "🦜" },
    ],
  },
  {
    id: "emosi",
    label: "Emosi",
    bgColorClass: "bg-pink-100 border-pink-300",
    iconEmoji: "😊",
    words: [
      { word: "Senang", emoji: "😊" },
      { word: "Sedih", emoji: "😢" },
      { word: "Marah", emoji: "😠" },
      { word: "Takut", emoji: "😨" },
      { word: "Lelah", emoji: "😮‍💨" },
      { word: "Sakit", emoji: "🤒" },
      { word: "Terkejut", emoji: "😲" },
      { word: "Malu", emoji: "😳" },
      { word: "Bosan", emoji: "😒" },
      { word: "Menangis", emoji: "😭" },
      { word: "Tertawa", emoji: "🤣" },
      { word: "Lapar", emoji: "🤤" },
      { word: "Haus", emoji: "🥵" },
      { word: "Ngantuk", emoji: "🥱" },
    ],
  },
  {
    id: "objek",
    label: "Benda",
    bgColorClass: "bg-amber-100 border-amber-300",
    iconEmoji: "🧸",
    words: [
      { word: "Toilet", emoji: "🚽" },
      { word: "Perut", imageUrl: "https://imgh.in/host/o50vfb" },
      { word: "Bola", emoji: "⚽" },
      { word: "Mobil", emoji: "🚗" },
      { word: "Dinosaurus", emoji: "🦖" },
      { word: "Boneka", emoji: "🧸" },
      { word: "Sendal", emoji: "🩴" },
      { word: "Buku", emoji: "📚" },
      { word: "Balon", emoji: "🎈" },
      { word: "Sikat Gigi", emoji: "🪥" },
      { word: "Tempat Sampah", emoji: "🗑️" },
      { word: "Gambar", emoji: "🖼️" },
      { word: "Jam", emoji: "⏰" },
      { word: "Payung", emoji: "☂️" },
      { word: "Motor", emoji: "🛵" },
      { word: "Sepeda", emoji: "🚲" },
      { word: "Pesawat", emoji: "🛩️" },
      { word: "Helikopter", emoji: "🚁" },
      { word: "Perahu", emoji: "⛵️" },
      { word: "Drum", emoji: "🥁" },
      { word: "Piano", emoji: "🎹" },
      { word: "Bunga", emoji: "🌻" },
      { word: "Bintang", emoji: "⭐️" },
      { word: "Matahari", emoji: "☀️" },
      { word: "Bumi", emoji: "🌏" },
      { word: "Bulan", emoji: "🌘" },
      { word: "Awan", emoji: "☁️" },
      { word: "Tas", emoji: "🎒" },
      { word: "Botol", imageUrl: "https://imgh.in/host/3jzvk2" },
      { word: "Sepatu", emoji: "👟" },
      { word: "Baju", emoji: "👕" },
      { word: "Celana", emoji: "👖" },
      { word: "Pensil", emoji: "✏️" },
    ],
  },
  {
    id: "tanya",
    label: "Tanya",
    bgColorClass: "bg-purple-100 border-purple-300",
    iconEmoji: "❓",
    words: [
      { word: "Apa", imageUrl: "https://imgh.in/host/vvs1h0" },
      { word: "Siapa", imageUrl: "https://imgh.in/host/uy41lx" },
      { word: "Di mana", imageUrl: "https://imgh.in/host/9sjnmi" },
      { word: "Kenapa", imageUrl: "https://imgh.in/host/ayr83f" },
      { word: "Kapan", imageUrl: "https://imgh.in/host/85zfbm" },
    ],
  },
  {
    id: "alfabet",
    label: "Alfabet",
    bgColorClass: "bg-indigo-100 border-indigo-300",
    iconEmoji: "🔤",
    words: Array.from({ length: 26 }, (_, i) => ({
      word: String.fromCharCode(65 + i),
      emoji: String.fromCharCode(65 + i),
    })),
  },
  {
    id: "angka",
    label: "Angka",
    bgColorClass: "bg-rose-100 border-rose-300",
    iconEmoji: "🔢",
    words: Array.from({ length: 21 }, (_, i) => ({
      word: i.toString(),
      emoji: i.toString(),
    })),
  },
  {
    id: "cuaca",
    label: "Cuaca",
    bgColorClass: "bg-cyan-100 border-cyan-300",
    iconEmoji: "⛅",
    words: [
      { word: "Hujan", emoji: "🌧️" },
      { word: "Cerah", emoji: "☀️" },
      { word: "Salju", emoji: "❄️" },
      { word: "Mendung", emoji: "☁️" },
      { word: "Berangin", emoji: "🌬️" },
      { word: "Gugur", emoji: "🍂" },
    ],
  },
];

/**
 * Seeds all default vocabulary for a newly registered user.
 * Should only be called once per user when seeded = false.
 */
export async function seedUserVocabulary(userId: number) {
  for (let catIndex = 0; catIndex < DEFAULT_VOCABULARY.length; catIndex++) {
    const cat = DEFAULT_VOCABULARY[catIndex];

    const [insertedCat] = await db
      .insert(categories)
      .values({
        userId,
        label: cat.label,
        iconEmoji: cat.iconEmoji,
        bgColorClass: cat.bgColorClass,
        sortOrder: catIndex,
      })
      .returning();

    const cardValues = cat.words.map((w, cardIndex) => ({
      categoryId: insertedCat.id,
      word: w.word,
      emoji: "emoji" in w ? w.emoji : null,
      imageUrl: "imageUrl" in w ? w.imageUrl : null,
      sortOrder: cardIndex,
    }));

    if (cardValues.length > 0) {
      await db.insert(vocabularyCards).values(cardValues);
    }
  }
}
