# 🧪 DecisionLab — 3D Math Games Platform

An interactive educational platform where students learn math through immersive 3D games. Built with React, Three.js, and Supabase.

## ✨ Features

- **7 Immersive 3D Math Games** — Coordinates, Factors, Sequences, Probability, Permutations, Combinations, and Racing challenges
- **Daily Login Streaks** — Fire-animated streak tracker with multiplier tiers (1.1x → 2.0x) that boost game scores
- **Rewards Shop** — Spend earned points on avatars, themes, badges, and power-ups across 4 rarity tiers
- **Real-Time Leaderboard** — Compete with other students globally
- **Achievements System** — Unlock badges and milestones as you progress
- **Profile & Stats** — Track gameplay statistics, sessions, and download reports
- **Admin Portal** — Researcher/admin dashboard for monitoring student activity
- **Google & Email Auth** — Secure authentication via Supabase Auth

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **3D Graphics:** Three.js, React Three Fiber, Drei
- **UI Components:** shadcn/ui, Radix UI, Framer Motion
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions)
- **State:** TanStack React Query

## 🚀 Getting Started

```sh
# Clone the repo
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start dev server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/       # Reusable UI & 3D components
│   ├── 2d/           # 2D game visuals
│   ├── 3d/           # Three.js 3D game worlds
│   └── ui/           # shadcn/ui components
├── contexts/         # Auth context provider
├── data/             # Game configuration data
├── hooks/            # Custom hooks (streak multiplier, etc.)
├── pages/            # Route pages (Dashboard, Games, Shop, etc.)
├── types/            # TypeScript type definitions
└── integrations/     # Supabase client & types
```

## 📄 License

Built with [Lovable](https://lovable.dev).
