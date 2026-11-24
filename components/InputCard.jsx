"use client";

import { useState } from "react";

export default function InputCard({ onAnalyze, pending }) {
  const [text, setText] = useState("今天的风很轻，适合把脑海里的想法慢慢写下来。");

  function handleSubmit(event) {
    event.preventDefault();
    if (!pending && text.trim()) {
      onAnalyze(text);
    }
  }

  return (
    <article className="panel panel-half lab-panel card">
      <div className="panel-heading">
        <p className="section-kicker">输入区</p>
        <h3>贴一段中文</h3>
      </div>
      <form className="lab-form" onSubmit={handleSubmit}>
        <label htmlFor="text-input">文本内容</label>
        <textarea
          id="text-input"
          rows="8"
          placeholder="例如：生活没有标准答案，但每一天都值得认真感受。"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <p className="lab-count">已输入 {text.length} 字</p>

        <button className="primary-button" type="submit" disabled={pending || !text.trim()}>
          {pending ? "分析中…" : "开始分析"}
        </button>
      </form>
    </article>
  );
}
