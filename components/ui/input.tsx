import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full rounded-lg text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-input bg-transparent px-3 py-2.5 text-foreground",
        inverted:
          "border-[var(--surface-inverted-border)] bg-[var(--surface-inverted-elevated)] px-3 py-2.5 text-[var(--surface-inverted-foreground)] placeholder:text-[var(--surface-inverted-subtle)]",
      },
      inputSize: {
        default: "h-10",
        sm: "h-8 text-xs px-2.5 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

function Input({
  className,
  variant,
  inputSize,
  type = "text",
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(inputVariants({ variant, inputSize, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
