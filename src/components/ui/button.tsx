import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm shadow-primary/20 hover:shadow-primary/30 rounded-lg",
        destructive: "bg-destructive text-white hover:bg-destructive/90 rounded-lg shadow-sm",
        outline: "border border-border bg-background hover:bg-muted hover:border-border rounded-lg",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg",
        ghost: "hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        // New variants
        filled: "bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg",
        tonal: "bg-primary/10 text-primary hover:bg-primary/20 rounded-lg",
        outlined: "border border-primary text-primary hover:bg-primary/5 rounded-lg",
        text: "text-primary hover:bg-primary/5 rounded-lg",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        xl: "h-12 px-6 text-base",
        icon: "w-9 h-9",
        "icon-sm": "w-8 h-8",
        "icon-lg": "w-10 h-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
