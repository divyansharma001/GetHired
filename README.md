````markdown
# ResumeAI Pro

**AI-Powered, ATS-Optimized Resume Builder**

ResumeAI Pro combines the latest in AI with professional templates and real-time feedback to help you craft resumes that get noticed.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repo](#1-clone-the-repo)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Database Setup](#4-database-setup)
  - [5. Run the Dev Server](#5-run-the-dev-server)
- [Production Build](#production-build)
- [Linting](#linting)
- [Deployment](#deployment)
- [Resources](#resources)
- [License](#license)

---

## Features

- **AI-Powered Content Generation:** Summaries, experience bullets, project descriptions
- **Real-Time ATS Scoring & Feedback:** Ensure keyword optimization and formatting standards
- **Multi-Step Builder:** Guided form flow for personal info, experience, education, skills
- **Live Preview & PDF Export:** See changes instantly and download a print-ready PDF
- **User Dashboard:** Save, edit, and manage multiple resumes
- **Dark/Light Mode:** Switch themes to reduce eye strain

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **AI Engine:** Google Gemini
- **Auth:** Clerk
- **ORM:** Prisma (PostgreSQL)
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Forms & Validation:** React Hook Form + Zod

## Prerequisites

- Node.js v18+ and npm/yarn/pnpm
- Git
- Access to a PostgreSQL database
- API keys for:
  - Google Gemini
  - Clerk

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/resumeai-pro.git
cd resumeai-pro
````

### 2. Install Dependencies

```bash
# npm
npm install
# or yarn
yarn install
# or pnpm
pnpm install
```

### 3. Configure Environment

Create a `.env.local` file at the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
# (Optional) DIRECT_URL for pooling
# DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
```

> **Tip:** Keep your keys secure and never commit `.env.local` to version control.

### 4. Database Setup

```bash
# Generate and apply migrations
npx prisma migrate dev --name init
# (Optional) Preview in Prisma Studio
npx prisma studio
```

### 5. Run the Dev Server

```bash
npm run dev
# or yarn dev
# or pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
# or yarn build
# or pnpm build
```

This outputs an optimized build in the `.next` folder.

## Linting

```bash
npm run lint
# or yarn lint
# or pnpm lint
```

## Deployment

We recommend deploying on Vercel:

1. Push your code to GitHub
2. Import the repo in Vercel
3. Add environment variables in Vercel dashboard
4. Vercel will auto-run `npm run build` and deploy

*For other platforms, see [Next.js deployment docs](https://nextjs.org/docs/deployment).*

## Resources

* [Next.js Documentation](https://nextjs.org/docs)
* [Prisma Docs](https://www.prisma.io/docs)
* [Clerk Quickstart](https://clerk.com/docs)
* [Tailwind CSS Guide](https://tailwindcss.com/docs)


```
```
