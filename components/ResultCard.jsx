"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

export default function ResultCard({ result, pending, error }) {
  const cardRef = useRef(null);

  useEffect(() => {
    // 卡片自己淡入：.card 默认 opacity:0，这张卡负责把自己显出来
    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      ease: "outBack",
    });
  }, []);

  return (
    <article ref={cardRef} className="panel panel-half lab-panel result-panel card">
      <div className="panel-heading">
        <p className="section-kicker">结果区</p>
        <h3>分析结果</h3>
      </div>
      <div aria-live="polite">
        {error && <p>{error}</p>}
        {pending && <p>正在分析文本…</p>}
        {!result && !pending && !error && <p>点击「开始分析」查看结果。</p>}
      </div>
      {result && (
        <div className="result-stack">
          <div className="result-item">
            <span>原文</span>
            <p>{result.text}</p>
          </div>
          <div className="result-item">
            <span>拼音</span>
            <p>{result.pinyin}</p>
          </div>
          <div className="result-grid">
            <div className="result-badge">
              <span>情感分数</span>
              <strong data-score>{result.score.toFixed(2)}</strong>
            </div>
            <div className="result-badge">
              <span>情感判断</span>
              <strong>{result.sentiment}</strong>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
