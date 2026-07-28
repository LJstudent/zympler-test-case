import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className = "",
  sideOffset = 8,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={`z-50 max-w-64 rounded-lg bg-slate-950 px-3 py-2 text-xs leading-relaxed text-white shadow-lg data-[state=delayed-open]:animate-tooltip-in motion-reduce:animate-none ${className}`}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-slate-950" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
