// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes';
import { ThemeProvider } from '@/context/theme-provider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ResumeAI Pro - AI-Powered Resume Builder',
  description: 'Build ATS-optimized resumes with AI assistance. Land interviews 3x faster with ResumeAI Pro.',
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
          colorPrimary: '#6366F1',
          colorBackground: '#111827',
          colorInputBackground: '#1F2937',
          colorInputText: '#F3F4F6',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-gray-800 border-gray-700 shadow-2xl',
          formButtonPrimary: 'bg-gradient-to-r from-theme-blue-600 to-theme-purple-600 hover:opacity-90',
          footerActionLink: 'text-purple-400 hover:text-purple-300'
        }
      }}
    >
      {/* Ensure NO WHITESPACE directly inside <html> before <body> */}
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} antialiased`}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}