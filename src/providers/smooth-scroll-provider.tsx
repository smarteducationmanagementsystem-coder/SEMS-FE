"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerLenis } from "@/lib/smooth-scroll";

/**
 * Enables inertial smooth scrolling with Lenis. Lenis still moves the real
 * window scroll position, so sticky elements, scroll listeners and the pinned
 * editorial section keep working. Skipped entirely for reduced-motion users,
 * and scrolling inside dialogs (drawers, menu) stays native.
 */
export function SmoothScrollProvider() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.1,
      autoRaf: true,
      anchors: true,
      prevent: (node) => node.closest("dialog, #admin-frame") !== null,
    });
    registerLenis(lenis);

    return () => {
      registerLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
