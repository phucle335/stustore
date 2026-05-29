import { StusportLogo } from "@/components/brand/StusportLogo";

type MottoLogoProps = {
  className?: string;
  variant?: "full" | "mark";
  tone?: "on-dark" | "on-light";
};

export function MottoLogo({
  className = "",
  variant = "full",
  tone = "on-dark",
}: MottoLogoProps) {
  return (
    <StusportLogo
      className={className}
      variant={variant === "mark" ? "mark" : "hero"}
      tone={tone}
    />
  );
}
