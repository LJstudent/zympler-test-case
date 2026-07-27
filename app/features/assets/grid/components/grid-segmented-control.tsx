type GridSegmentedControlProps<T extends string> = {
  label: string;
  value: T;
  options: readonly { value: T; label: string; disabled?: boolean }[];
  onChange: (value: T) => void;
};

export function GridSegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: GridSegmentedControlProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </legend>
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={option.disabled}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-[background-color,color,box-shadow] duration-200 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:bg-white aria-pressed:text-brand-blue aria-pressed:shadow-sm"
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
