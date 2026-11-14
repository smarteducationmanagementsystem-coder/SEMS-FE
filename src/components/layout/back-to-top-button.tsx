"use client";

import { ArrowUp } from "lucide-react";
import { Magnetic } from "@/components/ui/magnetic";
import { scrollWindowTo } from "@/lib/smooth-scroll";

/** Smoothly scrolls back to the top of the page (instantly for reduced-motion users). */
export function BackToTopButton() {
  return (
    <Magnetic strength={0.4} maxOffset={8}>
      <button
      type="button"
      onClick={() => scrollWindowTo(0)}
      aria-label="Back to top"
      className="group grid size-12 place-items-center rounded-full border-[1.5px] border-ivory/30 text-ivory transition-[background-color,color,border-color] duration-300 hover:border-brand hover:bg-brand hover:text-white"
    >
      <ArrowUp aria-hidden="true" className="size-4 transition-transform duration-500 ease-[var(--ease-editorial)] group-hover:-translate-y-0.5" />
      </button>
    </Magnetic>
  );
}
