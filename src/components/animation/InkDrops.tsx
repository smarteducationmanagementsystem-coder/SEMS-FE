"use client";

/**
 * InkDrops — click on EMPTY space and an ink drop falls, splashes and the page starts
 * filling with ink from the bottom of the screen. Every click adds more ink.
 *
 *  - Empty space reacts: the page background, and white or grey padding where no
 *    letters are drawn. Links, buttons and fields keep their own clicks.
 *  - Hold on that empty space and the ink keeps dripping. A tap drops once.
 *  - The ink sits BEHIND the page: cards, type and buttons stay on top of it, so the
 *    ivory background, the gaps between cards, and the empty space under them all fill.
 *    Scrolling keeps that background filled. Esc or "Drain the ink" empties it.
 *
 * No library: one fixed <canvas>, a 1D water-surface simulation and falling drops.
 *
 * Usage: just render it once anywhere on the Services page:
 *   <InkDrops />
 *
 * Props
 *   inkColor    ink colour (default light sky)
 *   mode        "auto" (default) | "behind" | "over"
 *               "over" draws the ink on top and inverts what is under it (always visible
 *               fallback if some wrapper with its own background hides the ink).
 *   dropVolume  how much one drop raises the ink, as a fraction of screen height (0.06)
 */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  inkColor?: string;
  mode?: "auto" | "behind" | "over";
  dropVolume?: number;
};

type Drop = { x: number; y: number; vy: number; age: number; r: number };
type Part = { x: number; y: number; vx: number; vy: number; r: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ---------------- "is this empty space?" ---------------- */

const INTERACTIVE =
  "a,button,input,textarea,select,label,summary,img,picture,video,iframe,canvas,svg,nextjs-portal," +
  "[role='button'],[role='link'],[contenteditable='true'],[data-ink-ignore]";

const pointOnText = (el: Element, x: number, y: number) => {
  const pad = 3;
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType !== 3 || !node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = range.getClientRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad) return true;
    }
  }
  return false;
};

const isEmptySpace = (target: EventTarget | null, x: number, y: number) => {
  const el = target as Element | null;
  if (!el || !(el instanceof Element)) return false;
  if (el.closest(INTERACTIVE)) return false;
  if (pointOnText(el, x, y)) return false;
  // White and grey boxes still count when the pointer is in their blank padding.
  return true;
};

/* ---------------- component ---------------- */

