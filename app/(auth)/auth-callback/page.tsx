"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const { status } = useSession();
  const router = useRouter();
  const [loadingText, setLoadingText] = useState("Verifying your account...");

  useEffect(() => {
    async function checkUserStatus() {
      // 1. Wait until NextAuth confirms the user is fully logged in
      if (status === "authenticated") {
        setLoadingText("Checking account setup...");
        
        try {
          // 2. Secretly fetch the API in the background (DOES NOT navigate the browser)
          const res = await fetch("/api/user/status");
          
          if (!res.ok) {
            throw new Error("Failed to fetch status");
          }

          const data = await res.json();

          // 3. The Smart Redirect!
          // Only navigate the browser to actual React UI pages
          if (data?.onboardingCompleted === true) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        } catch (error) {
          console.error("Failed to check status", error);
          // Safely fallback to the onboarding flow just in case
          router.push("/onboarding"); 
        }
      } 
      // If they somehow aren't authenticated, boot them back to the login page
      else if (status === "unauthenticated") {
        router.push("/login");
      }
    }

    checkUserStatus();
  }, [status, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      {/* A nice spinning loading circle while the background fetch happens */}
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      <h3 className="text-xl font-bold text-gray-900">{loadingText}</h3>
      <p className="text-sm text-gray-500">You will be redirected momentarily.</p>
    </div>
  );
}