// components/ui/label.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-sm font-medium mb-1.5", // Base styling
        "text-foreground/90", // Use foreground color with slight opacity for subtlety
        // Alternatively, for a more distinct label color:
        // "text-muted-foreground",
        // Or if you define a specific label text color in your theme:
        // "text-label",
        className
      )}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }