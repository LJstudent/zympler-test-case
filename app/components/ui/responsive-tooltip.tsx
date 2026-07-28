import type { MouseEvent, PointerEvent, ReactElement, ReactNode } from "react";
import { cloneElement, useCallback, useEffect, useId, useState } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { useHasFinePointer } from "~/components/ui/use-fine-pointer";
import { cn } from "~/lib/utils";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

type TriggerProps = {
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLElement>) => void;
};

export type ResponsiveTooltipProps = {
  content: ReactNode;
  children: ReactElement<TriggerProps>;
  side?: Side;
  align?: Align;
  disabled?: boolean;
};

type ActiveOverlay = {
  id: string;
  close: () => void;
};

let activeOverlay: ActiveOverlay | null = null;

const CONTENT_CLASS_NAME = "max-w-[min(20rem,calc(100vw-2rem))] whitespace-normal break-words";

export function ResponsiveTooltip({
  content,
  children,
  side = "top",
  align = "center",
  disabled = false,
}: ResponsiveTooltipProps) {
  const id = useId();
  const hasFinePointer = useHasFinePointer();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  const setCoordinatedOpen = useCallback(
    (nextOpen: boolean) => {
      if (disabled) {
        setOpen(false);
        return;
      }

      if (nextOpen) {
        if (activeOverlay?.id !== id) {
          activeOverlay?.close();
        }
        activeOverlay = { id, close };
      } else if (activeOverlay?.id === id) {
        activeOverlay = null;
      }

      setOpen(nextOpen);
    },
    [close, disabled, id],
  );

  useEffect(() => {
    if (disabled) {
      setCoordinatedOpen(false);
    }
  }, [disabled, setCoordinatedOpen]);

  useEffect(
    () => () => {
      if (activeOverlay?.id === id) {
        activeOverlay = null;
      }
    },
    [id],
  );

  const trigger = cloneElement(children, {
    disabled: disabled || children.props.disabled,
    onClick: (event: MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      children.props.onClick?.(event);
    },
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      event.stopPropagation();
      children.props.onPointerDown?.(event);
    },
  });

  if (hasFinePointer) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip open={open} onOpenChange={setCoordinatedOpen}>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent
            side={side}
            align={align}
            collisionPadding={12}
            avoidCollisions
            className={CONTENT_CLASS_NAME}
          >
            {content}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Popover open={open} onOpenChange={setCoordinatedOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        collisionPadding={12}
        avoidCollisions
        onOpenAutoFocus={(event) => event.preventDefault()}
        className={cn(
          CONTENT_CLASS_NAME,
          "rounded-lg border-0 bg-slate-950 px-3 py-2 text-xs leading-relaxed text-white shadow-lg motion-reduce:animate-none",
        )}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
