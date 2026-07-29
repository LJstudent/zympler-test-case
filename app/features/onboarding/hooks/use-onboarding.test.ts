import { describe, expect, it } from "vitest";

import {
  INITIAL_ONBOARDING_STATE,
  onboardingReducer,
  type OnboardingState,
} from "./use-onboarding";

describe("onboarding lifecycle", () => {
  it("stays hidden before the loaded dashboard initialises it", () => {
    expect(INITIAL_ONBOARDING_STATE).toEqual({
      currentStep: 0,
      isOpen: false,
      isReady: false,
    });
  });

  it("opens once after dashboard data is ready and ignores duplicate initialisation", () => {
    const opened = onboardingReducer(INITIAL_ONBOARDING_STATE, {
      type: "initialise",
      hasCompleted: false,
    });
    const duplicateInitialisation = onboardingReducer(opened, {
      type: "initialise",
      hasCompleted: false,
    });

    expect(opened).toMatchObject({ isOpen: true, isReady: true });
    expect(duplicateInitialisation).toBe(opened);
  });

  it("does not open automatically when the tutorial was completed", () => {
    const completed = onboardingReducer(INITIAL_ONBOARDING_STATE, {
      type: "initialise",
      hasCompleted: true,
    });

    expect(completed).toMatchObject({ isOpen: false, isReady: true });
  });

  it("supports manual reopening without resetting readiness", () => {
    const completed: OnboardingState = {
      currentStep: 3,
      isOpen: false,
      isReady: true,
    };
    const reopened = onboardingReducer(completed, { type: "openManually" });

    expect(reopened).toEqual({
      currentStep: 0,
      isOpen: true,
      isReady: true,
    });
  });
});
