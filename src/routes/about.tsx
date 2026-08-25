import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Truck, Wrench, Users } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";
import { JsonLd, organizationSchema, seo } from "@/lib/seo";
import { SITE } from "@/lib/site";
import showroom from "@/assets/showroom.jpg";

export const Route = createFileRoute("/about")({
  head: () =>
    seo({
      title: "About Apex Offroad Motors | Powersports Specialists",
      description:
        "Apex Offroad Motors is a powersports-only dealership: hand-inspected ATVs and side-by-sides, transparent pricing and enclosed delivery across the United States.",
      path: "/about",
    }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: BadgeCheck,
    title: "Inspected, not flipped",
    body: "Every unit passes a 42-point mechanical and frame inspection before it is listed. If it fails, we do not sell it.",
  },
  {
    icon: Truck,
    title: "Delivered enclosed",
    body: "Machines ship in enclosed transport with tie-down photos sent before the truck leaves the yard.",
  },
  {
    icon: Wrench,
    title: "Service you can call",
    body: "Real technicians answer the phone. Setup, jetting, gearing and accessory questions included.",
  },
  {
    icon: Users,
    title: "No commission games",
    body: "Fixed, published pricing. No doc-fee surprises, no four-square worksheets, no pressure.",
  },
];

const STATS = [
  { value: "3,400+", label: "Machines delivered" },
  { value: "48", label: "States served" },
  { value: "4.9/5", label: "Average rating" },
  { value: "12 yrs", label: "In powersports" },
];

function AboutPage() {
  return (
    <SiteLayout>
      <JsonLd data={organizationSchema} />

      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="micro-label text-accent">About us</p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] sm:text-5xl">
              WE ONLY SELL THINGS WE'D RIDE
            </h1>
            <p className="mt-5 max-w-prose text-sm text-primary-foreground/80">
              {SITE.name} started in a two-bay shop with one used utility quad and a stubborn belief
              that powersports buyers deserve the same transparency car buyers finally got. Today we
              stock sport quads, utility workhorses, youth machines and side-by-sides — and we still
              inspect every single one ourselves.
            </p>
          </div>
          <img
            src={showroom}
            alt="Apex Offroad Motors showroom with ATVs lined up under warm light"
            className="border-2 border-ink object-cover"
            loading="lazy"
          />
        </div>
      </section>

      <section className="border-b-2 border-ink bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-ink sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-background px-4 py-8 text-center">
              <p className="font-display text-3xl text-primary">{s.value}</p>
              <p className="micro-label mt-2 text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl text-foreground">HOW WE OPERATE</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.05}>
              <div className="h-full border-2 border-ink bg-card p-5">
                <v.icon className="text-primary" size={22} />
                <h3 className="mt-3 font-display text-lg text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t-2 border-ink bg-surface text-surface-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4 py-14 sm:px-6">
          <h2 className="font-display text-3xl">READY TO SEE WHAT'S IN STOCK?</h2>
          <div className="flex gap-3">
            <Link
              to="/shop"
              className="micro-label border-2 border-ink bg-accent px-5 py-3 text-accent-foreground"
            >
              View inventory
            </Link>
            <Link
              to="/contact"
              className="micro-label border-2 border-accent px-5 py-3 text-surface-foreground"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
