# AAC by Star Champs Indonesia

> Alat Komunikasi Augmentatif dan Alternatif (AAC) berbasis Web untuk anak-anak dengan hambatan komunikasi verbal.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 + Nunito Font |
| Database | Neon Serverless PostgreSQL + Drizzle ORM |
| Media Storage | Vercel Blob |
| Authentication | Auth.js v5 (Credentials) |
| Hosting | Vercel |
| Audio | Web Speech API (client-side) |

## Features

- **Papan Komunikasi (Kid Mode)** — full-screen AAC board with sentence builder, category tabs, and vocab cards
- **Suara** — TTS via Web Speech API with pitch/speed controls, Indonesian voice priority, custom pronunciation overrides
- **Mode Anak (Kid Mode Lock)** — full-screen lock with long-press 2s + 4-digit PIN to exit
- **Admin Dashboard** — CRUD for categories and vocabulary cards
- **Upload Gambar** — drag-and-drop photo upload to Vercel Blob
- **PWA** — installable to homescreen with fullscreen manifest

## Setup

### 1. Copy environment variables

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` — Neon pooled connection string
- `DATABASE_URL_UNPOOLED` — Neon direct connection (for migrations)
- `BLOB_READ_WRITE_TOKEN` — from Vercel Blob dashboard
- `AUTH_SECRET` — generate with `openssl rand -hex 32`

### 2. Install dependencies

```bash
npm install
```

### 3. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, and all default vocabulary will be seeded automatically.

## Database Schema

```
users            → email/password accounts for parents/therapists
app_settings     → per-user TTS pitch, speed, PIN code
categories       → vocabulary categories (Frasa, Makanan, Binatang, etc.)
vocabulary_cards → individual cards with word, emoji, or Blob image URL
```

## Deployment to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Vercel will run `npm run vercel-build` which runs migrations then builds

## Routes

| Route | Description |
|---|---|
| `/login` | Login page |
| `/register` | Register page |
| `/dashboard` | Admin overview |
| `/dashboard/categories` | Category management |
| `/dashboard/categories/[id]` | Card management per category |
| `/dashboard/settings` | TTS, PIN settings |
| `/board` | Kid Mode communication board |
