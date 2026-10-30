import type { Metadata } from "next";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { CheckoutView } from "@/features/checkout/components/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <CheckoutView />
      </div>
    </RequireAuth>
  );
}
