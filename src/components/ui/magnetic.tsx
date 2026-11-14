"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { classNames } from "@/lib/format";

interface MagneticProps {
  children: ReactNode;
  /** Fraction of the cursor's distance from the centre that the element follows (Ahmed Javed's buttons use ~0.3). */
  strength?: number;
  /**
   * Hard limit on travel in pixels. Keeps neighbouring buttons from colliding:
   * keep it below the gap between buttons placed side by side.
   */
  maxOffset?: number;
  className?: string;
}

/** Fast follow while the cursor moves, slow springy settle when it leaves. */
const FOLLOW_DURATION = "250ms";
const RELEASE_DURATION = "800ms";

function clampOffset(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

/**
 * Pulls its child a limited distance toward the cursor in any direction and
 * eases back on leave. The element's rest position is measured on pointer
 * enter, so the moving element never feeds back into the calculation.
 * Only reacts to a real mouse, and does nothing for reduced-motion users.
 */
export function Magnetic({ children, strength = 0.3, maxOffset = 10, className }: MagneticProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const restRectRef = useRef<DOMRect | null>(null);

  function isEnabled(event: PointerEvent): boolean {
    return event.pointerType === "mouse" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function handlePointerEnter(event: PointerEvent<HTMLSpanElement>) {
    if (!isEnabled(event) || !elementRef.current) return;
    restRectRef.current = elementRef.current.getBoundingClientRect();
  }

  function handlePointerMove(event: PointerEvent<HTMLSpanElement>) {
    const element = elementRef.current;
    const restRect = restRectRef.current;
    if (!element || !restRect || !isEnabled(event)) return;
    const offsetX = clampOffset((event.clientX - (restRect.left + restRect.width / 2)) * strength, maxOffset);
    const offsetY = clampOffset((event.clientY - (restRect.top + restRect.height / 2)) * strength, maxOffset);
    element.style.transitionDuration = FOLLOW_DURATION;
    // Lift the active element above its neighbours in case they still meet.
    element.style.zIndex = "10";
    element.style.transform = `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0)`;
  }

  function handlePointerLeave() {
    const element = elementRef.current;
    restRectRef.current = null;
    if (!element) return;
    element.style.transitionDuration = RELEASE_DURATION;
    element.style.transform = "";
    element.style.zIndex = "";
  }

  return (
    <span
      ref={elementRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={classNames("relative inline-flex transition-transform ease-[var(--ease-editorial)] will-change-transform", className)}
    >
      {children}
    </span>
  );
}
