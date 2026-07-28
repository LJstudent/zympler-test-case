import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

type AssetDetailHeaderProps = {
  title: string;
  description: string;
  iconSrc: string;
};

export function AssetDetailHeader({ title, description, iconSrc }: AssetDetailHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 rounded-lg text-xs font-semibold text-slate-500 transition-colors hover:text-brand-blue focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-blue"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Zympler Overview
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-blue-light/30 text-brand-blue shadow-[0_6px_18px_rgb(0_62_208_/_0.12)]">
            <img src={iconSrc} alt="" aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-[-0.035em] text-slate-950">{title}</h1>
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
