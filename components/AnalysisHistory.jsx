"use client";

import { useEffect, useState } from "react";

const timeFormat = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  dateStyle: "medium",
  timeStyle: "medium",
  hour12: false,
});

export default function AnalysisHistory({ apiUrl, result }) {
  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    async function loadHistory() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(new URL("/api/history", apiUrl), {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error("加载失败");
        const data = await response.json();
        if (!controller.signal.aborted) setRecords(data);
      } catch {
        if (!controller.signal.aborted) setError("历史加载失败，请收起后重新打开。");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadHistory();
    return () => controller.abort();
  }, [open, apiUrl, result]);

  return (
    <section className="panel panel-full history-panel">
      <button
        className="primary-button"
        type="button"
        aria-expanded={open}
        aria-controls="analysis-history"
        onClick={() => setOpen(!open)}
      >
        {open ? "收起分析历史" : "分析历史"}
      </button>
      {open && (
        <div id="analysis-history" className="history-content" aria-live="polite">
          {loading ? <p>正在加载历史…</p> : error ? <p>{error}</p> : records.length === 0 ? (
            <p>暂无分析历史。</p>
          ) : (
            <ul className="history-list">
              {records.map((record) => (
                <li key={record.id} className="result-item">
                  <time dateTime={record.analyzed_at}>
                    {timeFormat.format(new Date(record.analyzed_at))}（北京时间）
                  </time>
                  <dl>
                    <dt>原文</dt><dd>{record.text}</dd>
                    <dt>拼音</dt><dd>{record.pinyin}</dd>
                    <dt>情感分数</dt><dd>{record.score.toFixed(2)}</dd>
                    <dt>情感判断</dt><dd>{record.sentiment}</dd>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
