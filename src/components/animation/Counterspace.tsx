"use client";

/**
 * Counterspace — "the holes inside letters".
 * Pour ink into the counters (the enclosed empty spaces, like inside A, e, o, p) of a
 * big heading. Click a letter  -> its counter fills with ink and sloshes.
 * Hold a letter               -> ink pours in slowly while you hold.
 * Click a filled letter again -> it drains and empties.
 * Move the pointer across     -> the ink in the filled counters sloshes side to side.
 *
 * How it works (no library needed):
 *  1. The word is drawn to an offscreen canvas using the SAME font/weight/colour/tracking
 *     as the heading element, so it matches whatever font your site uses.
 *  2. Pixels are flood-filled from outside; any empty region that is NOT reached is an
 *     enclosed counter. Each counter gets its own mask.
 *  3. Every frame the ink level (spring physics) and a sloshing surface are drawn and
 *     clipped to the counter mask.
 *
 * Usage (replace the old <h1>All services.</h1>, keep the same classes):
 *   <Counterspace text="All services." className="your-heading-classes" />
 */

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";

type Props = {
  text: string;
  /** element to render, default h1 */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** fit the word to the container width (default true) */
  fit?: boolean;
  /** biggest font size in px when fit is on */
  maxFontSize?: number;
  /** ink colour of the liquid; defaults to the heading's text colour */
  inkColor?: string;
};

type Letter = {
  level: number;
  vel: number;
  target: number;
  tilt: number;
  tiltVel: number;
  amp: number;
  phase: number;
  mode: "idle" | "pour";
  pourStart: number;
  sway: number;
};

type Hole = {
  letter: number;
  x: number;
  y: number;
  w: number;
  h: number;
  mask: HTMLCanvasElement;
  buf: HTMLCanvasElement;
  bctx: CanvasRenderingContext2D;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const newLetter = (): Letter => ({
  level: 0, vel: 0, target: 0, tilt: 0, tiltVel: 0, amp: 0, phase: 0,
  mode: "idle", pourStart: 0, sway: 1,
});

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
};

