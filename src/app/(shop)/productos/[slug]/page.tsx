import type { Metadata } from "next";

import { ProductDetailView } from "@/features/catalog/components/ProductDetailView";

/**
 * Ruta dinámica con datos en tiempo de ejecución: se permite que bloquee el
 * prerender (los hooks de URL como usePathname no existen en build).
 */
export const instant = false;

export const metadata: Metadata = {
  title: "Detalle de producto",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <ProductDetailView slug={slug} />
    </div>
  );
}
