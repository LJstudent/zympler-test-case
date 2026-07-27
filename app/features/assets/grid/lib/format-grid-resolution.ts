import type { GridAggregation, GridTimeView } from "../types/grid-types";

type ResolutionNoun = {
  singular: string;
  plural: string;
};

const GRID_RESOLUTION_NOUNS: Record<GridTimeView, Record<GridAggregation, ResolutionNoun>> = {
  year: {
    combined: { singular: "monthly total", plural: "monthly totals" },
    raw: { singular: "daily total", plural: "daily totals" },
  },
  month: {
    combined: { singular: "daily total", plural: "daily totals" },
    raw: { singular: "hourly interval", plural: "hourly intervals" },
  },
  day: {
    combined: { singular: "hourly total", plural: "hourly totals" },
    raw: { singular: "quarter-hour interval", plural: "quarter-hour intervals" },
  },
};

export function formatGridResolution(
  count: number,
  view: GridTimeView,
  aggregation: GridAggregation,
): string {
  const noun = GRID_RESOLUTION_NOUNS[view][aggregation];
  return `${count.toLocaleString("en")} ${count === 1 ? noun.singular : noun.plural}`;
}
