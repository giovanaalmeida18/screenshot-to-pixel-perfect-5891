import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-ink-soft",
        cta: "bg-brand-orange text-ink shadow-soft hover:bg-brand-yellow",
        sun: "bg-brand-yellow text-ink shadow-soft hover:bg-brand-orange",
        light: "bg-background text-primary shadow-soft hover:bg-surface-blue",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border-2 border-primary bg-background text-primary hover:bg-surface-blue",
        "outline-light":
          "border-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-surface-teal",
        ghost: "text-foreground hover:bg-surface-blue hover:text-primary",
        link: "text-primary underline underline-offset-4 hover:text-ink-soft",
      },
      size: {
        default: "h-11 px-5 text-base",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-13 px-7 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
