"use client"

import type * as React from "react"
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
  composeRenderProps,
} from "react-aria-components"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Re-export MenuTrigger for convenience
export { AriaMenuTrigger as MenuTrigger }

// Menu Component
export function Menu<T extends object>({ className, ...props }: React.ComponentProps<typeof AriaMenu<T>>) {
  return (
    <AriaPopover
      placement="bottom end"
      className={cn(
        "min-w-[200px] max-w-[90vw] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg z-50",
        "data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[entering]:zoom-in-95",
        "data-[placement=bottom]:slide-in-from-top-2 data-[placement=left]:slide-in-from-right-2 data-[placement=right]:slide-in-from-left-2 data-[placement=top]:slide-in-from-bottom-2",
        // Responsive adjustments
        "sm:max-w-[300px] md:max-w-[400px]",
        className,
      )}
    >
      <AriaMenu className="p-2 outline-none" {...props} />
    </AriaPopover>
  )
}

// MenuItem Component
export function MenuItem<T extends object>({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AriaMenuItem<T>>) {
  return (
    <AriaMenuItem
      className={composeRenderProps(className, (className) =>
        cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2.5 text-sm outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          "data-[focused]:bg-accent data-[focused]:text-accent-foreground",
          // Better touch targets for mobile
          "min-h-[44px] sm:min-h-[40px]",
          className,
        ),
      )}
      {...props}
    >
      {composeRenderProps(children, (children) => (
        <div className="flex items-center justify-between w-full">
          <span className="flex-1">{children}</span>
          {props.href && ( // Add a visual indicator for links
            <ChevronRight className="ml-2 h-4 w-4 opacity-60" />
          )}
        </div>
      ))}
    </AriaMenuItem>
  )
}
