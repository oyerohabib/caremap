import { ArrowRightIcon, ClipboardListIcon } from "lucide-react";
import Link from "next/link";
import { HeroFigure } from "@/components/landing/hero-figure";
import { PhoneQr } from "@/components/landing/phone-qr";
import { brandCssVars } from "@/lib/brand";
import { DEMO_TENANTS } from "@/lib/tenants";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 grid-rows-[minmax(300px,42dvh)_auto] gap-6 px-5 pb-[max(env(safe-area-inset-bottom),2rem)] md:grid-cols-[1.1fr_1fr] md:grid-rows-1 md:items-center md:gap-12 md:py-12">
      <section className="relative md:order-2 md:h-[min(78dvh,720px)]" aria-hidden="false">
        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white to-stone-100 md:inset-4" />
        <HeroFigure />
      </section>

      <section className="flex flex-col gap-7 md:order-1">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            CareMap · telehealth intake demo
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Tap where it hurts.
          </h1>
          <p className="max-w-prose text-base text-pretty text-muted-foreground md:text-lg">
            Patients point to their symptoms on a 3D body, see exactly how their intake was
            triaged and why, and clinicians get a structured record on the same map.
          </p>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2" aria-label="Demo clinics">
          {DEMO_TENANTS.map((tenant) => (
            <li
              key={tenant.slug}
              style={brandCssVars({ primary: tenant.primaryColor, accent: tenant.accentColor })}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="size-3 rounded-full bg-brand ring-4 ring-brand-accent/25" aria-hidden="true" />
                <div>
                  <p className="font-medium">{tenant.name}</p>
                  <p className="text-xs text-muted-foreground">{tenant.tagline}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/t/${tenant.slug}/intake`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-brand/40 focus-visible:outline-none"
                >
                  Start intake <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  href={`/t/${tenant.slug}/provider`}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-brand/40 focus-visible:outline-none"
                >
                  <ClipboardListIcon className="size-4" aria-hidden="true" /> Provider view
                </Link>
              </div>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <PhoneQr />
        </div>
      </section>
    </main>
  );
}
