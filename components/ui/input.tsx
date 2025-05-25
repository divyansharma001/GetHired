// components/ui/input.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground", // Core structure
          "border-input",                      // Uses var(--input) for border color via tailwind.config
          "placeholder:text-muted-foreground", // Uses var(--muted-foreground)
          "ring-offset-background",            // Uses var(--background) for ring offset
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring", // Uses var(--ring) for ring & border
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }