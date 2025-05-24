import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"], // This is crucial for the theme toggle
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          // DEFAULT: "hsl(var(--primary))", // We'll use gradient for buttons
          DEFAULT: "transparent", // Placeholder, primary buttons will be gradients
          foreground: "hsl(var(--primary-text))", 
        },
        secondary: {
          DEFAULT: "hsl(var(--muted))", // Using muted for secondary bg
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Direct colors from your new landing page for gradients/specifics
        'theme-blue-600': '#2563EB',
        'theme-purple-600': '#7C3AED',
        'theme-blue-400': '#60A5FA',
        'theme-purple-400': '#A78BFA',
        'theme-pink-400': '#F472B6', // From landing page text gradient
      },
      borderRadius: {
        lg: "var(--radius)", // 0.75rem
        md: "calc(var(--radius) - 2px)", // 0.625rem
        sm: "calc(var(--radius) - 4px)", // 0.5rem
        xl: "calc(var(--radius) + 4px)", // 1rem (as seen in landing page buttons)
        '2xl': "calc(var(--radius) + 8px)", // 1.25rem
        '3xl': "calc(var(--radius) + 16px)", // 1.75rem (as seen in landing page sections)
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
}

export default config