# 🌍 Polyglot AI - Next-Gen Language Tutor

**Polyglot AI** is an advanced, AI-powered language learning platform capable of teaching **any language** to **any speaker**. Powered by **Google Gemini Multimodal Live API**, it offers real-time voice conversations, immersive roleplay scenarios, and gamified progression.

![Live Coach Preview](/favicon.ico) *Note: Replace with actual screenshot*

## 🚀 Key Features

### 🗣️ Universal Live Coach (Powered by Gemini 2.5 Flash)
- **Model**: Uses the latest `gemini-2.5-flash-native-audio-preview-12-2025` for ultra-low latency multimodal interaction.
- **Audio Stability**: Custom WebSocket buffering mechanism (~250ms chunks) prevents connection flooding and ensures fluid drops-free audio.
- **Universal Language Support**: 
  - **Source Agnostic**: The interface adapts to your native language (English, French, Spanish).
  - **Target Limitless**: Learn *any* language (Russian, Japanese, German, etc.). The AI adapts its persona and teaching style dynamically.
- **🔥 Immersion Mode**: Toggle "Immersion" to force the AI to speak **ONLY** in the target language (no native explanations) for advanced practice.
- **Dynamic Personas**: Choose your partner:
  - **Tutor**: Patient, explains grammar, translates (unless in Immersion mode).
  - **Barista**: Fast-paced, slang-heavy, immersive ordering scenarios.
  - **Doctor**: Professional, precise medical terminology.
- **Visual Feedback**: Real-time audio visualization (circular waveform) and "Target Language" badges.

### 🎮 Gamified Learning
- **XP & Streaks**: Earn experience points for every interaction. Maintain your daily streak.
- **CEFR Levels**: track your progress from A1 to C2 based on conversation complexity.
- **Mission Scenarios**: Complete specific objectives (e.g., "Order a coffee", "Job Interview").

### 🛠️ Modern Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Prisma](https://www.prisma.io/) (SQLite for easy dev/deployment)
- **AI**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (Multimodal Live API)
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)

---

## 💻 How to Duplicate / Install

Follow these steps to set up your own instance of Polyglot AI.

### Prerequisites
- **Node.js** 18+ (Recommended: 20 LTS)
- **Google Gemini API Key** (Get one at [Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Install
```bash
git clone https://github.com/your-username/polyglot-ai.git
cd polyglot-ai
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database (SQLite default)
DATABASE_URL="file:./dev.db"

# Google AI (Required for Live Coach)
GEMINI_API_KEY="your_gemini_api_key_here"

# Authentication (Random string)
JWT_SECRET="complex_random_string_here"
```

### 3. Database Setup
Initialize the SQLite database and generate Prisma client:
```bash
npx prisma db push
```

### 4. Run Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Advanced Configuration

### Adding New UI Languages
To translate the **Interface** (Menus, Buttons) to a new language (e.g., Italian):
1. Create `messages/it.json` (Copy structure from `en.json`).
2. Update `i18n.ts`: Add `'it'` to `locales` array.
3. Update `middleware.ts`: Add `'it'` to `locales`.

*Note: The **Live Coach** supports teaching any language automatically, even if the UI is not translated.*

### Troubleshooting Live Audio
- **"WebSocket Closed Code 1000"**: This usually means the client sent audio data too fast. The built-in `useLiveAPI` hook includes a buffer (4096 samples) to prevent this. Ensure your network is stable.
- **Voice Stuttering**: Toggle **Immersion Mode** ON/OFF. Sometimes switching personas refreshes the session context.

---

## 📜 License
MIT License. Feel free to fork and learn!
