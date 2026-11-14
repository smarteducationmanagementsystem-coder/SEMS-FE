"use client";

/**
 * LampReveal — wraps the About page content.
 * A hanging lamp + wall switch sit on top. Switch ON  -> bulb lights up (with a flicker)
 * and the content is fully visible. Switch OFF -> bulb goes dark and the content falls
 * into the dark (still faintly visible). Flip the switch enough times and the bulb
 * blows: the lamp goes dark until "replace the bulb" fits a new one and turns it on.
 * Grab the lamp to swing it.
 *
 * No external library: SVG + requestAnimationFrame + Web Audio API.
 *
 * Usage:
 *   <LampReveal>
 *     ...existing About page content...
 *   </LampReveal>
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

const PIVOT = { x: 200, y: -40 };
const MAX_SWING = 1.1;
const FLIPS_TO_BREAK = 8;

type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };

type Props = {
  children: ReactNode;
  /** start with the light on (default true so the page is readable on first load) */
  defaultOn?: boolean;
};

export default function LampReveal({ children, defaultOn = true }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lampRef = useRef<SVGGElement>(null);

  const [on, setOn] = useState(defaultOn);
  const [sound, setSound] = useState(true);
  const [narrow, setNarrow] = useState(false);
  const [broken, setBroken] = useState(false);
  const soundRef = useRef(true);
  const flips = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);

  const level = useRef(defaultOn ? 1 : 0);
  const target = useRef(defaultOn ? 1 : 0);
  const flickerUntil = useRef(0);
  const rafLevel = useRef(0);

  const swing = useRef({ th: 0, w: 0, drag: false, off: 0, lastT: 0, lastTh: 0 });
  const rafSwing = useRef(0);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 640px)");
    const apply = () => setNarrow(query.matches);
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  const reduced = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- audio ---------------- */
  const getCtx = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC = window.AudioContext || (window as WindowWithWebkitAudio).webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const playSwitch = useCallback(
    (turningOn: boolean) => {
      if (!soundRef.current) return;
      const ctx = getCtx();
      if (!ctx) return;
      const t = ctx.currentTime;

      // mechanical click
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const n = ctx.createBufferSource();
      n.buffer = buf;
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1800;
      const ng = ctx.createGain();
      ng.gain.value = 0.55;
      n.connect(hp).connect(ng).connect(ctx.destination);
      n.start(t);

      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = "square";
      o.frequency.setValueAtTime(turningOn ? 520 : 300, t);
      o.frequency.exponentialRampToValueAtTime(turningOn ? 180 : 110, t + 0.05);
      og.gain.setValueAtTime(0.12, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      o.connect(og).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.07);

      if (turningOn) {
        // flickering mains hum while the bulb warms up
        const h = ctx.createOscillator();
        const hg = ctx.createGain();
        const lp = ctx.createBiquadFilter();
        h.type = "sawtooth";
        h.frequency.value = 100;
        lp.type = "lowpass";
        lp.frequency.value = 420;
        hg.gain.setValueAtTime(0.0001, t + 0.03);
        for (let i = 0; i < 10; i++) {
          hg.gain.setValueAtTime(Math.random() > 0.45 ? 0.06 : 0.012, t + 0.04 + i * 0.055);
        }
        hg.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);
        h.connect(lp).connect(hg).connect(ctx.destination);
        h.start(t + 0.03);
        h.stop(t + 0.9);
      }
    },
    [getCtx]
  );

  const playBreak = useCallback(() => {
    if (!soundRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.22), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.4);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1800;
    band.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
    noise.connect(band).connect(gain).connect(ctx.destination);
    noise.start(t);

    const pop = ctx.createOscillator();
    const popGain = ctx.createGain();
    pop.type = "sine";
    pop.frequency.setValueAtTime(240, t);
    pop.frequency.exponentialRampToValueAtTime(60, t + 0.12);
    popGain.gain.setValueAtTime(0.28, t);
    popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    pop.connect(popGain).connect(ctx.destination);
    pop.start(t);
    pop.stop(t + 0.18);
  }, [getCtx]);

  /* ---------------- light level (flicker) ---------------- */
  const runLevel = useCallback(() => {
    cancelAnimationFrame(rafLevel.current);
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      let tgt = target.current;
      const flickering = tgt === 1 && now < flickerUntil.current;
      if (flickering) tgt = Math.random() < 0.55 ? 1 : 0.12;
      const rate = tgt > level.current ? 20 : 7;
      level.current += (tgt - level.current) * Math.min(1, dt * rate);
      rootRef.current?.style.setProperty("--lit", level.current.toFixed(3));
      const settled = Math.abs(target.current - level.current) < 0.003 && !flickering;
      if (!settled) {
        rafLevel.current = requestAnimationFrame(step);
      } else {
        level.current = target.current;
        rootRef.current?.style.setProperty("--lit", String(target.current));
      }
    };
    rafLevel.current = requestAnimationFrame(step);
  }, []);

  /* ---------------- lamp pendulum ---------------- */
  const paintLamp = () => {
    lampRef.current?.setAttribute(
      "transform",
      `rotate(${(swing.current.th * 180) / Math.PI} ${PIVOT.x} ${PIVOT.y})`
    );
  };

  const runSwing = useCallback(() => {
    cancelAnimationFrame(rafSwing.current);
    let last = performance.now();
    const step = (now: number) => {
      const s = swing.current;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (!s.drag) {
        const n = 4;
        const h = dt / n;
        for (let i = 0; i < n; i++) {
          const a = -9 * Math.sin(s.th) - 0.45 * s.w;
          s.w += a * h;
          s.th += s.w * h;
        }
      }
      paintLamp();
      if (s.drag || Math.abs(s.th) > 0.0007 || Math.abs(s.w) > 0.003) {
        rafSwing.current = requestAnimationFrame(step);
      } else {
        s.th = 0;
        s.w = 0;
        paintLamp();
      }
    };
    rafSwing.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    // one small nudge on load so people notice the lamp is alive
    if (!reduced()) {
      swing.current.th = 0.11;
      runSwing();
    }
    return () => {
      cancelAnimationFrame(rafLevel.current);
      cancelAnimationFrame(rafSwing.current);
    };
  }, [runSwing]);

  /* ---------------- interactions ---------------- */
  const blowBulb = () => {
    setBroken(true);
    setOn(false);
    level.current = 1;
    rootRef.current?.style.setProperty("--lit", "1");
    target.current = 0;
    flickerUntil.current = 0;
    runLevel();
    playBreak();
    swing.current.w += (Math.random() > 0.5 ? 1 : -1) * 0.9;
    if (!swing.current.drag) runSwing();
  };

  const toggle = () => {
    if (broken) return;
    flips.current += 1;
    if (flips.current >= FLIPS_TO_BREAK) {
      blowBulb();
      return;
    }
    const next = !on;
    setOn(next);
    target.current = next ? 1 : 0;
    flickerUntil.current = next && !reduced() ? performance.now() + 550 : 0;
    runLevel();
    playSwitch(next);
    // the lamp shivers a little when the switch is flipped
    swing.current.w += (Math.random() > 0.5 ? 1 : -1) * 0.45;
    if (!swing.current.drag) runSwing();
  };

  const replaceBulb = () => {
    flips.current = 0;
    setBroken(false);
    setOn(true);
    target.current = 1;
    flickerUntil.current = reduced() ? 0 : performance.now() + 550;
    runLevel();
    playSwitch(true);
    swing.current.w += 0.35;
    if (!swing.current.drag) runSwing();
  };

  const toSvg = (e: PointerEvent) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };
  const angleAt = (p: { x: number; y: number }) => Math.atan2(-(p.x - PIVOT.x), p.y - PIVOT.y);

  const onDown = (e: PointerEvent<SVGCircleElement>) => {
    const s = swing.current;
    e.currentTarget.setPointerCapture(e.pointerId);
    s.drag = true;
    s.off = angleAt(toSvg(e)) - s.th;
    s.lastT = performance.now();
    s.lastTh = s.th;
    s.w = 0;
    e.currentTarget.style.cursor = "grabbing";
    runSwing();
  };
  const onMove = (e: PointerEvent<SVGCircleElement>) => {
    const s = swing.current;
    if (!s.drag) return;
    const th = Math.max(-MAX_SWING, Math.min(MAX_SWING, angleAt(toSvg(e)) - s.off));
    const now = performance.now();
    const dt = (now - s.lastT) / 1000;
    if (dt > 0.008) {
      const inst = (th - s.lastTh) / dt;
      s.w = s.w * 0.5 + inst * 0.5;
      s.lastT = now;
      s.lastTh = th;
    }
    s.th = th;
  };
  const onUp = (e: PointerEvent<SVGCircleElement>) => {
    const s = swing.current;
    if (!s.drag) return;
    s.drag = false;
    s.w = Math.max(-7, Math.min(7, s.w));
    e.currentTarget.style.cursor = "grab";
    runSwing();
  };

  /* ---------------- render ---------------- */
  return (
    <div ref={rootRef} style={{ "--lit": defaultOn ? 1 : 0, width: "100%", maxWidth: "100%", minWidth: 0 } as CSSProperties}>
      <section style={styles.panel} aria-label="Lamp. Use the switch to turn the light on or off.">
        {/* warm room light */}
        <div style={styles.roomGlow} aria-hidden />

        <div style={styles.meta} aria-hidden>
          lamp · <b style={{ color: "#ebe7dc", fontWeight: 500 }}>{broken ? "blown" : on ? "on" : "off"}</b>
        </div>

        <button
          type="button"
          onClick={() => setSound((v) => !v)}
          aria-pressed={sound}
          style={{
            ...styles.sound,
            position: "absolute",
            top: narrow ? 10 : 14,
            right: narrow ? 10 : 16,
            zIndex: 3,
            maxWidth: narrow ? "46%" : undefined,
          }}
        >
          sound: {sound ? "on" : "off"}
        </button>

        <svg
          ref={svgRef}
          viewBox="0 0 400 380"
          style={styles.svg}
          overflow="hidden"
        >
          <defs>
            <linearGradient id="lr-shade" x1="0" x2="1">
              <stop offset="0" stopColor="#17181b" />
              <stop offset="0.35" stopColor="#6a6e75" />
              <stop offset="0.7" stopColor="#2c2e33" />
              <stop offset="1" stopColor="#111214" />
            </linearGradient>
            <linearGradient id="lr-cone" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffd69a" stopOpacity="0.38" />
              <stop offset="1" stopColor="#ffd69a" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="lr-glow">
              <stop offset="0" stopColor="#ffe3b0" stopOpacity="0.9" />
              <stop offset="0.45" stopColor="#ffb860" stopOpacity="0.25" />
              <stop offset="1" stopColor="#ffb860" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="lr-bulb">
              <stop offset="0" stopColor="#fffbe8" />
              <stop offset="0.55" stopColor="#ffd27a" />
              <stop offset="1" stopColor="#e89a3c" />
            </radialGradient>
            <radialGradient id="lr-bulb-off" cx="0.35" cy="0.3">
              <stop offset="0" stopColor="#4a4c52" />
              <stop offset="1" stopColor="#1a1b1e" />
            </radialGradient>
            <linearGradient id="lr-rim" x1="0" x2="1">
              <stop offset="0" stopColor="#ffb866" />
              <stop offset="0.5" stopColor="#ffe9c2" />
              <stop offset="1" stopColor="#ffb866" />
            </linearGradient>
          </defs>

          {/* everything that hangs from the ceiling swings together */}
          <g ref={lampRef}>
            {/* light cone (swings with the shade) */}
            <polygon
              points="150,234 250,234 330,372 70,372"
              fill="url(#lr-cone)"
              style={{ opacity: "var(--lit)" } as CSSProperties}
            />
            {/* cord */}
            <line x1="200" y1="-40" x2="200" y2="150" stroke="#3b3c41" strokeWidth="2" />
            {/* glow behind shade */}
            <circle cx="200" cy="244" r="92" fill="url(#lr-glow)" style={{ opacity: "var(--lit)" } as CSSProperties} />

            {/* bulb */}
            {broken ? (
              <g>
                <circle cx="200" cy="238" r="16" fill="#141518" stroke="#3a3c42" strokeWidth="1" />
                <path d="M190 228 L197 236 L189 244 L198 252" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.1" />
                <path d="M208 230 L201 238 L211 247" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <path className="lr-shard" d="M188 236 L182 242 L190 244 Z" fill="#9aa0a8" />
                <path className="lr-shard lr-shard-b" d="M214 234 L222 240 L214 244 Z" fill="#c5c8ce" />
                <path className="lr-shard lr-shard-c" d="M196 252 L202 264 L190 260 Z" fill="#6e7278" />
              </g>
            ) : (
              <g>
                <circle cx="200" cy="238" r="16" fill="url(#lr-bulb-off)" />
                <circle cx="200" cy="238" r="16" fill="url(#lr-bulb)" style={{ opacity: "var(--lit)" } as CSSProperties} />
                <circle cx="195" cy="244" r="4" fill="#fff" opacity="0.18" />
              </g>
            )}

            {/* shade */}
            <rect x="192" y="146" width="16" height="26" rx="3" fill="#2a2b2f" />
            <path
              d="M118 233 C118 190 158 168 200 168 C242 168 282 190 282 233 Z"
              fill="url(#lr-shade)"
            />
            <ellipse cx="200" cy="233" rx="82" ry="8" fill="#26282c" />
            <ellipse
              cx="200"
              cy="233"
              rx="78"
              ry="5.2"
              fill="url(#lr-rim)"
              style={{ opacity: "var(--lit)" } as CSSProperties}
            />

            {/* grab area */}
            <circle
              cx="200"
              cy="215"
              r="95"
              fill="transparent"
              style={{ cursor: "grab", touchAction: "none" }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            />
          </g>
        </svg>

        {/* wall switch */}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-disabled={broken}
          aria-label={broken ? "Light switch, bulb is blown" : "Light switch"}
          onClick={toggle}
          style={{
            ...styles.plate,
            position: "absolute",
            right: narrow ? 8 : "clamp(14px, 4vw, 56px)",
            top: narrow ? "auto" : "50%",
            bottom: narrow ? 28 : "auto",
            transform: narrow ? "none" : "translateY(-38%)",
            zIndex: 3,
            width: narrow ? 54 : 66,
            opacity: broken ? 0.45 : 1,
            cursor: broken ? "default" : "pointer",
          }}
        >
          <span style={styles.screw} />
          <span style={styles.label}>ON</span>
          <span style={styles.slot}>
            <span
              style={{
                ...styles.rocker,
                transform: `translateY(${on ? -13 : 13}px) perspective(160px) rotateX(${on ? 22 : -22}deg)`,
              }}
            />
          </span>
          <span style={styles.label}>OFF</span>
          <span style={styles.screw} />
          <span
            style={{
              ...styles.led,
              background: on ? "#ffb347" : "#3a3b3f",
              boxShadow: on ? "0 0 8px 2px rgba(255,179,71,0.7)" : "none",
            }}
          />
        </button>

        {broken ? (
          <button
            type="button"
            onClick={replaceBulb}
            style={{
              ...styles.sound,
              position: "absolute",
              left: narrow ? 10 : 16,
              bottom: narrow ? 12 : 16,
              zIndex: 4,
              maxWidth: narrow ? "58%" : undefined,
              color: "#ffe3b0",
              borderColor: "rgba(255,214,154,0.5)",
            }}
          >
            replace the bulb
          </button>
        ) : null}

        {broken ? null : (
          <p style={{ ...styles.hint, fontSize: narrow ? 10 : 11, paddingInline: narrow ? 72 : 16 }} aria-hidden>
            flip the switch · grab the lamp to swing it
          </p>
        )}
      </section>

      <style>{`
        @keyframes lr-shard {
          to { transform: translateY(78px); opacity: 0; }
        }
        .lr-shard { animation: lr-shard 720ms ease-in forwards; }
        .lr-shard-b { animation-duration: 860ms; animation-delay: 40ms; }
        .lr-shard-c { animation-duration: 640ms; }
        @media (prefers-reduced-motion: reduce) {
          .lr-shard { animation: none; opacity: 0; }
        }
      `}</style>

      {/* page content, lit or in the dark */}
      <div style={{ position: "relative", marginTop: 16 }}>
        {children}
        <div aria-hidden style={styles.dark} />
      </div>
    </div>
  );
}

