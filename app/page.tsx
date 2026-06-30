import type { Metadata } from "next";
import { MottoHomePage } from "@/components/motto/MottoHomePage";

export const metadata: Metadata = {
  title: "Stusport | Ideas Worth Rallying Around",
  description:
    "Stusport — Sneakers, clothing, watches and sports accessories.",
};

export default function HomePage() {
  return <MottoHomePage />;
}
