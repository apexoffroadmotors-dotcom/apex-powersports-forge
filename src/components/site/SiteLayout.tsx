import { useEffect, useState, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowUp, MessageCircle } from "lucide-react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { SITE, whatsappHref } from "@/lib/site";

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!visible) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-5 z-40 grid h-11 w-11 place-items-center border-2 border-ink bg-card text-foreground shadow-none transition-colors hover:bg-accent"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

function WhatsAppButton() {
  return (
    <a
      href={whatsappHref(`Hi ${SITE.name}, I'd like to ask about your inventory.`)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-5 z-40 flex items-center gap-2 border-2 border-ink bg-accent px-4 py-3 text-accent-foreground transition-transform hover:-translate-y-0.5"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={18} />
      <span className="micro-label hidden sm:inline">WhatsApp</span>
    </a>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <BackToTop />
    </div>
  );
}
