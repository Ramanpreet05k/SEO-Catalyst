"use client";

import { OnboardingForm } from "@/components/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="flex flex-col w-full max-w-[500px] mx-auto justify-center min-h-[80vh]">
      {/* This wrapper ensures the form stays centered on the right side of your 
        split-screen layout and doesn't stretch too wide.
      */}
      <OnboardingForm 
        onStepChange={(step) => {
          console.log(`User navigated to step: ${step}`);
        }} 
      />
    </div>
  );
}