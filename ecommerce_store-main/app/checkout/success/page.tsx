import { Suspense } from "react";
import SuccessClient from "./success-client";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessClient />
    </Suspense>
  );
}

