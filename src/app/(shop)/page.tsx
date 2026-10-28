import type { Metadata } from "next";

import { Hero } from "@/components/landing/Hero";

export const metadata: Metadata = {
  title: "Inicio",
};

export default function HomePage() {
  return (
    <>
      <Hero />
    </>
  );
}
