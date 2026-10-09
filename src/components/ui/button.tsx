import * as React from 'react'
import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium outline-none transition-[color,background-color,box-shadow,transform] duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 neo-press [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[6px_6px_14px_var(--neo-dark),-4px_-4px_10px_var(--neo-light),inset_0_1px_0_rgb(255_255_255_/_0.16)] hover:brightness-110',
        lime: 'bg-lime text-white neo-convex hover:brightness-110',
        destructive: 'bg-destructive text-white neo-raised-sm hover:brightness-110 focus-visible:ring-destructive/30',
        outline: 'bg-card text-foreground neo-raised-sm hover:neo-convex',
        secondary: 'bg-secondary text-secondary-foreground neo-raised-sm hover:neo-convex',
        ghost: 'hover:neo-inset-sm hover:text-accent-foreground',
        link: 'text-foreground underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px] has-[>svg]:px-2.5',
        xs: 'h-7 gap-1 rounded-lg px-2.5 text-xs has-[>svg]:px-2',
        lg: 'h-11 rounded-2xl px-5 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
