import { useEffect, useState } from "react";

import { systemStatuses } from "~/data/system-statuses";
import type { SystemStatus } from "~/types/system-status";

const DEVELOPMENT_LOADING_DELAY_MS = 700;

type SystemInfoQuery = {
  data: readonly SystemStatus[] | null;
  isLoading: boolean;
};

/** Temporary query boundary that can be replaced by an API-backed hook later. */
export function useSystemInfo(): SystemInfoQuery {
  const [data, setData] = useState<readonly SystemStatus[] | null>(null);

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => {
      setData(systemStatuses);
    }, DEVELOPMENT_LOADING_DELAY_MS);

    return () => window.clearTimeout(loadingTimer);
  }, []);

  return { data, isLoading: data === null };
}
