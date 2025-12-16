# 🌍 Polyglot AI - Next-Gen Language Tutor

**Polyglot AI** is a cutting-edge language learning platform that adapts to **your native language** and helps you master **any target language**. Powered by **Google Gemini Multimodal Live API**, it offers real-time voice conversations, personalized daily podcasts, and immersive roleplay scenarios.

![App Icon](/public/polyglot-icon.png)

## 🚀 Key Features

### 🗣️ Universal Live Coach (Gemini 2.5 Flash)
- **Real-time Voice**: Ultra-low latency interaction using WebSocket technology.
- **Dynamic Personas**:
  - **Tutor**: Patient, structured learning.
  - **Barista**: Immersive, slang-heavy daily situations.
  - **Doctor**: Specific professional terminology.
- **🔥 Immersion Mode**: Force the AI to speak ONLY in the target language.
- **Visual Feedback**: Real-time audio visualization.

### 🎧 Daily AI Podcast
- **News Briefing**: Generates a 2-minute daily news summary (based on BBC World News).
- **Localized**: Translated and simplified for your learning level (A2/B1).
- **TTS**: High-quality neural voice narration.

### 📱 Progressive Web App (PWA)
- **Installable**: Add to home screen on Android (Chrome) and iOS (Safari).
- **Native Feel**: Fullscreen leverage, no browser UI.
- **Offline Ready**: Service Worker caching for core assets.

### 🔐 Secure Authentication
- **NextAuth v5**: Industry-standard security.
- **Multi-Provider**: Sign in with **Google** or Email/Password.
- **Smart Linking**: Automatically links accounts with the same email.

### 🎮 Gamified Learning
- **XP & Streaks**: Daily engagement tracking.
- **CEFR Levels**: From A1 to C2.
- **Mission Scenarios**: "Order a Coffee", "Job Interview", "Train Station".

## 🗺️ Sitemap

| Route | Feature | Description |
|-------|---------|-------------|
| **`/`** | Landing | Public showcase & CTA. |
| **`/dashboard`** | **Hub** | Access to all modules, visible progress. |
| **`/live`** | **Voice** | Real-time conversation with Gemini. |
| **`/chat`** | Text | Free-form chat practice. |
| **`/scenarios`** | Roleplay | Specific objective-based missions. |
| **`/career`** | Career | Job interview simulator. |
| **`/pronounce`** | Vocal | Pronunciation analysis. |
| **`/profile`** | Settings | Progress history and language preferences. |

---

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Auth**: [NextAuth.js v5](https://authjs.dev/)
- **UI**: [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/)
- **AI**: [Google Generative AI](https://ai.google.dev/) (Multimodal Live API)
- **Database**: [Prisma](https://www.prisma.io/) (SQLite / PostgreSQL ready)
- **i18n**: [next-intl](https://next-intl-docs.vercel.app/)

---

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** 20+
- **Google Cloud Project** (for OAuth & Gemini API)

### 1. Install
```bash
git clone https://github.com/your-username/polyglot-ai.git
cd polyglot-ai
npm install
```

### 2. Environment (`.env`)
```env
# Database
DATABASE_URL="file:./dev.db"

# Google AI
GEMINI_API_KEY="your_gemini_api_key"

# NextAuth
AUTH_SECRET="generated_via_openssl_rand"
AUTH_URL="http://localhost:3000" # or your_domain in prod
AUTH_TRUST_HOST=true

# Google OAuth
GOOGLE_CLIENT_ID="your_client_id"
GOOGLE_CLIENT_SECRET="your_client_secret"
```

### 3. Initialize
```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📜 License
MIT.

