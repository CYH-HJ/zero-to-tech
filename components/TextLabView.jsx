"use client";

import { useState } from "react";
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import InputCard from "./InputCard.jsx";
import ResultCard from "./ResultCard.jsx";
import { textLab } from "../data/site.js";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function TextLabView() {
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function analyze(text) {
    setPending(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(new URL("/api/analyze", apiUrl), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        setError("分析失败，请稍后重试。");
        return;
      }
      setResult(await response.json());
    } catch {
      setError("无法连接分析服务，请确认本地 Python 后端已启动。");
    } finally {
      setPending(false);
    }
  }

  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <Nav />
        <PageHeading title={textLab.heroTitle} subtitle={textLab.heroSubtitle} />
      </article>

      <InputCard onAnalyze={analyze} pending={pending} />
      <ResultCard result={result} pending={pending} error={error} />
    </AnimatedCardGrid>
  );
}
