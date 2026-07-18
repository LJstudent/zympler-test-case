export default function ContentBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-sm shadow-md flex-1 w-full min-w-0 p-2.5 md:p-5 flex flex-col justify-between gap-2.5 md:gap-5">
      {children}
    </div>
  );
}
