export default function NavButton({
  active = false,
  children,
  className,
}: {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-10 h-10 flex-none flex flex-nowrap gap-2.5 items-center justify-center hover:text-mint cursor-pointer focus:outline focus:outline-2 focus:outline-mint-600 focus:outline-offset-0 rounded-sm bg-slate-500 hover:bg-azure-500 ${active ? "text-mint" : "text-white"} ${className}`}
    >
      {children}
    </div>
  );
}
