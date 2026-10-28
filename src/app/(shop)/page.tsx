import type { Metadata } from "next";

import { EndpointList } from "@/components/landing/EndpointList";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { Hero } from "@/components/landing/Hero";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeatureGrid />

      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Endpoints integrados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              La interfaz consume los endpoints reales de{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                ecommerce-api
              </code>
              .
            </p>
          </div>
          <Badge variant="outline">Spring Boot · JWT</Badge>
        </div>
        <EndpointList />
      </section>
    </>
  );
}
