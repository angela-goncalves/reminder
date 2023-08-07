import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const accordionTriggerVariants = cva(
  "flex flex-1 items-center justify-between py-4 [&[data-state=open]>svg]:rotate-180",
  {
    variants: {
      variant: {
        default: "text-secundary",
        pink: "text-pinkCust",
        violet: "text-violetCust",
        emerald: "text-emeraldCust",
        cyan: "text-cyanCust",
        amber: "text-amberCust",
      },
      // size: {
      //   default: "px-4 h-8 w-8",
      //   sm: "h-8 rounded-md px-3 text-xs",
      //   lg: "h-10 rounded-md px-8",
      //   icon: "h-9 w-9",
      // },
    },
    defaultVariants: {
      variant: "default",
      // size: "default",
    },
  }
);

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>,
    VariantProps<typeof accordionTriggerVariants> {
  asChild?: boolean;
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, variant, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(accordionTriggerVariants({ variant, className }))}
        {...props}>
        {children}
        <ChevronDownIcon
          className={`shrink-0 transition-transform duration-200`}
          // className={cn(ChevronDownIconVariants({ variant, size, className }))}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      className
    )}
    {...props}>
    <div className="pb-4 pt-0">{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
