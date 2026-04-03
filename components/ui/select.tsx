import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const selectVariants = cva(
  "rounded-lg text-xs outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border border-input bg-transparent px-3 py-1.5 text-foreground",
        inverted:
          "border-[var(--surface-inverted-border)] bg-[var(--surface-inverted-elevated)] px-3 py-1.5 text-[var(--surface-inverted-foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Select({
  className,
  variant,
  ...props
}: React.ComponentProps<"select"> &
  VariantProps<typeof selectVariants>) {
  return (
    <select
      data-slot="select"
      className={cn(selectVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Select, selectVariants }
