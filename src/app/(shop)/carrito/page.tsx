import type { Metadata } from "next";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { CartView } from "@/features/cart/components/CartView";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CartPage() {
  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <CartView />
      </div>
    </RequireAuth>
  );
}
