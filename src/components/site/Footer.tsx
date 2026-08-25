import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Phone, Youtube } from "lucide-react";
import { NewsletterForm } from "./Newsletter";
import { SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl">APEX OFFROAD MOTORS</p>
          <p className="mt-3 max-w-md text-sm opacity-80">{SITE.tagline}</p>
          <div className="mt-6">
            <p className="micro-label mb-3 opacity-70">Ride reports & new arrivals</p>
            <NewsletterForm compact />
          </div>
        </div>

        <div>
          <p className="micro-label mb-4 opacity-70">Explore</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/shop" className="hover:underline">
                Inventory
              </Link>
            </li>
            <li>
              <Link to="/financing" className="hover:underline">
                Financing
              </Link>
            </li>
            <li>
              <Link to="/reviews" className="hover:underline">
                Reviews
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:underline">
                Journal
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                About us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="micro-label mb-4 opacity-70">Contact</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} aria-hidden />
              <a href={`mailto:${SITE.email}`} className="hover:underline">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} aria-hidden />
              <a href={`tel:${SITE.phone}`} className="hover:underline">
                {SITE.phone}
              </a>
            </li>
            <li className="opacity-80">Serving riders nationwide across the United States</li>
          </ul>
          <div className="mt-5 flex gap-3">
            <a href={SITE.social.facebook} aria-label="Facebook" className="border-2 border-primary-foreground/40 p-2 hover:bg-accent hover:text-accent-foreground">
              <Facebook size={16} />
            </a>
            <a href={SITE.social.instagram} aria-label="Instagram" className="border-2 border-primary-foreground/40 p-2 hover:bg-accent hover:text-accent-foreground">
              <Instagram size={16} />
            </a>
            <a href={SITE.social.youtube} aria-label="YouTube" className="border-2 border-primary-foreground/40 p-2 hover:bg-accent hover:text-accent-foreground">
              <Youtube size={16} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 px-4 py-5 text-center text-xs opacity-70 sm:px-6">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  );
}
