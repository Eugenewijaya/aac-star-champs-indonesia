import {
  pgTable,
  text,
  integer,
  real,
  timestamp,
  serial,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name"),
    role: text("role").notNull().default("admin"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

// ─── App Settings ────────────────────────────────────────────────────────────
export const appSettings = pgTable("app_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  pinCode: text("pin_code").notNull().default("1234"),
  ttsPitch: real("tts_pitch").notNull().default(1.1),
  ttsSpeed: real("tts_speed").notNull().default(0.75),
  ttsLang: text("tts_lang").notNull().default("id-ID"),
  // JSON string of { word: spokenText } pairs
  pronunciationMap: text("pronunciation_map")
    .notNull()
    .default('{"bluberi":"blu beh ri","sup":"suup","stroberi":"stro beh ri","melon":"mélon"}'),
  seeded: boolean("seeded").notNull().default(false),
});

// ─── Categories ──────────────────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  iconEmoji: text("icon_emoji").notNull().default("📂"),
  bgColorClass: text("bg_color_class").notNull().default("bg-slate-100 border-slate-300"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Vocabulary Cards ─────────────────────────────────────────────────────────
export const vocabularyCards = pgTable("vocabulary_cards", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  imageUrl: text("image_url"),   // Vercel Blob URL or external URL
  emoji: text("emoji"),           // fallback when no image
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ one, many }) => ({
  settings: one(appSettings, {
    fields: [users.id],
    references: [appSettings.userId],
  }),
  categories: many(categories),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  cards: many(vocabularyCards),
}));

export const vocabularyCardsRelations = relations(vocabularyCards, ({ one }) => ({
  category: one(categories, {
    fields: [vocabularyCards.categoryId],
    references: [categories.id],
  }),
}));

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AppSettings = typeof appSettings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type VocabularyCard = typeof vocabularyCards.$inferSelect;
export type NewVocabularyCard = typeof vocabularyCards.$inferInsert;
