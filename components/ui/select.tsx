// components/ui/select.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground", // Core structure
          "border-input",                      // Uses var(--input) for border color via tailwind.config
          // Note: Native select elements don't have a traditional "placeholder". The first <option> often serves this role.
          // No direct placeholder class needed here unless you are building a custom select.
          "ring-offset-background",            // Uses var(--background) for ring offset
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring", // Uses var(--ring) for ring & border
          "disabled:cursor-not-allowed disabled:opacity-50",
          // To add a custom arrow and hide the default, you might add:
          // "appearance-none bg-no-repeat bg-right", 
          // And then use a background-image for the arrow, or an SVG icon.
          // For now, we keep the native arrow.
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    )
  }
)
Select.displayName = "Select"

export { Select }