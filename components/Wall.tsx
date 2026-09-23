"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicPostit } from "@/lib/types";
import { EASTER_TAPS, EASTER_WINDOW_MS } from "@/lib/easter";
import Note from "./Note";
import Composer from "./Composer";
import EasterEgg from "./EasterEgg";

type WallNote = PublicPostit & { anim?: "stick" | "fall" };

const POLL_MS = 60_000;
const FALL_ANIM_MS = 2600;
const TAP_GAP_MS = 400;

export default function Wall({ initial }: { initial: PublicPostit[] }) {
  const [notes, setNotes] = useState<WallNote[]>(initial);
  const [zoomed, setZoomed] = useState<PublicPostit | null>(null);
  const [composing, setComposing] = useState(false);
  const [dropped, setDropped] = useState<PublicPostit | null>(null);
  const [hiddenId, setHiddenId] = useState<string | null>(null);
  const taps = useRef<{ id: string; times: number[]; timer?: ReturnType<typeof setTimeout> }>({
    id: "",
    times: [],
  });

  // 주기적으로 벽을 다시 보고, 그사이 떨어진 포스트잇은 팔랑이며 떨어뜨린다
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/postits", { cache: "no-store" });
      if (!res.ok) return;
      const { postits } = (await res.json()) as { postits: PublicPostit[] };
      const alive = new Set(postits.map((p) => p.id));
      setNotes((prev) => {
        const known = new Set(prev.map((p) => p.id));
        const updated: WallNote[] = prev.map((p) => {
          if (!alive.has(p.id)) return { ...p, anim: "fall" };
          return { ...postits.find((q) => q.id === p.id)!, anim: p.anim };
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

  // 한 번 누르면 확대, 빠르게 여러 번 누르면… 떨어진다
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
      setHiddenId(note.id);
      setDropped(note);
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

      <section className="wall" style={{ height: wallHeight }} aria-label="포스트잇이 붙은 나무 벽">
        {notes.length === 0 && <p className="empty">아직 아무것도 붙어 있지 않아요.<br />첫 번째 말을 남겨 주세요.</p>}
        {notes.map((n) => (
          <Note
            key={n.id}
            note={n}
            anim={n.anim}
            hidden={n.id === hiddenId}
            onTap={() => onTap(n)}
            onSettled={() =>
              setNotes((prev) => prev.map((p) => (p.id === n.id && p.anim === "stick" ? { ...p, anim: undefined } : p)))
            }
          />
        ))}
      </section>

      <button className="fab" onClick={() => setComposing(true)} aria-label="포스트잇 붙이기">
        <span aria-hidden>＋</span> 붙이기
      </button>

      {zoomed && (
        <div className="overlay" onClick={() => setZoomed(null)} role="dialog" aria-label="포스트잇 읽기">
          <Note note={zoomed} size="large" />
        </div>
      )}

      {composing && <Composer onClose={() => setComposing(false)} onPosted={onPosted} />}

      {dropped && (
        <EasterEgg
          note={dropped}
          onClose={() => {
            const id = dropped.id;
            setDropped(null);
            setHiddenId(null);
            setNotes((prev) => prev.map((p) => (p.id === id ? { ...p, anim: "stick" } : p)));
          }}
        />
      )}
    </main>
  );
}
