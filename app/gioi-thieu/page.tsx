import type { Metadata } from "next";
import { StoreShell } from "@/components/store/StoreShell";
import { AboutUsPage } from "@/components/store/AboutUsPage";
import { STORE_NAME } from "@/lib/store/site";

export const metadata: Metadata = {
  title: `Giới thiệu — ${STORE_NAME}`,
};

export default function GioiThieuPage() {
  return (
    <StoreShell activeNav="home">
      <AboutUsPage />
    </StoreShell>
  );
}

