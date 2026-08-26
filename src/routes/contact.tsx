import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle2, Facebook, Instagram, Mail, MessageCircle, Phone, Youtube } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { JsonLd, seo } from "@/lib/seo";
import { SITE, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: "Contact Us | Apex Offroad Motors",
      description:
        "Get in touch with Apex Offroad Motors for sales, financing, service or delivery questions. Call, WhatsApp or send a message — a real technician replies.",
      path: "/contact",
    }),
  component: ContactPage,
});

const TOPICS = ["General question", "Buying a machine", "Financing", "Service & parts", "Trade-in", "Delivery"];

const FAQ = [
  {
    q: "How fast do you reply?",
    a: "Within one business day, usually much sooner during business hours. WhatsApp messages get the fastest response.",
  },
  {
    q: "Can I trade in my current machine?",
    a: "Yes. Send us photos, hours and condition notes and we'll give you a trade estimate before you commit to anything.",
  },
  {
    q: "Do you ship outside your state?",
    a: "We ship enclosed nationwide across the lower 48. Delivery timing depends on distance and carrier availability.",
  },
  {
    q: "Can I come see a machine in person?",
    a: "Absolutely — message us to schedule a viewing or demo ride before you buy.",
  },
];

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(40).optional().default(""),
  topic: z.string().trim().max(60).optional().default("General question"),
  message: z.string().trim().min(10, "Tell us a little more").max(2000),
});

function ContactPage() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (String(fd.get("company") ?? "")) return; // honeypot
    const parsed = schema.safeParse(Object.fromEntries(fd) as Record<string, string>);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await fetch(SITE.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New contact message — ${parsed.data.topic}`,
          ...parsed.data,
        }),
      });
      setDone(true);
    } catch {
      toast.error("Message couldn't be sent right now. Try WhatsApp or phone instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: `${SITE.url}/contact`,
          about: {
            "@type": "AutoDealer",
            name: SITE.name,
            email: SITE.email,
            telephone: SITE.phone,
            areaServed: "US",
          },
        }}
      />

      <section className="border-b-2 border-ink bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <p className="micro-label text-accent">Contact</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">
            TALK TO A REAL TECHNICIAN
          </h1>
          <p className="mt-4 max-w-xl text-sm text-primary-foreground/80">
            No call centers, no scripts. Sales, financing and service questions all go straight
            to someone who knows these machines.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-5">
          <div className="border-2 border-ink bg-card p-6">
            <p className="micro-label text-muted-foreground">Email</p>
            <a href={`mailto:${SITE.email}`} className="mt-2 flex items-center gap-2 font-display text-lg text-foreground hover:text-primary">
              <Mail size={18} className="text-primary" /> {SITE.email}
            </a>
          </div>
          <div className="border-2 border-ink bg-card p-6">
            <p className="micro-label text-muted-foreground">Phone</p>
            <a href={`tel:${SITE.phone}`} className="mt-2 flex items-center gap-2 font-display text-lg text-foreground hover:text-primary">
              <Phone size={18} className="text-primary" /> {SITE.phone}
            </a>
          </div>
          <div className="border-2 border-ink bg-primary p-6 text-primary-foreground">
            <p className="micro-label text-accent">Fastest response</p>
            <a
              href={whatsappHref(`Hi ${SITE.name}, I have a question.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 border-2 border-primary-foreground px-5 py-3 text-sm font-semibold transition-colors hover:bg-primary-foreground hover:text-primary"
            >
              <MessageCircle size={18} /> Chat on WhatsApp
            </a>
          </div>
          <div className="border-2 border-ink bg-card p-6">
            <p className="micro-label text-muted-foreground">Coverage</p>
            <p className="mt-2 text-sm text-foreground">
              Serving riders nationwide across the United States with enclosed delivery.
            </p>
            <div className="mt-5 flex gap-3">
              <a href={SITE.social.facebook} aria-label="Facebook" className="border-2 border-ink p-2 text-foreground hover:bg-accent">
                <Facebook size={16} />
              </a>
              <a href={SITE.social.instagram} aria-label="Instagram" className="border-2 border-ink p-2 text-foreground hover:bg-accent">
                <Instagram size={16} />
              </a>
              <a href={SITE.social.youtube} aria-label="YouTube" className="border-2 border-ink p-2 text-foreground hover:bg-accent">
                <Youtube size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-2 border-ink bg-card p-6 sm:p-8">
          {done ? (
            <div className="flex h-full flex-col items-center justify-center py-14 text-center">
              <CheckCircle2 className="text-primary" size={44} />
              <h2 className="mt-4 font-display text-2xl text-foreground">Message sent</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Thanks for reaching out — we'll get back to you within one business day.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <h2 className="font-display text-2xl text-foreground">Send us a message</h2>
              <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="ct-name" className="micro-label mb-1 block text-muted-foreground">
                    Full name
                  </label>
                  <input
                    id="ct-name"
                    name="name"
                    type="text"
                    required
                    className="w-full border-2 border-ink bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                  {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="ct-email" className="micro-label mb-1 block text-muted-foreground">
                    Email
                  </label>
                  <input
                    id="ct-email"
                    name="email"
                    type="email"
                    required
                    className="w-full border-2 border-ink bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                  {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="ct-phone" className="micro-label mb-1 block text-muted-foreground">
                    Phone (optional)
                  </label>
                  <input
                    id="ct-phone"
                    name="phone"
                    type="tel"
                    className="w-full border-2 border-ink bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="ct-topic" className="micro-label mb-1 block text-muted-foreground">
                    Topic
                  </label>
                  <select
                    id="ct-topic"
                    name="topic"
                    defaultValue={TOPICS[0]}
                    className="w-full border-2 border-ink bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ct-message" className="micro-label mb-1 block text-muted-foreground">
                  Message
                </label>
                <textarea
                  id="ct-message"
                  name="message"
                  rows={5}
                  required
                  className="w-full border-2 border-ink bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-accent"
                />
                {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="micro-label w-full border-2 border-ink bg-primary px-5 py-4 text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>

      <section className="border-t-2 border-ink bg-background">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-3xl text-foreground">COMMON QUESTIONS</h2>
          <div className="mt-6 divide-y-2 divide-ink border-2 border-ink bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="p-4">
                <summary className="cursor-pointer font-display text-base text-foreground">
                  {f.q}
                </summary>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
