# YoliNews AI 📰✨

Welcome to **YoliNews AI**, a modern, intelligent news aggregator built with Next.js. This application fetches the top headlines from major global news sources natively via RSS feeds and uses Artificial Intelligence to analyze, summarize, and rank them, providing you with a clean, multilingual, and insightful reading experience.

![YoliNews AI Overview](https://arongaldon.github.io/yolinewsai/) *Replace with actual screenshot if available*

## 🌟 Features

- **AI-Powered Analysis**: Uses OpenAI (GPT-4o-mini) to automatically generate a daily news summary, identify the 3-5 most critical global events, and evaluate the political bias (Left/Center/Right) of each article.
- **Smart Deduplication**: The AI detects stories covering the exact same event and groups them, saving you from reading repetitive headlines.
- **Personalized Feed (Implicit Feedback)**: The AI intelligently assigns categories and importance scores (1-10) to every article. You can dismiss topics you aren't interested in ("Show less like this"), which dynamically adjusts the local feed algorithm to filter out those categories in the future—unless a breaking news event hits exceptionally high global importance.
- **Advanced RSS Extraction**: Aggregates news natively from `AP News`, `NYT World`, `NPR`, and `BBC News`. It intelligently extracts relevant thumbnails and images even when feeds hide them in complex XML tags!
- **Multilingual Support & Auto-Translation**: Fully localized interface in English (`en`), Spanish (`es-ES`), Catalan (`ca`), German (`de`), Japanese (`ja`), and Simplified Chinese (`zh-CN`). The AI detects the original language of the source and **automatically translates titles and snippets** into your browser's preferred language, displaying the original language code natively.
- **Premium UI/UX Design**: Built with a stunning dark-mode glassmorphism aesthetic, subtle background parallax animations, dynamic gradients, and smooth card hover effects.
- **Paywall Detection**: Automatically flags articles that are likely hidden behind a paywall so you know before you click.
- **Performance Optimized**: Uses severe edge-caching to prevent hitting the OpenAI API excessively.

## 🚀 Getting Started Locally (Visual Studio Code)

To test and develop YoliNews AI on your local machine using Visual Studio Code, follow these steps:

### 1. Prerequisites

- Install **Node.js** (v18 or higher recommended).
- Get an **OpenAI API Key** from [platform.openai.com](https://platform.openai.com/).

### 2. Clone and Setup

1. Clone this repository and open the folder in **Visual Studio Code**.
2. Open the integrated terminal (`Ctrl + \``) and install the dependencies:

   ```bash
   npm install
   ```

### 3. Environment Variables

Create a file named `.env.local` in the root of the project and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-super-secret-key-here
```

*(If you do not provide a key, the app will gracefully fall back to a "Mock AI" mode with simulated data).*

### 4. Run the Development Server

You can start the server in two ways:

- **Terminal:** Run `npm run dev` in the VS Code terminal.
- **Run and Debug (Recommended):** Go to the Run and Debug tab in VS Code (the bug icon on the left), select **"Next.js: debug full stack"** from the top dropdown, and press play. This will launch the app and attach the debugger so you can set breakpoints in `src/app/api/news/route.ts` or any React component.

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🌍 Deploying to Production (GitHub + Vercel)

The easiest way to deploy this Next.js app to the world is using **Vercel**, the creators of Next.js.

### 1. Push to GitHub

1. Create a new repository on your GitHub account.
2. Push your local project to the GitHub repo:

   ```bash
   git add .
   git commit -m "Initial commit - YoliNews AI"
   git branch -M main
   git remote add origin https://github.com/yourusername/yolinewsai.git
   git push -u origin main
   ```

### 2. Connect to Vercel

1. Go to [Vercel.com](https://vercel.com/) and sign up/log in with your GitHub account.
2. Click **"Add New" > "Project"**.
3. Import your newly created `yolinewsai` repository from GitHub.
4. **Important Configuration:**
   - In the "Configure Project" screen, open the **Environment Variables** section.
   - Add a new variable:
     - **Key:** `OPENAI_API_KEY`
     - **Value:** `sk-your-super-secret-key-here`
5. Click **Deploy**.

Vercel will build your app and give you a live URL. Every time you push a new change to your `main` branch on GitHub, Vercel will automatically rebuild and update your live site!

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router)
- **Styling**: Vanilla CSS (Custom Design System, Variables, Keyframe Animations)
- **Language**: TypeScript
- **Parsing**: `rss-parser`
- **AI**: OpenAI `gpt-4o-mini` API

---

Created with ❤️ by Aron Galdon / YoliNews AI Team
