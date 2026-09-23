"use client";

import { useState } from "react";
import type { PublicPostit } from "@/lib/types";

const MAX_TEXT = 200;

export default function Composer({
  onClose,
  onPosted,
}: {
  onClose: () => void;
  onPosted: (p: PublicPostit) => void;
}) {
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/postits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, author }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "붙이지 못했어요.");
      onPosted(json.postit);
    } catch (e) {
      setError(e instanceof Error ? e.message : "붙이지 못했어요.");
      setSending(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-label="포스트잇 쓰기">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="draft">
          <textarea
            autoFocus
            value={text}
            maxLength={MAX_TEXT}
            onChange={(e) => setText(e.target.value)}
            placeholder="전하고 싶은 말을 적어 주세요"
            aria-label="포스트잇에 적을 말"
          />
        </div>
        <p className="count">{text.length} / {MAX_TEXT}</p>
        <input
          className="author"
          value={author}
          maxLength={20}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="이름 (안 써도 돼요)"
          aria-label="이름"
        />
        <p className="hint">종이 색은 붙이는 순간 정해져요.</p>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button className="ghost" onClick={onClose}>그만두기</button>
          <button className="primary" onClick={submit} disabled={!text.trim() || sending}>
            {sending ? "붙이는 중…" : "붙이기"}
          </button>
        </div>
      </div>
    </div>
  );
}
