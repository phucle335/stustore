"use client";

import { StusportLogo } from "@/components/brand/StusportLogo";

type MottoLogoProps = {
  className?: string;
  variant?: "full" | "mark";
};

export function MottoLogo({ className = "", variant = "full" }: MottoLogoProps) {
  if (variant === "mark") {
    return <StusportLogo className={className} variant="mark" />;
  }

  const letters = ["S", "T", "U", "S", "P", "O", "R", "T"];

  return (
    <div className={`motto-wordmark ${className}`} aria-hidden>
      {letters.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          className={`motto-wordmark-letter ${i >= 3 ? "motto-wordmark-letter--accent" : ""}`}
          style={{ transitionDelay: `${0.58 + i * 0.08}s` }}
        >
          {letter}
        </span>
      ))}
    </div>
  );
}
