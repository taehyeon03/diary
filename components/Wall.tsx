"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { PublicPostit } from "@/lib/types";
import { EASTER_CHANCE, EASTER_TAPS, EASTER_WINDOW_MS, FALL_MESSAGE } from "@/lib/easter";
import Note, { type NoteAnim } from "./Note";
import Composer from "./Composer";

type WallNote = PublicPostit & { anim?: NoteAnim };
type Revealed = { note: PublicPostit; message: string };

const POLL_MS = 60_000;
const FALL_ANIM_MS = 2600;
const DROP_ANIM_MS = 1400;
const TAP_GAP_MS = 400;

export default function Wall({ initial, wallMessages }: { initial: PublicPostit[]; wallMessages: string[] }) {
  const [notes, setNotes] = useState<WallNote[]>(initial);
  const [zoomed, setZoomed] = useState<PublicPostit | null>(null);
  const [composing, setComposing] = useState(false);
  const [revealed, setRevealed] = useState<Revealed | null>(null);
  const [toast, setToast] = useState(false);
  const taps = useRef<{ id: string; times: number[]; timer?: ReturnType<typeof setTimeout> }>({
    id: "",
    times: [],
  });

  const setAnim = (id: string, anim: NoteAnim | undefined) =>
    setNotes((prev) => prev.map((p) => (p.id === id ? { ...p, anim } : p)));

  // 주기적으로 벽을 다시 보고, 그사이 떨어진 포스트잇은 팔랑이며 떨어뜨린다
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/postits", { cache: "no-store" });
      if (!res.ok) return;
      const { postits } = (await res.json()) as { postits: PublicPostit[] };
      const fresh = new Map(postits.map((p) => [p.id, p]));
      setNotes((prev) => {
        const known = new Set(prev.map((p) => p.id));
        const updated: WallNote[] = prev.map((p) => {
          const next = fresh.get(p.id);
          return next ? { ...next, anim: p.anim } : { ...p, anim: "fall" };
        });
        const added: WallNote[] = postits.filter((p) => !known.has(p.id)).map((p) => ({ ...p, anim: "stick" }));
        return [...updated, ...added];
      });
      setTimeout(() => setNotes((prev) => prev.filter((p) => p.anim !== "fall")), FALL_ANIM_MS);
    } catch {
      // 네트워크가 잠깐 끊겨도 벽은 그대로
    }
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  // 이스터에그: 빠르게 여러 번 누르면, 가끔… 떨어진다. (내 화면에서만)
  const tryDrop = (note: PublicPostit) => {
    if (revealed || Math.random() >= EASTER_CHANCE) {
      setAnim(note.id, "wobble");
      return;
    }
    const message = wallMessages[Math.floor(Math.random() * wallMessages.length)];
    setAnim(note.id, "drop");
    setTimeout(() => {
      setRevealed({ note, message });
      setToast(true);
      setTimeout(() => setToast(false), 3200);
    }, DROP_ANIM_MS);
  };

  const restick = () => {
    if (!revealed) return;
    setAnim(revealed.note.id, "stick");
    setRevealed(null);
    setToast(false);
  };

  // 한 번 누르면 확대, 빠르게 여러 번 누르면 이스터에그
  const onTap = (note: PublicPostit) => {
    const now = Date.now();
    const t = taps.current;
    if (t.id !== note.id) {
      clearTimeout(t.timer);
      t.id = note.id;
      t.times = [];
    }
    t.times = [...t.times.filter((x) => now - x < EASTER_WINDOW_MS), now];
    clearTimeout(t.timer);

    if (t.times.length >= EASTER_TAPS) {
      t.times = [];
      tryDrop(note);
      return;
    }
    t.timer = setTimeout(() => {
      t.times = [];
      setZoomed(note);
    }, TAP_GAP_MS);
  };

  const onPosted = (p: PublicPostit) => {
    setNotes((prev) => [...prev, { ...p, anim: "stick" }]);
    setComposing(false);
    requestAnimationFrame(() =>
      document.getElementById(`note-${p.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }),
    );
  };

  const wallHeight = Math.max(560, ...notes.map((n) => n.y + 260));

  return (
    <main className="page">
      <header className="top">
        <h1>언젠간 떨어질 포스트잇</h1>
      </header>

      <section className="wall" style={{ height: wallHeight }} aria-label="포스트잇이 붙은 벽">
        {notes.length === 0 && <p className="empty">아직 아무것도 붙어 있지 않아요.<br />첫 번째 말을 남겨 주세요.</p>}

        {revealed && (
          <button
            className="wall-writing"
            style={{ "--x": revealed.note.x, "--r": `${revealed.note.rotation}deg`, top: revealed.note.y } as CSSProperties}
            onClick={restick}
            aria-label="벽에 적힌 글. 누르면 포스트잇을 다시 붙여요"
          >
            <span>{revealed.message}</span>
          </button>
        )}

        {notes.map((n) => (
          <Note
            key={n.id}
            note={n}
            anim={n.anim}
            hidden={revealed?.note.id === n.id}
            onTap={() => onTap(n)}
            onAnimDone={(name) => {
              if (name === "stick" || name === "wobble") setAnim(n.id, undefined);
            }}
          />
        ))}
      </section>

      {toast && <p className="toast" role="status">{FALL_MESSAGE}</p>}

      <button className="fab" onClick={() => setComposing(true)} aria-label="포스트잇 붙이기">
        <span aria-hidden>＋</span> 붙이기
      </button>

      {zoomed && (
        <div className="overlay" onClick={() => setZoomed(null)} role="dialog" aria-label="포스트잇 읽기">
          <Note note={zoomed} size="large" />
        </div>
      )}

      {composing && <Composer onClose={() => setComposing(false)} onPosted={onPosted} />}
    </main>
  );
}
