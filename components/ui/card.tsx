// components/ui/card.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-lg", // Updated: rounded-xl, shadow-lg
      // backdrop-blur-sm can be added if bg-card has transparency and a blurred background is desired
      // e.g., "bg-card/80 backdrop-blur-sm" if --card is solid and you want to apply opacity here
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6", // Standard padding
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement, // Should be HTMLHeadingElement for semantic correctness (h1-h6)
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  // Changed to h3 for semantics, adjust as needed for your document outline
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-foreground", // Using text-foreground directly for titles
      // Or keep text-card-foreground if it's distinct and preferred for card titles
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground", // This is good
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "p-6 pt-0", // Standard padding, pt-0 if following a header
      className
    )}
    {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0", // Standard padding, pt-0 if following content that has bottom padding
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }