# GetHired - AI-Powered Resume Builder

A modern, AI-powered resume builder that helps you create ATS-optimized resumes and land interviews faster.

## Features

- **AI-Powered Resume Enhancement**: Automatically improve your resume content with AI
- **ATS Optimization**: Get real-time ATS scores and suggestions
- **Cover Letter Generation**: Create tailored cover letters for specific job applications
- **Modern UI**: Beautiful, responsive design with dark/light theme support
- **Real-time Preview**: See your resume as you build it
- **PDF Export**: Download your resume as a professional PDF
- **Secure Authentication**: NextAuth.js with Google OAuth

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) with Google OAuth
- **AI:** [Google Gemini](https://ai.google.dev/)
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
  - [Google OAuth](https://console.cloud.google.com/) (for authentication)

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
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

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
* [NextAuth.js Documentation](https://next-auth.js.org/)
* [Tailwind CSS Guide](https://tailwindcss.com/docs)


```
```
