# GetHired - AI-Powered, ATS-Optimized Resume Builder



**GetHired** leverages cutting-edge AI and professionally crafted templates, complemented by real-time feedback, to empower you in creating impactful resumes that capture attention.

---

## Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Set Up Database](#4-set-up-database)
  - [5. Run Development Server](#5-run-development-server)
- [Production Build](#production-build)
- [Code Linting](#code-linting)
- [Deployment](#deployment)
- [Resources](#resources)
- [License](#license)

---

## Key Features

- **Intelligent Content Generation:** AI-driven creation of compelling summaries, experience bullet points, and project descriptions.
- **Real-time ATS Optimization:** Instant scoring and feedback to ensure optimal keyword integration and formatting for Applicant Tracking Systems.
- **Guided Multi-Step Builder:** Intuitive form-based workflow for seamless input of personal details, work history, education, and skills.
- **Live Preview & PDF Export:** Immediate visual feedback on your resume design and the ability to download a print-ready PDF.
- **Personalized User Dashboard:** Securely save, edit, and manage multiple resume versions.
- **Customizable Interface:** Option for both light and dark mode to enhance user experience.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Engine:** [Google Gemini](https://ai.google.dev/)
- **Authentication:** [Clerk](https://clerk.com/)
- **ORM:** [Prisma](https://www.prisma.io/) ([PostgreSQL](https://www.postgresql.org/))
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/en/) v18 or higher, along with [npm](https://www.npmjs.com/), [yarn](https://yarnpkg.com/), or [pnpm](https://pnpm.io/).
- [Git](https://git-scm.com/).
- Access to a [PostgreSQL](https://www.postgresql.org/) database.
- API keys for:
  - [Google Gemini](https://ai.google.dev/)
  - [Clerk](https://clerk.com/)
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
