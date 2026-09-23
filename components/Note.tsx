"use client";

import type { CSSProperties } from "react";
import type { PublicPostit } from "@/lib/types";

type Props = {
  note: PublicPostit;
  size?: "wall" | "large";
  anim?: "stick" | "fall";
  hidden?: boolean;
  onTap?: () => void;
  onSettled?: () => void;
};

export default function Note({ note, size = "wall", anim, hidden, onTap, onSettled }: Props) {
  const style = {
    "--paper": note.color,
    "--r": `${note.rotation}deg`,
    ...(size === "wall" ? { "--x": note.x, top: note.y } : {}),
  } as CSSProperties;

  const className = [
    "note",
    `note-${size}`,
    size === "wall" ? `stage-${note.stage}` : "",
    anim ? `anim-${anim}` : "",
    hidden ? "is-hidden" : "",
  ].join(" ");

  return (
    <article
      id={size === "wall" ? `note-${note.id}` : undefined}
      className={className}
      style={style}
      onClick={(e) => {
        if (!onTap) return;
        e.stopPropagation();
        onTap();
      }}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && e.animationName === "stick") onSettled?.();
      }}
    >
      <div className="note-body">
        <p className="note-text">{note.text}</p>
        {note.author && <p className="note-author">— {note.author}</p>}
      </div>
    </article>
  );
}
