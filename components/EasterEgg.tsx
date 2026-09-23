"use client";

import { useEffect, useState, type CSSProperties } from "react";
import type { PublicPostit } from "@/lib/types";
import { BACK_MESSAGES, FALL_MESSAGE } from "@/lib/easter";

// 누른 사람 화면에서만 일어나는 일. 서버에는 아무것도 보내지 않는다.
export default function EasterEgg({ note, onClose }: { note: PublicPostit; onClose: () => void }) {
  const [message] = useState(() => BACK_MESSAGES[Math.floor(Math.random() * BACK_MESSAGES.length)]);
  const [phase, setPhase] = useState<"falling" | "back">("falling");

  useEffect(() => {
    const t = setTimeout(() => setPhase("back"), 1500);
    return () => clearTimeout(t);
  }, []);

  const style = { "--paper": note.color, "--r": `${note.rotation}deg` } as CSSProperties;

  return (
    <div className="overlay easter" role="dialog" aria-label={FALL_MESSAGE} onClick={phase === "back" ? onClose : undefined}>
      <p className={`easter-title ${phase}`}>{FALL_MESSAGE}</p>
      <div className={`flip ${phase}`} style={style}>
        <div className="flip-inner">
          <div className="flip-face front note note-large">
            <div className="note-body">
              <p className="note-text">{note.text}</p>
            </div>
          </div>
          <div className="flip-face back note note-large">
            <div className="note-body">
              <p className="note-text back-text">{message}</p>
            </div>
          </div>
        </div>
      </div>
      {phase === "back" && (
        <button className="primary restick" onClick={onClose}>다시 붙여 두기</button>
      )}
    </div>
  );
}
