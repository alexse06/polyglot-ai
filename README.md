# 🌍 Polyglot AI - Next-Gen Language Learning Platform

> **"The future of language learning is not just about words, but understanding meaning in context."**

Polyglot AI is an advanced, open-source language learning application built with **Next.js 16**, **TypeScript**, and **Google Gemini 2.5**. It moves beyond static lessons by offering dynamic, AI-generated roleplay scenarios, real-time pronunciation coaching, and infinite content scaling for any supported language.

![Status](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features Overview

### 🧠 1. AI-Powered Immersion
*   **Dynamic Roleplay Scenarios**: Engage in realistic conversations (e.g., "Ordering Coffee in Paris", "Job Interview in Tokyo"). The AI acts as your conversation partner, adjusting difficulty based on your level.
*   **Contextual Feedback**: Receive instant corrections on grammar, vocabulary, and cultural appropriateness.
*   **"Click-to-Translate"**: Instantly translate any word or sentence in chat/scenarios by clicking on it, powered by context-aware AI.

### 🗣️ 2. Audio & Pronunciation
*   **Native-Grade TTS**: Utilizing Google's advanced Text-to-Speech models for natural-sounding audio in all supported languages.
*   **Pronunciation Coach**: Record your voice and get a score (0-100) with specific feedback on phonemes and intonation.
*   **Listening Mode**: Listen to entire conversations before responding.

### 🌏 3. Universal Language Support
*   **Multi-Language Architecture**: Built from the ground up to support *any* language.
*   **Non-Latin Script Support**: Native support (with Romanization/Transliteration) for:
    *   🇯🇵 Japanese (Kanji/Kana + Romaji)
    *   🇨🇳 Chinese (Hanzi + Pinyin)
    *   🇷🇺 Russian (Cyrillic)
    *   🇰🇷 Korean (Hangul)
    *   ...and classic European languages (ES, FR, DE, IT, PT).
*   **Character Learning Module**: Dedicated visuals for learning alphabets and syllabaries.

### 🎮 4. Gamification & Progression
*   **XP System**: Earn experience points for every meaningful interaction.
*   **Daily Quests**: Randomly generated challenges (e.g., "Send 5 messages", "Complete 1 Lesson") to keep you engaged.
*   **Streaks**: Track your daily consistency.
*   **Spaced Repetition Flashcards**: The system automatically creates flashcards from your mistakes and lesson content.

---

## 🏗️ Technical Architecture

This project utilizes a modern, robust stack designed for performance and scalability.

### Core Stack
*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions)
*   **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
*   **Database**: [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/)) for portability and ease of setup.
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a custom dark-mode aesthetic.
*   **Animation**: `framer-motion` & `canvas-confetti`.

### AI & Services
*   **LLM**: Google Gemini 2.5 Flash (via `@google/generative-ai`).
*   **I18n**: `next-intl` for comprehensive interface localization.
*   **PWA**: Fully installable Progressive Web App (via `@ducanh2912/next-pwa`).

### Directory Structure
```
├── app/[locale]/       # Localized App Router pages
│   ├── learn/          # Lesson Logic
│   ├── scenarios/      # AI Roleplay Logic
│   ├── characters/     # Script Learning Logic
│   └── dashboard/      # User Hub
├── components/         # Reusable UI (Atomic design)
├── lib/                # Core Business Logic
│   ├── gemini.ts       # AI Integration
│   ├── db.ts           # Database Singleton
│   └── progress.ts     # XP/Leveling Math
├── prisma/             # Database Schema & Migrations
└── messages/           # Localization JSONs (en, es, fr)
```

---

## � Getting Started

Follow these steps to set up your own instance of Polyglot AI.

### Prerequisites
*   Node.js 18.17+ or later
*   npm (v9+) or yarn

### 1. Installation
Clone the repository:
```bash
git clone https://github.com/alexse06/polyglot-ai.git
cd polyglot-ai
```

Install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory. You **must** provide a Gemini API Key.

```env
# Database (SQLite file)
DATABASE_URL="file:./dev.db"

# Google Gemini AI (Get free key at aistudio.google.com)
GEMINI_API_KEY="AIzaSy..."

# Security (For NextAuth/JWT)
NEXTAUTH_SECRET="change_this_to_random_string"
```

### 3. Database Initialization
Push the schema to your local SQLite database:

```bash
npx prisma db push
```

(Optional) Seed initial data:
```bash
npx prisma db seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start learning!

---

## 🤝 Contributing

We welcome contributions! Here is how you can help:

1.  **Add a Language**: Update `lib/languageConfig.ts` and add a flag to `messages/`.
2.  **New Scenarios**: Edit `prisma/seed.ts` to add base scenarios.
3.  **Bug Fixes**: Submit a Pull Request.

**Note on Code Style**:
*   Use standard Next.js conventions.
*   Ensure all new text is wrapped in `t()` calls for i18n support.
*   Run `npm run lint` before committing.

---

## 📜 License

This project is licensed under the **MIT License** - see the `LICENSE` file for details.

---

*Built with ❤️ by pure algorithmic intelligence.*
