import { ONBOARDING_TEXT } from "../constants/onboarding-steps";

export function OnboardingProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3" aria-label={`Step ${current} of ${total}`}>
      <span className="text-xs font-semibold text-slate-500">
        {ONBOARDING_TEXT.progress(current, total)}
      </span>
      <span className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-[width,background-color] motion-reduce:transition-none ${
              index + 1 === current ? "w-5 bg-brand-blue" : "w-1.5 bg-slate-200"
            }`}
          />
        ))}
      </span>
    </div>
  );
}
