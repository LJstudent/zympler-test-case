import type { OnboardingStep } from "../types/onboarding-types";

function Screenshot({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`block h-full w-full object-contain ${className}`}
    />
  );
}

export function OnboardingSlide({ step }: { step: OnboardingStep }) {
  const primaryMobileImage = step.mobileImages?.[0];
  const additionalMobileImages = step.mobileImages?.slice(1) ?? [];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <div
          className={
            step.mobileImages === undefined
              ? "aspect-[16/10]"
              : "grid grid-cols-3 gap-2 p-2 md:block md:aspect-[16/10] md:p-0"
          }
        >
          <picture className="block h-full overflow-hidden rounded-lg bg-white md:rounded-none">
            {primaryMobileImage !== undefined && (
              <source media="(max-width: 767px)" srcSet={primaryMobileImage.src} />
            )}
            <Screenshot
              src={step.desktopImage.src}
              alt={step.desktopImage.alt}
              className={
                step.mobileImages === undefined
                  ? ""
                  : "aspect-[390/844] object-cover object-top md:aspect-auto md:object-contain"
              }
            />
          </picture>

          {additionalMobileImages.length > 0 && (
            <>
              {additionalMobileImages.map((image) => (
                <div key={image.src} className="overflow-hidden rounded-lg bg-white md:hidden">
                  <Screenshot
                    src={image.src}
                    alt={image.alt}
                    className="aspect-[390/844] object-cover object-top"
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-[-0.025em] text-slate-950">{step.title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
      </div>
    </div>
  );
}
