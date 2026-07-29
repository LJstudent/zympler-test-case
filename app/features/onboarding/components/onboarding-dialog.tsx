import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog";

import { ONBOARDING_STEPS, ONBOARDING_TEXT } from "../constants/onboarding-steps";
import { useOnboarding } from "../hooks/use-onboarding";
import { OnboardingProgress } from "./onboarding-progress";
import { OnboardingSlide } from "./onboarding-slide";

export function DashboardOnboarding() {
  const onboarding = useOnboarding();

  if (!onboarding.isReady) return null;

  const step = ONBOARDING_STEPS[onboarding.currentStep];
  const isFirstStep = onboarding.currentStep === 0;
  const isLastStep = onboarding.currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="fixed right-4 bottom-4 z-40 bg-white/95 shadow-panel backdrop-blur-sm max-sm:h-11"
        onClick={onboarding.openManually}
      >
        {ONBOARDING_TEXT.manualTrigger}
      </Button>

      <Dialog open={onboarding.isOpen} onOpenChange={onboarding.setOpen}>
        <DialogContent className="max-w-3xl" closeLabel={ONBOARDING_TEXT.close}>
          <div className="shrink-0 border-b border-slate-100 px-5 py-4 pr-16 sm:px-6">
            <DialogTitle className="text-base font-semibold text-slate-950">
              {ONBOARDING_TEXT.dialogTitle}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-slate-500">
              {ONBOARDING_TEXT.dialogDescription}
            </DialogDescription>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <OnboardingSlide key={step.id} step={step} />
          </div>

          <footer className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              className="max-sm:h-11 max-sm:px-3"
              onClick={onboarding.dismiss}
            >
              {ONBOARDING_TEXT.skip}
            </Button>
            <div className="mx-auto">
              <OnboardingProgress
                current={onboarding.currentStep + 1}
                total={ONBOARDING_STEPS.length}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="max-sm:h-11 max-sm:px-3"
              onClick={onboarding.goBack}
              disabled={isFirstStep}
            >
              {ONBOARDING_TEXT.back}
            </Button>
            <Button
              type="button"
              className="max-sm:h-11 max-sm:px-3"
              onClick={isLastStep ? onboarding.dismiss : onboarding.goNext}
            >
              {isLastStep ? ONBOARDING_TEXT.getStarted : ONBOARDING_TEXT.next}
            </Button>
          </footer>
        </DialogContent>
      </Dialog>
    </>
  );
}
