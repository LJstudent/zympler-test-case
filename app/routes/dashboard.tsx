import { SystemInfoPanel } from "~/components/system-info/system-info-panel";

export default function Dashboard() {
  return (
    <main className="min-h-dvh bg-white px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:py-10">
      <div className="w-full max-w-[25rem]">
        <h1 className="mb-6 text-[1.75rem] font-bold tracking-[-0.055em] text-brand-green sm:text-[2rem]">
          Zympler
        </h1>
        <SystemInfoPanel />
      </div>
    </main>
  );
}
