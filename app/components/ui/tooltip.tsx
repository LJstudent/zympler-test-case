import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";

export function TooltipProvider({
  delayDuration = 250,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className = "",
  sideOffset = 8,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={`z-50 max-w-64 rounded-lg border border-secondary-blue/25 bg-slate-900 px-3 py-2 text-xs leading-relaxed text-slate-100 shadow-xl shadow-black/30 data-[state=delayed-open]:animate-in motion-reduce:animate-none ${className}`}
        {...props}
      >
        {props.children}
        <TooltipPrimitive.Arrow className="fill-slate-900" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
