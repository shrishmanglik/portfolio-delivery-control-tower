import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/cn";

const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55", {
  variants: {
    variant: {
      primary: "bg-slate-900 text-white hover:bg-slate-700",
      operational: "bg-teal-700 text-white hover:bg-teal-800",
      secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
      ghost: "text-slate-700 hover:bg-slate-100",
    },
  },
  defaultVariants: { variant: "primary" },
});

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }

export function Button({ asChild, className, variant, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant }), className)} {...props} />;
}
