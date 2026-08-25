import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { seo } from "@/lib/seo";
import { SITE, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/checkout/success")({
  head: () =>
    seo({
      title: "Order Received | Apex Offroad Motors",
      description:
        "Your ATV order request is in. A specialist will contact you shortly to confirm pricing, delivery and paperwork.",
      path: "/checkout/success",
    }),
  component: SuccessPage,
});

function SuccessPage() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <CheckCircle2 className="mx-auto text-primary" size={56} />
        <h1 className="mt-6 font-display text-4xl text-foreground">ORDER RECEIVED</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Thanks for choosing {SITE.name}. A specialist is reviewing your request and will reach out
          by email or phone to confirm availability, delivery window and payment options. Nothing has
          been charged.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            className="micro-label border-2 border-ink bg-primary px-5 py-3 text-primary-foreground"
          >
            Keep browsing
          </Link>
          <a
            href={whatsappHref("Hi Apex Offroad, I just placed an order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="micro-label border-2 border-ink bg-accent px-5 py-3 text-accent-foreground"
          >
            Message on WhatsApp
          </a>
        </div>
      </div>
    </SiteLayout>
  );
}
