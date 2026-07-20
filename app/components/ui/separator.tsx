import type { ComponentProps } from "react";

export function Separator({ className = "", ...props }: ComponentProps<"div">) {
  return <div role="separator" className={`h-px bg-slate-200/80 ${className}`} {...props} />;
}
