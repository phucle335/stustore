"use client";

import { useEffect, useState } from "react";
import { HERO_ROTATING_WORDS } from "@/lib/store/home-content";

const INTERVAL_MS = 2800;

export function HomeRotatingWord({
  words = HERO_ROTATING_WORDS,
}: {
  words?: readonly string[];
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (words.length <= 1) return;
      setIndex((current) => (current + 1) % words.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [words.length]);

  const word = words[index] ?? words[0] ?? "";

  return (
    <div className="home-hero-words" aria-live="polite" aria-atomic="true">
      <span key={word} className="home-hero-word-cycle">
        {word}
      </span>
    </div>
  );
}
