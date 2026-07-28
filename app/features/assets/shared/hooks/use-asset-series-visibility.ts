import { useCallback, useEffect, useMemo, useState } from "react";

import type { AssetChartSeries } from "../types/asset-detail-types";

export function useAssetSeriesVisibility<Key extends string>(
  series: readonly AssetChartSeries<Key>[],
) {
  const keys = useMemo(() => series.map((item) => item.key), [series]);
  const [hiddenKeys, setHiddenKeys] = useState<Set<Key>>(() => new Set());

  useEffect(() => {
    const validKeys = new Set(keys);
    setHiddenKeys((current) => {
      const next = new Set([...current].filter((key) => validKeys.has(key)));
      return next.size === current.size ? current : next;
    });
  }, [keys]);

  const toggleSeries = useCallback((key: Key) => {
    setHiddenKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return {
    visibleSeries: series.filter((item) => !hiddenKeys.has(item.key)),
    hiddenKeys,
    toggleSeries,
  };
}
