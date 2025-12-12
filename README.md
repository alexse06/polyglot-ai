# 🌍 Polyglot AI - Language Learning App

An AI-powered language learning application allowing users to learn Spanish, French, German, Italian, Portuguese, Japanese, and Chinese through interactive chat scenarios, flashcards, and pronunciation coaching.

## ✨ Features
*   **AI Chat & Roleplay**: Practice real conversations with context-aware AI personalities.
*   **Smart Scenarios**: Roleplay missions (e.g., "Ordering Coffee", "Job Interview").
*   **Pronunciation Coach**: Receive real-time feedback on your speech.
*   **Dynamic Flashcards**: Learn vocabulary generated from your mistakes/lessons.
*   **Gamification**: Earn XP, maintain streaks, and complete daily quests.
*   **Multi-language Support**: Switch learning languages instantly (includes non-Latin scripts like Japanese/Chinese).

## 🛠️ Prerequisites
*   Node.js 18+
*   npm or yarn

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/alexse06/polyglot-ai.git
cd polyglot-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. You need a **Gemini API Key** (from Google AI Studio).

```env
# Database (SQLite default)
DATABASE_URL="file:./dev.db"

# AI Service (Required)
GEMINI_API_KEY="your_api_key_here"

# App Security (Random string)
NEXTAUTH_SECRET="super_secret_random_string_123"
```

### 4. Database Setup
Initialize the SQLite database and run migrations.

```bash
# Push schema to database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### 5. Running the App

**Development Mode:**
```bash
npm run dev
# Open http://localhost:3000
```

**Production Mode:**
```bash
npm run build
npm start
# Open http://localhost:3000
```

## 📂 Project Structure
*   `app/[locale]`: Next.js App Router pages (localized).
*   `components`: Reusable UI components.
*   `lib`: Core logic (Gemini AI, Database, Progress tracking).
*   `prisma`: Database schema and migrations.
*   `messages`: JSON localization files (en, fr, es).

## 🆘 Troubleshooting
*   **502 Error**: Run `npm run build` again.
*   **Database Error**: Run `npx prisma generate` to update the client.
*   **No Audio**: Ensure browser permissions for Microphone are allowed.

---
Built with ❤️ by Polyglot AI Team.
