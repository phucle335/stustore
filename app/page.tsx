import type { Metadata } from "next";
import { MottoHomePage } from "@/components/motto/MottoHomePage";

export const metadata: Metadata = {
  title: "Stusport | Ideas Worth Rallying Around",
  description:
    "Stusport — Giày sneaker, quần áo, nước hoa, đồng hồ và phụ kiện thể thao.",
};

export default function HomePage() {
  return <MottoHomePage />;
}
