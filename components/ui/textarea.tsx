// components/ui/textarea.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm text-foreground", // Core structure
          "border-input",                      // Uses var(--input) for border color via tailwind.config
          "placeholder:text-muted-foreground", // Uses var(--muted-foreground)
          "ring-offset-background",            // Uses var(--background) for ring offset
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring", // Uses var(--ring) for ring & border
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }