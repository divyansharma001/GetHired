// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'; // Clerk's dark base theme
import { ThemeProvider } from '@/context/theme-provider';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GetHired - AI-Powered Resume Builder',
  description: 'Build ATS-optimized resumes with AI assistance. Land interviews 3x faster with GetHired.',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark, // Start with Clerk's dark theme as a base
        variables: {
          // Referencing our CSS variables (conceptually) or picking similar values.
          // Clerk variables don't directly consume CSS vars, so we pick values that match.
          colorPrimary: 'hsl(262 83% 58%)', // Purple-600 (from our --primary-gradient-end, or a primary accent)
          colorBackground: 'hsl(220 15% 12%)', /* Matches our dark --card or --muted, e.g., neutral-900 */
          colorInputBackground: 'hsl(220 15% 18%)', /* Darker input, e.g., neutral-800ish */
          colorInputText: 'hsl(210 20% 98%)', /* Matches --foreground */
          colorText: 'hsl(210 20% 98%)', /* General text on Clerk components */
          borderRadius: 'var(--radius)', // Use our global radius variable string
          // You can add more variables here: colorDanger, colorSuccess, etc.
        },
        elements: {
          // For these, we use Tailwind classes that will respect our theme
          // Ensure these classes get compiled by Tailwind by being used somewhere or safelisted
          rootBox: 'font-sans', // Ensure Clerk components use the Inter font
          card: 'bg-card border border-border shadow-xl rounded-xl', // Uses our themed card styles
          formButtonPrimary:
            'bg-primary-gradient text-primary-foreground hover:opacity-90 transition-opacity rounded-lg text-sm py-2.5 px-4', // Use the gradient
          formFieldInput:
            'bg-input border border-input text-foreground placeholder:text-muted-foreground rounded-md focus:ring-ring focus:border-ring', // Themed input fields
          footerActionLink: 'text-primary hover:opacity-80', // Use primary color for links
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'border-border hover:bg-accent',
          dividerLine: 'bg-border',
          formFieldLabel: 'text-foreground',
          // Add more element customizations as needed
        }
      }}
    >
      {/* Ensure NO WHITESPACE directly inside <html> before <body> */}
      <html lang="en" suppressHydrationWarning>
        {/* The 'dark' class will be toggled on <html> by ThemeProvider */}
        <body className={`${inter.className} antialiased`}> {/* Body styles are in globals.css */}
          <ThemeProvider> {/* ThemeProvider should be inside <body> but outside ClerkProvider if Clerk's theme shouldn't change with your app's theme. Or inside if it should. Generally, keeping Clerk's theme stable (e.g., always dark) while your app theme toggles is fine. If you want Clerk to toggle too, place ThemeProvider outside ClerkProvider. For now, your setup is fine. */}
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}