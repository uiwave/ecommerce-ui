import type { Metadata } from "next";

import { ProductsView } from "@/features/catalog/components/ProductsView";

export const metadata: Metadata = {
  title: "Productos",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <ProductsView />
    </div>
  );
}
