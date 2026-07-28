import { useCallback, useEffect, useState } from "react";

import { ONBOARDING_STORAGE_KEY, ONBOARDING_STEPS } from "../constants/onboarding-steps";

function storeOnboardingCompletion() {
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "completed");
  } catch {
    // The tutorial still works when storage is unavailable, but cannot persist completion.
  }
}

export function useOnboarding() {
  const [isReady, setIsReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let hasCompletedOnboarding = false;

    try {
      hasCompletedOnboarding = window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== null;
    } catch {
      // Treat unavailable storage as a first visit.
    }

    setIsOpen(!hasCompletedOnboarding);
    setIsReady(true);
  }, []);

  const dismiss = useCallback(() => {
    storeOnboardingCompletion();
    setIsOpen(false);
  }, []);

  const setOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setIsOpen(true);
        return;
      }

      dismiss();
    },
    [dismiss],
  );

  const openManually = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const goBack = useCallback(() => {
    setCurrentStep((step) => Math.max(0, step - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentStep((step) => Math.min(ONBOARDING_STEPS.length - 1, step + 1));
  }, []);

  return {
    currentStep,
    dismiss,
    goBack,
    goNext,
    isOpen,
    isReady,
    openManually,
    setOpen,
  };
}
