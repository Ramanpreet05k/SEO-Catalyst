"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!url) return;
    setLoading(true);
    setResult("");
    
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ url }), 
      });
      const data = await response.json();
      setResult(data.result || data.error);
    } catch (error) {
      setResult("Connection failed.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100vh", backgroundColor: "#0a0a0a", color: "white", padding: "40px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>SEO Auditor</h1>
      
      <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "600px" }}>
        <input 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="https://example.com"
          style={{ padding: "12px", borderRadius: "8px", flex: 1, color: "black", border: "none" }}
        />
        <button 
          onClick={handleAnalyze} 
          style={{ padding: "12px 24px", borderRadius: "8px", backgroundColor: "#3b82f6", border: "none", color: "white", fontWeight: "bold", cursor: "pointer" }}
        >
          {loading ? "Scanning..." : "Analyze URL"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#171717", borderRadius: "12px", width: "100%", maxWidth: "800px", border: "1px solid #333", whiteSpace: "pre-wrap" }}>
          <h2 style={{ color: "#60a5fa", marginBottom: "15px" }}>Analysis Results:</h2>
          {result}
        </div>
      )}
    </div>
  );
}