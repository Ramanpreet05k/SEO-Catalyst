import { useState } from "react";

export function useAnalyze() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = async ({ domain }: { domain: string }) => {
    setIsAnalyzing(true);
    
    // Simulate a 2-second API delay for the cool loading effect
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsAnalyzing(false);
    
    // Return mock success data so the form moves to Step 2
    return { 
      success: true, 
      jobId: "mock-job-123", 
      domainId: "mock-domain-456" 
    };
  };

  return { analyze, isAnalyzing };
}