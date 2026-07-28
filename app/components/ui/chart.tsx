import type { ComponentProps, CSSProperties, ReactElement } from "react";
import { ResponsiveContainer } from "recharts";

export type ChartConfig = Record<string, { color: string }>;

type ChartContainerProps = Omit<ComponentProps<"div">, "children"> & {
  config: ChartConfig;
  children: ReactElement;
};

export function ChartContainer({
  config,
  children,
  className = "",
  style,
  ...props
}: ChartContainerProps) {
  const chartColors = Object.fromEntries(
    Object.entries(config).map(([key, item]) => [`--color-${key}`, item.color]),
  ) as CSSProperties;

  return (
    <div
      className={`flex min-w-0 justify-center text-xs ${className}`}
      style={{ ...chartColors, ...style }}
      {...props}
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
        initialDimension={{ width: 1, height: 1 }}
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
}
