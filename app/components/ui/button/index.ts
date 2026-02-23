import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"

export { default as Button } from "./Button.vue"

export const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium font-inter transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-lg cursor-pointer rounded-full  active:translate-y-0 active:scale-[0.99]  [transform-style:preserve-3d]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow ",
        green: "bg-green text-purple",
        orange: "bg-orange text-dark-purple",
        purple: "bg-purple text-white",
        white: "bg-white text-dark-purple",
        "dark-purple": "bg-dark-purple text-green",
        "dark-purple-outline": "bg-transparent text-dark-purple border border-dark-purple gap-3 py-1 ",
        "dark-purple-arrow": "bg-dark-purple text-white  gap-3 py-1 ",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-white bg-transparent text-white hover:bg-white/10",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        "default": "h-9 px-4 py-2",
        "xs": "h-7 rounded px-2",
        "sm": "h-8 rounded-md px-3 text-xs",
        "md": "h-[55px] px-8",
        "lg": "h-[50px] text-sm md:text-lg px-4 md:h-[69px] md:px-8",
        "icon": "h-9 w-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
