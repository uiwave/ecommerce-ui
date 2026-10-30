"use client";

import Link from "next/link";

import { ArrowRight, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative grid items-center gap-8 py-16 lg:grid-cols-2 lg:py-24 xl:py-37.5">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xl sm:text-2xl">
            Revela tu belleza natural con cuidado experto
          </p>
          <h1 className="text-3xl leading-[1.2] font-medium md:text-[75px] lg:text-[85px] mt-4">
            Piel sana y
            <br />
            brillo radiante
          </h1>
          <p className="mt-5 max-w-xl text-base sm:text-lg">
            La piel sana es la base de una belleza duradera. Cuando está bien
            nutrida, protegida y cuidada, brilla con confianza y vitalidad.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-7">
            <Link
              href="#"
              className="group inline-flex items-center gap-3.5 rounded-full bg-primary py-1.5 pr-1.5 pl-7.5 transition-colors hover:bg-primary/80"
            >
              <span className="text-base font-semibold text-white">
                Solicitar cotización
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#222222] transition-colors group-hover:bg-white/20">
                <ArrowRight className="h-5 w-5 text-white" />
              </span>
            </Link>
            <a
              href="https://www.youtube.com/watch?v=Get7rqXYrbQ"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3"
            >
              <span className="flex size-15 items-center justify-center rounded-full border border-primary/40 bg-background transition-colors group-hover:bg-primary">
                <Play className="ml-0.5 h-5 w-5 fill-primary text-primary transition-colors group-hover:fill-white group-hover:text-white" />
              </span>
              <span className="text-xl font-medium text-primary">
                Ver video
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
