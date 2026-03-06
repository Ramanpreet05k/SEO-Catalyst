"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export function ExportPdfButton({ targetId, defaultFileName }: { targetId: string, defaultFileName: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Dynamically import html2pdf to prevent Next.js SSR errors
      const html2pdf = (await import("html2pdf.js")).default;
      
      // Target the specific <div> that contains your drafted text
      const element = document.getElementById(targetId);

      if (!element) {
        alert("Could not find the content to export.");
        setIsExporting(false);
        return;
      }

      // Configure the PDF layout
      const opt = {
        margin:       0.75, // 0.75 inch margins
        filename:     `${defaultFileName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to generate the PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
    >
      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {isExporting ? "Generating PDF..." : "Export to PDF"}
    </button>
  );
}