export default function Counterspace({
  text,
  as: Tag = "h1",
  className,
  style,
  fit = true,
  maxFontSize = 220,
  inkColor,
}: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const letters = new Map<number, Letter>(); // survives resizes
    let holes: Hole[] = [];
    let hasHole = new Set<number>();
    let bounds: number[] = [];
    let base: HTMLCanvasElement | null = null;
    let dpr = 1;
    let cssW = 0;
    let textTop = 0;
    let textBottom = 0;
    let ink = "#111";
    let raf = 0;
    let running = false;
    let lastT = 0;
    let disposed = false;
    let lastWidth = 0;
    let buildTimer: ReturnType<typeof setTimeout> | null = null;
    let activeLetter = -1;

    /* ---------------- build: measure, rasterise, find counters ---------------- */
    const build = async () => {
      try {
        await document.fonts.ready;
      } catch {}
      if (disposed) return;

      const cs = getComputedStyle(root);
      ink = inkColor ?? cs.color;
      const avail = Math.floor(root.clientWidth);
      if (avail < 40) return;
      lastWidth = avail;
      dpr = Math.min(2, window.devicePixelRatio || 1);

      const baseFs = parseFloat(cs.fontSize) || 100;
      const ls = cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing) || 0;
      const lsEm = ls / baseFs;
      const fontFor = (px: number) => `${cs.fontStyle} ${cs.fontWeight} ${px}px ${cs.fontFamily}`;
      const setFont = (c: CanvasRenderingContext2D, px: number) => {
        c.font = fontFor(px);
        (c as any).letterSpacing = `${lsEm * px}px`;
        c.textBaseline = "alphabetic";
        c.textAlign = "left";
      };

      const meas = document.createElement("canvas").getContext("2d")!;
      let fs = baseFs;
      if (fit) {
        setFont(meas, 100);
        const w100 = meas.measureText(text).width;
        if (w100 > 0) fs = Math.min(maxFontSize, ((avail - 16) / w100) * 100);
        setFont(meas, fs);
        const fitted = meas.measureText(text).width;
        if (fitted > avail - 16) fs *= (avail - 16) / fitted;
      }
      setFont(meas, fs);
      const natural = meas.measureText(text).width;
      if (natural > avail - 16 && natural > 0) fs *= (avail - 16) / natural;
      try {
        await document.fonts.load(fontFor(fs), text);
      } catch {}
      if (disposed) return;

      setFont(meas, fs);
      const m = meas.measureText(text);
      const pad = 6;
      const asc = Math.ceil(m.actualBoundingBoxAscent);
      const desc = Math.ceil(m.actualBoundingBoxDescent);
      const x0 = pad + m.actualBoundingBoxLeft;
      const baseline = asc + pad;
      const cssH = asc + desc + pad * 2;
      // canvas is only as wide as the word, so the empty space beside it stays truly empty
      cssW = Math.min(avail, Math.ceil(x0 + m.actualBoundingBoxRight + pad));
      textTop = pad;
      textBottom = cssH - pad;

      // character boundaries (css px) used for hit-testing letters
      bounds = [];
      for (let i = 0; i <= text.length; i++) {
        bounds.push(x0 + meas.measureText(text.slice(0, i)).width);
      }

      const W = Math.round(cssW * dpr);
      const H = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.width = W;
      canvas.height = H;

      // visible text layer
      base = document.createElement("canvas");
      base.width = W;
      base.height = H;
      const bc = base.getContext("2d")!;
      bc.setTransform(dpr, 0, 0, dpr, 0, 0);
      setFont(bc, fs);
      bc.fillStyle = ink;
      bc.fillText(text, x0, baseline);

      // detection layer
      const det = document.createElement("canvas");
      det.width = W;
      det.height = H;
      const dc = det.getContext("2d", { willReadFrequently: true })!;
      dc.setTransform(dpr, 0, 0, dpr, 0, 0);
      setFont(dc, fs);
      dc.fillStyle = "#000";
      dc.fillText(text, x0, baseline);
      const data = dc.getImageData(0, 0, W, H).data;

      const solid = new Uint8Array(W * H);
      for (let i = 0; i < solid.length; i++) solid[i] = data[i * 4 + 3] > 100 ? 1 : 0;
      const lab = new Int32Array(W * H);
      const stack = new Int32Array(W * H);

      const flood = (seed: number, id: number) => {
        let sp = 0;
        stack[sp++] = seed;
        lab[seed] = id;
        let minX = W, minY = H, maxX = 0, maxY = 0, count = 0, sumX = 0;
        while (sp) {
          const p = stack[--sp];
          const x = p % W;
          const y = (p - x) / W;
          count++;
          sumX += x;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (x > 0 && !solid[p - 1] && !lab[p - 1]) { lab[p - 1] = id; stack[sp++] = p - 1; }
          if (x < W - 1 && !solid[p + 1] && !lab[p + 1]) { lab[p + 1] = id; stack[sp++] = p + 1; }
          if (y > 0 && !solid[p - W] && !lab[p - W]) { lab[p - W] = id; stack[sp++] = p - W; }
          if (y < H - 1 && !solid[p + W] && !lab[p + W]) { lab[p + W] = id; stack[sp++] = p + W; }
        }
        return { minX, minY, maxX, maxY, count, sumX };
      };

      // 1 = the outside. Everything empty that is not reached from the border is a counter.
      for (let x = 0; x < W; x++) {
        if (!solid[x] && !lab[x]) flood(x, 1);
        const b = (H - 1) * W + x;
        if (!solid[b] && !lab[b]) flood(b, 1);
      }
      for (let y = 0; y < H; y++) {
        const l = y * W;
        if (!solid[l] && !lab[l]) flood(l, 1);
        const r = l + W - 1;
        if (!solid[r] && !lab[r]) flood(r, 1);
      }

      const found: Hole[] = [];
      const minArea = 24 * dpr * dpr;
      let id = 2;
      for (let p = 0; p < W * H; p++) {
        if (solid[p] || lab[p]) continue;
        const r = flood(p, id);
        const myId = id++;
        if (r.count < minArea) continue;

        const bx = Math.max(0, r.minX - 1);
        const by = Math.max(0, r.minY - 1);
        const bw = Math.min(W - bx, r.maxX - r.minX + 3);
        const bh = Math.min(H - by, r.maxY - r.minY + 3);

        // mask = the counter, grown by 1px so no anti-aliased edge is left uncovered
        const mask = document.createElement("canvas");
        mask.width = bw;
        mask.height = bh;
        const mctx = mask.getContext("2d")!;
        const img = mctx.createImageData(bw, bh);
        for (let yy = 0; yy < bh; yy++) {
          for (let xx = 0; xx < bw; xx++) {
            const gx = bx + xx;
            const gy = by + yy;
            const q = gy * W + gx;
            const on =
              lab[q] === myId ||
              (gx > 0 && lab[q - 1] === myId) ||
              (gx < W - 1 && lab[q + 1] === myId) ||
              (gy > 0 && lab[q - W] === myId) ||
              (gy < H - 1 && lab[q + W] === myId);
            if (on) img.data[(yy * bw + xx) * 4 + 3] = 255;
          }
        }
        mctx.putImageData(img, 0, 0);

        const buf = document.createElement("canvas");
        buf.width = bw;
        buf.height = bh;

        // which letter does this counter belong to?
        const cx = r.sumX / r.count / dpr;
        let li = 0;
        for (let i = 0; i < text.length; i++) {
          if (cx >= bounds[i] && cx < bounds[i + 1]) { li = i; break; }
        }
        found.push({ letter: li, x: bx, y: by, w: bw, h: bh, mask, buf, bctx: buf.getContext("2d")! });
      }

      holes = found;
      hasHole = new Set(found.map((h) => h.letter));
      hasHole.forEach((i) => {
        if (!letters.has(i)) letters.set(i, newLetter());
      });
      draw();
      if (hasAnyMotion()) ensureLoop();
    };

    /* ---------------- drawing ---------------- */
    const paint = (h: Hole, L: Letter) => {
      const b = h.bctx;
      b.globalCompositeOperation = "source-over";
      b.clearRect(0, 0, h.w, h.h);
      const lv = Math.min(1, L.level);
      const ripple = L.amp * Math.min(h.h * 0.05, 5 * dpr);
      // as the level approaches full, push the surface above the top so corners fill too
      const push = Math.pow(lv, 8) * (Math.abs(L.tilt) * (h.w / 2) + ripple + 2 * dpr);
      const ySurf = h.h * (1 - lv) - push;
      const surf = (x: number) =>
        ySurf + L.tilt * (x - h.w / 2) + ripple * Math.sin((x / h.w) * Math.PI * 3 + L.phase);

      b.beginPath();
      b.moveTo(0, h.h + 2);
      for (let x = 0; x <= h.w; x += 3) b.lineTo(x, surf(x));
      b.lineTo(h.w, surf(h.w));
      b.lineTo(h.w, h.h + 2);
      b.closePath();
      b.fillStyle = ink;
      b.fill();

      if (lv < 0.96) {
        b.beginPath();
        for (let x = 0; x <= h.w; x += 3) (x === 0 ? b.moveTo(x, surf(x)) : b.lineTo(x, surf(x)));
        b.strokeStyle = "rgba(255,255,255,0.2)";
        b.lineWidth = 1.6 * dpr;
        b.stroke();
      }

      b.globalCompositeOperation = "destination-in";
      b.drawImage(h.mask, 0, 0);
      ctx.drawImage(h.buf, h.x, h.y);
    };

    const draw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (base) ctx.drawImage(base, 0, 0);
      for (const h of holes) {
        const L = letters.get(h.letter);
        if (L && L.level >= 0.003) paint(h, L);
      }
    };

    /* ---------------- physics loop ---------------- */
    const hasAnyMotion = () => {
      let any = false;
      letters.forEach((L) => {
        if (
          L.mode === "pour" ||
          Math.abs(L.target - L.level) > 0.002 ||
          Math.abs(L.vel) > 0.002 ||
          Math.abs(L.tilt) > 0.002 ||
          Math.abs(L.tiltVel) > 0.01 ||
          L.amp > 0.01
        )
          any = true;
      });
      return any;
    };

    const step = (now: number) => {
      const dt = Math.min(0.04, (now - lastT) / 1000);
      lastT = now;

      letters.forEach((L) => {
        if (L.mode === "pour") {
          L.level = Math.min(1, L.level + 0.55 * dt);
          L.vel = 0;
          L.target = L.level;
          L.amp = Math.max(L.amp, 0.45);
          if (L.level >= 1) L.mode = "idle";
        } else {
          // ink level: slightly under-damped spring so it overshoots a little
          const a = 16 * (L.target - L.level) - 6 * L.vel;
          L.vel += a * dt;
          L.level += L.vel * dt;
          if (L.level < 0) { L.level = 0; L.vel = 0; }
          if (L.level > 1.04) { L.level = 1.04; L.vel *= -0.3; }
        }
        // moving ink makes the surface rock
        L.tiltVel += L.sway * L.vel * dt * 2.4;
        const ta = -55 * L.tilt - 3.6 * L.tiltVel;
        L.tiltVel += ta * dt;
        L.tilt = clamp(L.tilt + L.tiltVel * dt, -0.5, 0.5);
        L.amp *= Math.exp(-dt * 2.2);
        L.phase += dt * 10;

        if (L.mode !== "pour") {
          if (Math.abs(L.tilt) < 0.002 && Math.abs(L.tiltVel) < 0.01) { L.tilt = 0; L.tiltVel = 0; }
          if (Math.abs(L.target - L.level) < 0.002 && Math.abs(L.vel) < 0.002) {
            L.level = L.target;
            L.vel = 0;
          }
          if (L.amp < 0.01) L.amp = 0;
        }
      });

      draw();
      if (hasAnyMotion()) raf = requestAnimationFrame(step);
      else running = false;
    };

    const ensureLoop = () => {
      if (running || disposed) return;
      running = true;
      lastT = performance.now();
      raf = requestAnimationFrame(step);
    };

    /* ---------------- pointer interaction ---------------- */
    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * cssW, y: e.clientY - r.top };
    };
    const letterAt = (x: number, y: number) => {
      if (y < textTop - 12 || y > textBottom + 12) return -1;
      for (let i = 0; i < text.length; i++) {
        if (x >= bounds[i] && x < bounds[i + 1]) return hasHole.has(i) ? i : -1;
      }
      return -1;
    };

    const onDown = (e: PointerEvent) => {
      const { x, y } = toLocal(e);
      const i = letterAt(x, y);
      if (i < 0) return;
      const L = letters.get(i);
      if (!L) return;
      canvas.setPointerCapture(e.pointerId);
      activeLetter = i;
      L.sway = Math.random() > 0.5 ? 1 : -1;

      if (reduce) {
        L.target = L.level > 0.5 ? 0 : 1;
        L.level = L.target;
        draw();
        return;
      }

      if (L.level > 0.97 || (L.target === 1 && L.level > 0.5)) {
        // click on a filled letter: empty it
        L.mode = "idle";
        L.target = 0;
        L.tiltVel += L.sway * 1.2;
      } else {
        // start pouring; a quick tap completes the fill on release
        L.mode = "pour";
        L.pourStart = performance.now();
        L.tiltVel += L.sway * 1.6;
        L.amp = 0.6;
      }
      ensureLoop();
    };

    const release = () => {
      if (activeLetter < 0) return;
      const L = letters.get(activeLetter);
      activeLetter = -1;
      if (!L || L.mode !== "pour") return;
      const held = performance.now() - L.pourStart;
      L.mode = "idle";
      if (held < 260) {
        L.target = 1; // tap: fill it all the way
      } else {
        L.target = L.level; // hold: stop where it is
        L.vel = 0;
      }
      ensureLoop();
    };

    const onMove = (e: PointerEvent) => {
      const { x, y } = toLocal(e);
      canvas.style.cursor = letterAt(x, y) >= 0 ? "pointer" : "default";
      if (reduce) return;
      // sweeping the pointer sloshes whatever ink is in there
      const push = clamp(e.movementX * 0.02, -1.2, 1.2);
      if (Math.abs(push) < 0.01) return;
      let any = false;
      letters.forEach((L) => {
        if (L.level > 0.02) {
          L.tiltVel += push;
          L.amp = Math.max(L.amp, 0.25);
          any = true;
        }
      });
      if (any) ensureLoop();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", release);
    canvas.addEventListener("pointercancel", release);

    /* ---------------- rebuild triggers ---------------- */
    const scheduleBuild = () => {
      if (buildTimer) clearTimeout(buildTimer);
      buildTimer = setTimeout(build, 80);
    };
    const ro = new ResizeObserver(() => {
      if (Math.abs(root.clientWidth - lastWidth) > 1) scheduleBuild();
    });
    ro.observe(root);
    const mo = new MutationObserver(scheduleBuild); // light/dark theme switch
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    document.fonts?.addEventListener?.("loadingdone", scheduleBuild);

    build();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (buildTimer) clearTimeout(buildTimer);
      ro.disconnect();
      mo.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", scheduleBuild);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", release);
      canvas.removeEventListener("pointercancel", release);
    };
  }, [text, fit, maxFontSize, inkColor]);

  return (
    <Tag
      ref={rootRef}
      className={className}
      style={{ position: "relative", margin: 0, minHeight: 96, maxWidth: "100%", ...style }}
    >
      <span style={srOnly}>{text}</span>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: "block", maxWidth: "100%", touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none" }}
      />
    </Tag>
  );
}
