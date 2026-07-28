type AssetToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function AssetToggle({ label, checked, onChange }: AssetToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-600">
      <span>{label}</span>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative h-6 w-10 rounded-full bg-slate-200 transition-colors duration-200 peer-checked:bg-brand-blue peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-blue after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 peer-checked:after:translate-x-4" />
    </label>
  );
}
