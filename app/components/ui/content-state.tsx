import { AlertCircle, Inbox } from "lucide-react";

export type ContentState = "loading" | "error" | "empty" | "ready";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
};

export function ErrorState({
  message = "Unable to load data.",
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 text-red-950 ${compact ? "p-3" : "p-4"}`}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs font-medium leading-5">{message}</p>
        {onRetry !== undefined && (
          <button
            type="button"
            className="mt-1.5 text-xs font-semibold text-red-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            onClick={onRetry}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

type EmptyStateProps = {
  message?: string;
  compact?: boolean;
};

export function EmptyState({ message = "No data available", compact = false }: EmptyStateProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 text-center text-slate-500 ${compact ? "p-3" : "p-6"}`}
    >
      <Inbox className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      <p className="text-xs font-medium">{message}</p>
    </div>
  );
}