/* ---------------- styles ---------------- */
const mono = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const styles: Record<string, CSSProperties> = {
  panel: {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    height: "auto",
    minHeight: 280,
    overflow: "hidden",
    contain: "inline-size",
    borderRadius: 28,
    background: "#050607",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
    backgroundSize: "56px 56px",
    display: "block",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  roomGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: "radial-gradient(ellipse 60% 70% at 50% 72%, rgba(255,190,110,0.16), transparent 70%)",
    opacity: "var(--lit)",
  },
  meta: {
    position: "absolute",
    top: 16,
    left: 20,
    fontFamily: mono,
    fontSize: 12,
    color: "rgba(235,231,220,0.5)",
  },
  sound: {
    fontFamily: mono,
    fontSize: 12,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.04)",
    color: "#ebe7dc",
    cursor: "pointer",
  },
  svg: { display: "block", width: "100%", maxWidth: 400, minWidth: 0, height: "auto", marginInline: "auto", touchAction: "none", overflow: "hidden" },
  plate: {
    width: 66,
    padding: "10px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    border: "1px solid #2b2c31",
    background: "linear-gradient(180deg,#1d1e22,#141518)",
    boxShadow: "0 10px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
    cursor: "pointer",
  },
  screw: { width: 7, height: 7, borderRadius: "50%", background: "#3b3d42", boxShadow: "inset 0 0 0 1px #17181b" },
  label: { fontFamily: mono, fontSize: 9, letterSpacing: "0.18em", color: "rgba(235,231,220,0.45)" },
  slot: {
    position: "relative",
    width: 34,
    height: 66,
    borderRadius: 7,
    background: "#08090a",
    boxShadow: "inset 0 2px 6px rgba(0,0,0,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rocker: {
    width: 26,
    height: 32,
    borderRadius: 5,
    background: "linear-gradient(180deg,#f2f3f5,#8b8e94 55%,#5c5f65)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.6)",
    transition: "transform 140ms cubic-bezier(.3,1.6,.5,1)",
  },
  led: {
    position: "absolute",
    right: 8,
    top: "50%",
    width: 5,
    height: 5,
    borderRadius: "50%",
    transform: "translateY(-50%)",
    transition: "background 200ms, box-shadow 200ms",
  },
  hint: {
    position: "absolute",
    bottom: 14,
    left: 0,
    right: 0,
    margin: 0,
    textAlign: "center",
    fontFamily: mono,
    fontSize: 11,
    color: "rgba(235,231,220,0.4)",
    pointerEvents: "none",
  },
  dark: {
    position: "absolute",
    inset: 0,
    borderRadius: 28,
    background: "#050607",
    opacity: "calc((1 - var(--lit)) * 0.94)",
    pointerEvents: "none",
  },
};
