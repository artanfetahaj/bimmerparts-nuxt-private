import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Badge } from "./Badge.vue"

export const badgeVariants = cva(
  "inline-flex gap-1 items-center rounded-md border px-4 py-0.5 text-base md:text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 h-8 md:h-11",
  {
    variants: {
      variant: {
        default:
          "transition-colors bg-green text-dark-purple font-comma text-sm rounded-md-none",
        orange: "bg-orange text-white font-comma border-orange",
        "dark-purple-outline":
          "border-dark-purple bg-transparent text-dark-purple font-comma border-2",
        "white-outline":
          "border-white bg-transparent text-white font-comma border-2",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
