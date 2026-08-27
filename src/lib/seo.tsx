import { SITE } from "./site";

type MetaArgs = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: string;
};

/** Build head() meta + canonical link for a route. */
export function seo({ title, description, path, image, type = "website" }: MetaArgs) {
  const canonical = `${SITE.url}${path === "/" ? "" : path}`;
  // Default social preview image for every route (absolute URL required by crawlers).
  const ogImage = image ?? `${SITE.url}/og-image.png`;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: canonical },
    { property: "og:site_name", content: SITE.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:image", content: ogImage },
  ];
  return {
    meta,
    links: [{ rel: "canonical", href: canonical }],
  };
}

/** Renders a JSON-LD structured data block. */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  name: SITE.name,
  url: SITE.url,
  email: SITE.email,
  telephone: SITE.phone,
  areaServed: "US",
  address: { "@type": "PostalAddress", addressCountry: "US" },
  sameAs: Object.values(SITE.social),
};
