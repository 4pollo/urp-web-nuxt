import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

export const inputGroupAddonVariants = cva(
  "flex items-center px-3 text-sm border-r border-input bg-muted text-muted-foreground",
  {
    variants: {
      variant: {
        default: "",
      },
      align: {
        "inline-start": "",
        "inline-end": "",
      },
    },
    defaultVariants: {
      variant: "default",
      align: "inline-start",
    },
  },
)

export const inputGroupButtonVariants = cva(
  "flex items-center px-3 text-sm",
  {
    variants: {
      variant: {
        default: "",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        xs: "h-7 text-xs",
        sm: "h-8 text-sm",
        md: "h-9 text-base",
        lg: "h-10 text-lg",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "xs",
    },
  },
)

export type InputGroupVariants = VariantProps<typeof inputGroupAddonVariants>
export type InputGroupAddonProps = VariantProps<typeof inputGroupAddonVariants>
export type InputGroupButtonProps = VariantProps<typeof inputGroupButtonVariants>
