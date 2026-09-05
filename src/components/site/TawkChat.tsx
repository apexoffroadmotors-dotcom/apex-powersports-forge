import { useEffect } from "react";

export function TawkChat() {
  useEffect(() => {
    if (typeof window === "undefined" || (window as unknown as Record<string, unknown>)['Tawk_API']) {
      return;
    }

    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = "https://embed.tawk.to/6a9badcf27a69434428b780f/default";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    const s0 = document.getElementsByTagName("script")[0];
    if (s0?.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.body.appendChild(s1);
    }
  }, []);

  return null;
}
