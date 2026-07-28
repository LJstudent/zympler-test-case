export type OnboardingImage = {
  src: string;
  alt: string;
};

export type OnboardingStep = {
  id: "overview" | "assets" | "charts" | "kpis";
  title: string;
  description: string;
  desktopImage: OnboardingImage;
  mobileImages?: readonly OnboardingImage[];
};
