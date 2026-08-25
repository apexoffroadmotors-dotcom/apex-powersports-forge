export const SITE = {
  name: "Apex Offroad Motors",
  shortName: "Apex Offroad",
  url: "https://apexoffroadmotors.com",
  email: "info@apexoffroadmotors.com",
  /** Update this to the real business line; used for tel:, WhatsApp and schema. */
  phone: "+1XXXXXXXXXX",
  region: "United States",
  tagline: "Premium ATVs, side-by-sides and powersports machines shipped across the United States.",
  social: {
    facebook: "https://facebook.com/apexoffroadmotors",
    instagram: "https://instagram.com/apexoffroadmotors",
    youtube: "https://youtube.com/@apexoffroadmotors",
    x: "https://x.com/apexoffroad",
  },
  /** formsubmit.co endpoint used for contact + order notifications */
  formEndpoint: "https://formsubmit.co/ajax/info@apexoffroadmotors.com",
} as const;

export const whatsappHref = (message?: string) =>
  `https://wa.me/${SITE.phone.replace(/[^0-9]/g, "")}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

export const formatPrice = (value: number | string | null | undefined) => {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
};

export const TYPE_LABELS: Record<string, string> = {
  sport: "Sport ATV",
  utility: "Utility ATV",
  youth: "Youth ATV",
  side_by_side: "Side-by-Side",
};

export const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  used: "Used",
  certified_pre_owned: "Certified Pre-Owned",
};

export const STATUS_LABELS: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};
