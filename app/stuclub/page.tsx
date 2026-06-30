import type { Metadata } from "next";
import { StoreShell } from "@/components/store/StoreShell";
import { StaticPageShell } from "@/components/store/StaticPageShell";
import { StuclubMembership } from "@/components/motto/StuclubMembership";
import { STORE_NAME } from "@/lib/store/site";

export const metadata: Metadata = {
  title: `STUClub Membership — ${STORE_NAME}`,
};

export default function StuclubPage() {
  return (
    <StoreShell activeNav="stuclub">
      <StaticPageShell>
        <StuclubMembership />
      </StaticPageShell>
    </StoreShell>
  );
}
