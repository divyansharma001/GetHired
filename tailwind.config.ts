import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"], // This is crucial for the theme toggle
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}', // Ensure this covers all your component locations
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
        // Theme-aware semantic colors using CSS variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))", // For input borders specifically
        ring: "hsl(var(--ring))", // For focus rings

        // Inside theme.extend.colors in tailwind.config.ts
inputField: { // Renamed from just "input" to avoid conflict with the existing "input" for border
  DEFAULT: "hsl(var(--input-bg))",      // For background of input
  border: "hsl(var(--input-border))", // Specific border for input field
  foreground: "hsl(var(--foreground))", // Text color within input
},

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        primary: {
          // DEFAULT: "hsl(var(--primary-gradient-start))", // Or make it transparent if always using gradient
          DEFAULT: "hsl(var(--primary-gradient-end))", // Using the end color as a default solid
          foreground: "hsl(var(--primary-text))", // Text on primary elements
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

        // Retain specific theme colors if absolutely needed for non-semantic direct use,
        // but prefer using the semantic names above.
        // 'theme-blue-600': '#2563EB', // This is now var(--primary-gradient-start) conceptually
        // 'theme-purple-600': '#7C3AED',// This is now var(--primary-gradient-end) conceptually
        // 'theme-blue-400': '#60A5FA',
        // 'theme-purple-400': '#A78BFA',
        // 'theme-pink-400': '#F472B6',
      },
      borderRadius: {
        // Your existing radius setup is good.
        // It correctly uses a CSS variable for the base radius.
        lg: "var(--radius)", // e.g., 0.75rem
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        '2xl': "calc(var(--radius) + 8px)",
        '3xl': "calc(var(--radius) + 16px)",
      },
      backgroundImage: {
        // Define the primary gradient using the CSS variables
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
        // You can add other global keyframes from landing page here if they are widely used
        // Example:
        // "gradient-x": { /* ... from landing page style jsx block ... */ },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // "gradient-x": "gradient-x 3s ease infinite", // if keyframe added above
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
}

export default config