export default function InkDrops({ inkColor = "#b7e6ff", mode = "auto", dropVolume = 0.06 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drainRef = useRef<() => void>(() => {});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const COL = 8; // px per water column
    let W = 0;
    let H = 0;
    let dpr = 1;
    let n = 0;
    let d = new Float32Array(0); // surface displacement (px, + = up)
    let vv = new Float32Array(0);
    let ld = new Float32Array(0);
    let rd = new Float32Array(0);
    let level = 0; // 0..1 of screen height
    let target = 0;
    const drops: Drop[] = [];
    const parts: Part[] = [];
    let ink = inkColor;
    let raf = 0;
    let running = false;
    let last = 0;
    let acc = 0;
    let disposed = false;
    let lastVis = false;

    const applyMode = () => {
      // Behind the page. Cards and type paint above it, so scrolling cannot leave
      // ivory patches where a raised layer used to be.
      const invert = mode === "over";
      canvas.style.zIndex = invert ? "2147483000" : "-1";
      canvas.style.mixBlendMode = invert ? "difference" : "normal";
      ink = invert ? "#ffffff" : inkColor;
    };

    /* ----- water surface ----- */
    const yAt = (x: number) => {
      const f = x / COL + 1;
      const i = clamp(Math.floor(f), 0, n - 2);
      const t = clamp(f - i, 0, 1);
      return H * (1 - level) - (d[i] * (1 - t) + d[i + 1] * t);
    };

    const stepWaves = () => {
      const K = 0.03, D = 0.04, S = 0.22;
      for (let i = 0; i < n; i++) {
        vv[i] += -K * d[i] - D * vv[i];
        d[i] += vv[i];
      }
      for (let pass = 0; pass < 4; pass++) {
        for (let i = 0; i < n; i++) {
          ld[i] = i > 0 ? S * (d[i] - d[i - 1]) : 0;
          rd[i] = i < n - 1 ? S * (d[i] - d[i + 1]) : 0;
        }
        for (let i = 0; i < n; i++) {
          if (i > 0) { vv[i - 1] += ld[i]; d[i - 1] += ld[i]; }
          if (i < n - 1) { vv[i + 1] += rd[i]; d[i + 1] += rd[i]; }
        }
      }
      for (let i = 0; i < n; i++) d[i] = clamp(d[i], -140, 140);
    };

    const kick = (x: number, amount: number) => {
      const c = Math.round(x / COL + 1);
      for (let j = -5; j <= 5; j++) {
        const i = c + j;
        if (i >= 0 && i < n) vv[i] -= amount * Math.exp(-(j * j) / 5);
      }
    };

    /* ----- drawing ----- */
    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (level > 0.002) {
        const surface = (i: number) => H * (1 - level) - d[i];
        ctx.beginPath();
        ctx.moveTo(-COL, H + 4);
        for (let i = 0; i < n; i++) ctx.lineTo((i - 1) * COL, surface(i));
        ctx.lineTo(W + COL * 2, H + 4);
        ctx.closePath();
        ctx.fillStyle = ink;
        ctx.fill();

        // depth: lighter at the surface, still a light sky toward the bottom
        ctx.save();
        ctx.clip();
        const g = ctx.createLinearGradient(0, H * (1 - level) - 40, 0, H);
        g.addColorStop(0, "rgba(255,255,255,0.55)");
        g.addColorStop(1, "rgba(255,255,255,0.08)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        // glossy line along the surface
        if (level < 1) {
          ctx.beginPath();
          for (let i = 0; i < n; i++) {
            const x = (i - 1) * COL;
            if (i === 0) ctx.moveTo(x, surface(i));
            else ctx.lineTo(x, surface(i));
          }
          ctx.strokeStyle = "rgba(255,255,255,0.3)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.fillStyle = ink;
      for (const p of parts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const p of drops) {
        const grow = Math.min(1, p.age / HANG);
        const r = p.r * (0.25 + 0.75 * grow);
        const stretch = p.age < HANG ? 0 : Math.min(30, p.vy * 0.02);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - r * 2.3 - stretch);
        ctx.quadraticCurveTo(p.x + r * 0.95, p.y - r * 0.9, p.x + r, p.y);
        ctx.arc(p.x, p.y, r, 0, Math.PI, false);
        ctx.quadraticCurveTo(p.x - r * 0.95, p.y - r * 0.9, p.x, p.y - r * 2.3 - stretch);
        ctx.fill();
      }

    };

    const notify = () => {
      const vis = level > 0.012;
      if (vis !== lastVis) {
        lastVis = vis;
        setHasInk(vis);
      }
    };

    /* ----- impacts ----- */
    const impact = (x: number, speed: number, vol: number) => {
      const sf = clamp(speed / 1800, 0.25, 1.2);
      kick(x, 16 * sf);
      target = Math.min(1.03, target + vol);
      const count = 4 + Math.round(sf * 6);
      const ys = yAt(x);
      for (let k = 0; k < count; k++) {
        parts.push({
          x: x + (Math.random() - 0.5) * 10,
          y: ys - 2,
          vx: (Math.random() - 0.5) * 340 * sf,
          vy: -(200 + Math.random() * 520) * (0.4 + sf * 0.7),
          r: 1.6 + Math.random() * 3.2,
        });
      }
    };

    /* ----- loop ----- */
    const step = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      const rate = target < level ? 2.2 : 4.5;
      level += (target - level) * (1 - Math.exp(-dt * rate));
      if (Math.abs(target - level) < 0.0006) level = target;

      acc += dt;
      let s = 0;
      while (acc >= 1 / 60 && s < 5) {
        stepWaves();
        acc -= 1 / 60;
        s++;
      }
      if (s === 5) acc = 0;

      for (let k = drops.length - 1; k >= 0; k--) {
        const p = drops[k];
        p.age += dt;
        if (p.age > HANG) {
          p.vy += 2600 * dt;
          p.y += p.vy * dt;
          if (p.y + p.r >= yAt(p.x)) {
            impact(p.x, p.vy, dropVolume);
            drops.splice(k, 1);
          }
        }
      }

      for (let k = parts.length - 1; k >= 0; k--) {
        const p = parts[k];
        p.vy += 2200 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if ((p.vy > 0 && p.y >= yAt(p.x)) || p.x < -20 || p.x > W + 20) {
          if (p.x >= 0 && p.x <= W) kick(p.x, 2.2);
          parts.splice(k, 1);
        }
      }

      let energy = 0;
      for (let i = 0; i < n; i++) energy += Math.abs(vv[i]) + Math.abs(d[i]);

      draw();
      notify();

      const active =
        drops.length > 0 || parts.length > 0 || Math.abs(target - level) > 0.0006 || energy > 0.6;
      if (active) raf = requestAnimationFrame(step);
      else {
        d.fill(0);
        vv.fill(0);
        draw();
        running = false;
      }
    };

    const ensureLoop = () => {
      if (running || disposed) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      n = Math.ceil(W / COL) + 3;
      d = new Float32Array(n);
      vv = new Float32Array(n);
      ld = new Float32Array(n);
      rd = new Float32Array(n);
      draw();
    };

    /* ----- adding ink ----- */
    const addDrop = (x: number, y: number) => {
      applyMode();
      if (reduce) {
        target = Math.min(1.03, target + dropVolume);
        level = target;
        draw();
        notify();
        return;
      }
      if (y >= yAt(x) - 4) {
        impact(x, 900, dropVolume * 0.7); // clicked inside the ink: plop
      } else {
        drops.push({ x, y, vy: 0, age: 0, r: 7 });
      }
      ensureLoop();
    };

    const drain = () => {
      target = 0;
      if (reduce) {
        level = 0;
        draw();
        notify();
        return;
      }
      for (let i = 0; i < n; i++) vv[i] += Math.sin(i * 0.3) * 0.9;
      ensureLoop();
    };
    drainRef.current = drain;

    /* ----- pointer handling ----- */
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let dripTimer: ReturnType<typeof setInterval> | null = null;
    let suppressClick = false;
    let px = 0;
    let py = 0;
    let sx = 0;
    let sy = 0;

    const stopHold = () => {
      if (holdTimer) clearTimeout(holdTimer);
      if (dripTimer) clearInterval(dripTimer);
      holdTimer = null;
      dripTimer = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType !== "touch") return;
      if (!isEmptySpace(e.target, e.clientX, e.clientY)) return;
      px = sx = e.clientX;
      py = sy = e.clientY;
      stopHold();
      holdTimer = setTimeout(() => {
        suppressClick = true;
        addDrop(px, py);
        dripTimer = setInterval(() => addDrop(px + (Math.random() - 0.5) * 14, py), 170);
      }, 380);
    };
    const onPointerMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (Math.hypot(px - sx, py - sy) > 8) stopHold();
    };
    const onPointerEnd = () => stopHold();

    const onClick = (e: MouseEvent) => {
      if (suppressClick) {
        suppressClick = false;
        return;
      }
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (window.getSelection()?.toString()) return; // user is selecting text
      if (!isEmptySpace(e.target, e.clientX, e.clientY)) return;
      addDrop(e.clientX, e.clientY);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") drain();
    };

    resize();
    let scrollFrame = 0;
    const onScroll = () => {
      if (disposed || level <= 0.002 || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        if (!disposed) draw();
      });
    };
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerEnd);
    document.addEventListener("pointercancel", onPointerEnd);
    document.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      stopHold();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerEnd);
      document.removeEventListener("pointercancel", onPointerEnd);
      document.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [mounted, inkColor, mode, dropVolume]);

  if (!mounted) return null;

  return createPortal(
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: -1 }}
      />
      <button
        type="button"
        data-ink-ignore
        onClick={() => drainRef.current()}
        tabIndex={hasInk ? 0 : -1}
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 2147483001,
          padding: "9px 16px",
          borderRadius: 999,
          border: "1px solid rgba(0,0,0,0.15)",
          background: "#ffffff",
          color: "#141414",
          fontSize: 13,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
          opacity: hasInk ? 1 : 0,
          visibility: hasInk ? "visible" : "hidden",
          transition: "opacity 200ms",
        }}
      >
        Drain the ink
      </button>
    </>,
    document.body
  );
}

const HANG = 0.12; // seconds the drop "forms" before it falls
