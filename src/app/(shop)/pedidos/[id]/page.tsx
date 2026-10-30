import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { OrderDetailView } from "@/features/orders/components/OrderDetailView";

/** Ruta dinámica: se permite el bloqueo en prerender (id desconocido en build). */
export const instant = false;

export const metadata: Metadata = {
  title: "Detalle de pedido",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  return (
    <RequireAuth>
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <OrderDetailView orderId={orderId} />
      </div>
    </RequireAuth>
  );
}
