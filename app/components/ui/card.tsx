import type { ComponentProps } from "react";

export function Card({ className = "", ...props }: ComponentProps<"section">) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white ${className}`} {...props} />
  );
}

export function CardHeader({ className = "", ...props }: ComponentProps<"header">) {
  return <header className={`flex items-center justify-between ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }: ComponentProps<"h2">) {
  return <h2 className={`font-semibold text-slate-950 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={className} {...props} />;
}
