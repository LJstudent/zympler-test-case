import { useCallback, useEffect, useReducer, useRef } from "react";

import { ONBOARDING_STORAGE_KEY, ONBOARDING_STEPS } from "../constants/onboarding-steps";

export type OnboardingState = {
  currentStep: number;
  isOpen: boolean;
  isReady: boolean;
};

export type OnboardingAction =
  | { type: "initialise"; hasCompleted: boolean }
  | { type: "dismiss" }
  | { type: "openManually" }
  | { type: "goBack" }
  | { type: "goNext" };

export const INITIAL_ONBOARDING_STATE: OnboardingState = {
  currentStep: 0,
  isOpen: false,
  isReady: false,
};

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case "initialise":
      if (state.isReady) return state;

      return {
        ...state,
        isOpen: !action.hasCompleted,
        isReady: true,
      };
    case "dismiss":
      return { ...state, isOpen: false };
    case "openManually":
      return { ...state, currentStep: 0, isOpen: true };
    case "goBack":
      return { ...state, currentStep: Math.max(0, state.currentStep - 1) };
    case "goNext":
      return {
        ...state,
        currentStep: Math.min(ONBOARDING_STEPS.length - 1, state.currentStep + 1),
      };
  }
}

function storeOnboardingCompletion() {
  try {
    window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "completed");
  } catch {
    // The tutorial still works when storage is unavailable, but cannot persist completion.
  }
}

export function useOnboarding() {
  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_ONBOARDING_STATE);
  const hasCheckedStorage = useRef(false);

  useEffect(() => {
    if (hasCheckedStorage.current) return;
    hasCheckedStorage.current = true;

    let hasCompletedOnboarding = false;

    try {
      hasCompletedOnboarding = window.localStorage.getItem(ONBOARDING_STORAGE_KEY) !== null;
    } catch {
      // Treat unavailable storage as a first visit.
    }

    dispatch({ type: "initialise", hasCompleted: hasCompletedOnboarding });
  }, []);

  const dismiss = useCallback(() => {
    storeOnboardingCompletion();
    dispatch({ type: "dismiss" });
  }, []);

  const setOpen = useCallback(
    (open: boolean) => {
      if (open) {
        dispatch({ type: "openManually" });
        return;
      }

      dismiss();
    },
    [dismiss],
  );

  const openManually = useCallback(() => {
    dispatch({ type: "openManually" });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: "goBack" });
  }, []);

  const goNext = useCallback(() => {
    dispatch({ type: "goNext" });
  }, []);

  return {
    currentStep: state.currentStep,
    dismiss,
    goBack,
    goNext,
    isOpen: state.isOpen,
    isReady: state.isReady,
    openManually,
    setOpen,
  };
}
