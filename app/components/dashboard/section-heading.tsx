export default function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full items-center gap-3 sm:gap-5">
      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-secondary-blue/25" />
      <h2
        id={id}
        className="shrink-0 text-center text-sm font-medium tracking-[0.16em] text-secondary-blue sm:text-base"
      >
        {children}
      </h2>
      <span aria-hidden="true" className="h-px min-w-4 flex-1 bg-secondary-blue/25" />
    </div>
  );
}
