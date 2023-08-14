import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const titleVariants = cva("", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      pink: "text-pinkCust",
      violet: "text-violetCust",
      emerald: "text-emeraldCust",
      cyan: "text-cyanCust",
      amber: "text-amberCust",
    },
    size: {
      default: "font-bold text-3xl",
      sm: "text-lg",
      lg: "text-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface TitleProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof titleVariants> {}

const Title = ({
  className,
  variant,
  size,
  children,
  ...props
}: TitleProps) => {
  return (
    <h1 className={cn(titleVariants({ variant, size, className }))} {...props}>
      {children}
    </h1>
  );
};
Title.displayName = "Button";

export { Title, titleVariants };
