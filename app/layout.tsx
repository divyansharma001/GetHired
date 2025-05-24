// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ResumeAI - AI-Powered Resume Builder',
  description: 'Transform your career story with our intelligent resume builder. Get real-time ATS scoring, AI-enhanced content, and professional templates.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#8b5cf6',
          colorBackground: '#0f172a',
          colorInputBackground: '#1e293b',
          colorInputText: '#f1f5f9',
        },
      }}
    >
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-slate-900 text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
