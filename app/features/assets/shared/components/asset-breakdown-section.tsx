import { useId } from "react";
import type { ReactNode } from "react";

import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

type AssetBreakdownSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function AssetBreakdownSection({
  title,
  children,
  className = "",
}: AssetBreakdownSectionProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className={cn(className)}>
      <Separator className="my-6" />
      <h3 id={titleId} className="text-sm font-semibold text-slate-950">
        {title}
      </h3>
      {children}
    </section>
  );
}
