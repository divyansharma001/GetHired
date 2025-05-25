// components/ui/progress.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number // Should be 0 to 100
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, ...props }, ref) => {
    const progressValue = Math.max(0, Math.min(100, value || 0)); // Ensure value is between 0 and 100

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-muted", // Use themed muted background for track, increased height
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 bg-primary-gradient transition-transform duration-300 ease-out" // Use primary gradient, refined transition
          )}
          style={{ transform: `translateX(-${100 - progressValue}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress"

export { Progress }