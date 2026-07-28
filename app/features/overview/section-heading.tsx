type SectionHeadingProps = {
  children: React.ReactNode;
};

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <div className="flex items-center gap-4 sm:gap-6">
      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
      <h2 className="shrink-0 text-sm font-semibold tracking-[-0.01em] text-slate-700 sm:text-base">
        {children}
      </h2>
      <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
    </div>
  );
}
