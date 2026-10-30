import type { Metadata } from "next";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { OrdersView } from "@/features/orders/components/OrdersView";

export const metadata: Metadata = {
  title: "Mis pedidos",
};

export default function OrdersPage() {
  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <OrdersView />
      </div>
    </RequireAuth>
  );
}
