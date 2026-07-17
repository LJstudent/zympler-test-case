import type { ComponentProps } from "react";

export function Skeleton({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-slate-700/70 motion-reduce:animate-none ${className}`}
      {...props}
    />
  );
}
