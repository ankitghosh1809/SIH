import { useEffect, useRef, useState } from "react";

/**
 * Fades a section in as it scrolls into view. Content is visible by
 * default — the "revealed" flag only ever starts a hidden→visible
 * transition, it never hides content that JS fails to run for — and the
 * effect is skipped entirely under prefers-reduced-motion, matching the
 * app-wide "low motion by default" direction in index.css. Marketing-page
 * use only; workflow pages intentionally stay static.
 */
export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
