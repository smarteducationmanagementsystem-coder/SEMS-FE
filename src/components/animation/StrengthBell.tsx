"use client";

/**
 * StrengthBell — fairground "high striker" (Ring the bell).
 * Drag the mallet up, release (or flick it down) onto the pad.
 * Hit too hard and the bell pops right off.
 *
 * No external library needed: SVG + requestAnimationFrame + Web Audio API.
 * Usage:  <StrengthBell />
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";

/* ---------- geometry (SVG units, viewBox 520 x 490) ---------- */
const PIVOT = { x: 410, y: 424 };
const MAX_ANGLE = (100 * Math.PI) / 180;
const PUCK_REST_Y = 438;
const PUCK_TOP_Y = 124;
const TRAVEL = PUCK_REST_Y - PUCK_TOP_Y;
const BELL_FLOOR = 375; // how far the popped bell can fall
const BELL_CX = 135;

/* ---------- physics tuning ---------- */
const K = 40; // swing acceleration (rad/s^2)
const REF = 2 * K * 1.12; // omega^2 that equals strength 1.0
const G = 2.4; // puck gravity (tower heights / s^2)
const POP_AT = 1.3; // strength above this pops the bell

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };

type Sample = { t: number; th: number };

export default function StrengthBell() {
  const svgRef = useRef<SVGSVGElement>(null);
  const malletRef = useRef<SVGGElement>(null);
  const puckRef = useRef<SVGGElement>(null);
  const bellRef = useRef<SVGGElement>(null);
  const glowRef = useRef<SVGCircleElement>(null);
  const flashRef = useRef<SVGEllipseElement>(null);
  const hitRef = useRef<SVGRectElement>(null);

  const [soundOn, setSoundOn] = useState(true);
  const [status, setStatus] = useState("Grab the mallet, wind it up, swing it down onto the pad.");
  const [popped, setPopped] = useState(false);

  const soundRef = useRef(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* mutable simulation state (kept out of React state for 60fps) */
  const sim = useRef({
    mallet: { mode: "rest" as "rest" | "drag" | "swing", theta: 0, omega: 0, offset: 0 },
    samples: [] as Sample[],
    puck: { active: false, p: 0, v: 0, s: 0, hitBell: false, peaked: false },
    bell: { mode: "idle" as "idle" | "ring" | "popped", t: 0, amp: 0, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, settled: false },
    flash: 0,
    glow: 0,
  });

  useEffect(() => {
    soundRef.current = soundOn;
  }, [soundOn]);

  /* ---------- audio ---------- */
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

  const noiseBuf = (ctx: AudioContext, dur: number) => {
    const b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };

  const playThud = useCallback((i: number) => {
    if (!soundRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const vol = 0.35 + 0.65 * clamp(i, 0, 1);

    const o = ctx.createOscillator();
    const og = ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.25);
    og.gain.setValueAtTime(0.9 * vol, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.connect(og).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.3);

    const n = ctx.createBufferSource();
    n.buffer = noiseBuf(ctx, 0.15);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1100;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.7 * vol, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
    n.connect(lp).connect(ng).connect(ctx.destination);
    n.start(t);
  }, [getCtx]);

  const playWhoosh = useCallback((i: number) => {
    if (!soundRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = noiseBuf(ctx, 0.35);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(350, t);
    bp.frequency.exponentialRampToValueAtTime(1800, t + 0.28);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05 + 0.13 * clamp(i, 0, 1), t + 0.12);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
    n.connect(bp).connect(g).connect(ctx.destination);
    n.start(t);
  }, [getCtx]);

  const playBell = useCallback((strength: number, base = 640, decay = 1) => {
    if (!soundRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const vol = 0.18 + 0.22 * clamp(strength, 0, 1.4);
    const partials = [
      [1, 1, 3.4],
      [1.004, 0.7, 3.2],
      [2.01, 0.55, 2.5],
      [2.76, 0.42, 1.9],
      [4.07, 0.28, 1.3],
      [5.4, 0.18, 0.95],
      [6.92, 0.1, 0.6],
    ];
    partials.forEach(([ratio, g, d]) => {
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.type = "sine";
      o.frequency.value = base * ratio;
      gn.gain.setValueAtTime(vol * g, t);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + d * decay);
      o.connect(gn).connect(ctx.destination);
      o.start(t);
      o.stop(t + d * decay + 0.05);
    });
    // strike transient
    const n = ctx.createBufferSource();
    n.buffer = noiseBuf(ctx, 0.05);
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 3000;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.25 * vol, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    n.connect(hp).connect(ng).connect(ctx.destination);
    n.start(t);
  }, [getCtx]);

  const playPop = useCallback(() => {
    if (!soundRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.12);
    g.gain.setValueAtTime(0.4, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.2);
    playBell(1.3, 760, 0.45);
  }, [getCtx, playBell]);

  const playClank = useCallback((v: number) => {
    playBell(clamp(v, 0.1, 0.8) * 0.5, 430, 0.22);
  }, [playBell]);

  /* ---------- game logic ---------- */
  const resetBell = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    const b = sim.current.bell;
    Object.assign(b, { mode: "idle", t: 0, amp: 0, x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, settled: false });
    setPopped(false);
    setStatus("Bell’s back on. Swing again.");
  }, []);

  const popBell = useCallback((vIn: number) => {
    const b = sim.current.bell;
    b.mode = "popped";
    b.x = 0;
    b.y = 0;
    b.vx = (Math.random() > 0.5 ? 1 : -1) * (70 + Math.random() * 90);
    b.vy = -Math.max(450, vIn * TRAVEL * 1.7);
    b.rot = 0;
    b.vr = (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 5);
    b.settled = false;
    playPop();
    setPopped(true);
  }, [playPop]);

  const impact = useCallback((omega: number) => {
    const s = sim.current;
    const strength = (omega * omega) / REF;
    s.mallet.mode = "rest";
    s.mallet.theta = 0;
    s.mallet.omega = 0;
    s.flash = 1;
    if (strength < 0.03) {
      setStatus("Barely a tap. Wind it up higher.");
      return;
    }
    playThud(Math.min(1, strength));
    Object.assign(s.puck, {
      active: true,
      p: 0,
      v: Math.sqrt(2 * G * strength),
      s: strength,
      hitBell: false,
      peaked: false,
    });
    setStatus("…");
  }, [playThud]);

  const finishMessage = (strength: number) => {
    if (strength >= POP_AT) return "Too hard. The bell popped off.";
    if (strength >= 1) return `Ding! Bell rung — ${Math.round(strength * 100)}%`;
    if (strength > 0.85) return `So close — ${Math.round(strength * 100)}%. A little harder.`;
    if (strength > 0.5) return `${Math.round(strength * 100)}%. Swing harder.`;
    return `${Math.round(strength * 100)}%. Wind it up higher.`;
  };

  /* ---------- animation loop ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const s = sim.current;
      const m = s.mallet;

      // mallet swing
      if (m.mode === "swing") {
        m.omega += K * Math.max(0.25, Math.cos(m.theta)) * dt;
        m.theta -= m.omega * dt;
        if (m.theta <= 0) impact(m.omega);
      }

      // puck
      const p = s.puck;
      if (p.active) {
        p.v -= G * dt;
        p.p += p.v * dt;
        if (!p.hitBell && p.p >= 1) {
          p.p = 1;
          p.hitBell = true;
          const vIn = p.v;
          p.v = -Math.abs(vIn) * 0.3;
          s.bell.mode = "ring";
          s.bell.t = 0;
          s.bell.amp = clamp(0.2 + (p.s - 1) * 1.2, 0.2, 0.45);
          s.glow = 1;
          if (p.s >= POP_AT) popBell(vIn);
          else playBell(p.s);
          setStatus(finishMessage(p.s));
        }
        if (!p.hitBell && !p.peaked && p.v <= 0) {
          p.peaked = true;
          setStatus(finishMessage(p.s));
        }
        if (p.p <= 0 && p.v < 0) {
          p.p = 0;
          if (Math.abs(p.v) > 0.35) p.v = -p.v * 0.25;
          else p.active = false;
        }
      }

      // bell
      const b = s.bell;
      let bellTransform = "";
      if (b.mode === "ring") {
        b.t += dt;
        const ang = b.amp * Math.exp(-b.t * 1.5) * Math.sin(b.t * 20);
        bellTransform = `rotate(${(ang * 180) / Math.PI} ${BELL_CX} 22)`;
        if (b.t > 4) b.mode = "idle";
      } else if (b.mode === "popped") {
        if (!b.settled) {
          b.vy += 1700 * dt;
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.rot += b.vr * dt;
          if (b.x < -90 || b.x > 330) {
            b.x = clamp(b.x, -90, 330);
            b.vx *= -0.6;
          }
          if (b.y >= BELL_FLOOR) {
            b.y = BELL_FLOOR;
            if (Math.abs(b.vy) > 90) playClank(Math.abs(b.vy) / 900);
            b.vy *= -0.35;
            b.vx *= 0.6;
            b.vr *= 0.5;
            if (Math.abs(b.vy) < 70) {
              b.vy = 0;
              b.vx = 0;
              b.vr = 0;
              b.settled = true;
              b.rot = 0;
              resetTimer.current = setTimeout(resetBell, 3200);
            }
          }
        }
        bellTransform = `translate(${b.x} ${b.y}) rotate(${(b.rot * 180) / Math.PI} ${BELL_CX} 60)`;
      }

      s.flash = Math.max(0, s.flash - dt * 3.2);
      s.glow = Math.max(0, s.glow - dt * 0.7);

      // paint
      malletRef.current?.setAttribute("transform", `rotate(${(m.theta * 180) / Math.PI} ${PIVOT.x} ${PIVOT.y})`);
      puckRef.current?.setAttribute("transform", `translate(0 ${-p.p * TRAVEL})`);
      bellRef.current?.setAttribute("transform", bellTransform);
      glowRef.current?.setAttribute("opacity", String(s.glow * 0.55));
      const f = flashRef.current;
      if (f) {
        f.setAttribute("rx", String(14 + (1 - s.flash) * 55));
        f.setAttribute("ry", String(4 + (1 - s.flash) * 10));
        f.setAttribute("opacity", String(s.flash * 0.7));
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [impact, popBell, playBell, playClank, resetBell]);

  /* ---------- pointer handling ---------- */
  const toSvg = (e: PointerEvent) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };
  const angleAt = (pt: { x: number; y: number }) => Math.atan2(-(pt.y - PIVOT.y), -(pt.x - PIVOT.x));

  const measuredOmega = () => {
    const sm = sim.current.samples;
    if (sm.length < 2) return 0;
    const a = sm[0];
    const z = sm[sm.length - 1];
    if (performance.now() - z.t > 70) return 0;
    const dt = (z.t - a.t) / 1000;
    if (dt < 0.01) return 0;
    return clamp((a.th - z.th) / dt, 0, 16);
  };

  const onDown = (e: PointerEvent<SVGRectElement>) => {
    const s = sim.current;
    if (s.mallet.mode !== "rest" || s.puck.active || s.bell.mode === "popped") return;
    getCtx();
    e.currentTarget.setPointerCapture(e.pointerId);
    s.mallet.mode = "drag";
    s.mallet.offset = angleAt(toSvg(e)) - s.mallet.theta;
    s.samples = [];
    setStatus("Wind it up, then let go.");
    if (hitRef.current) hitRef.current.style.cursor = "grabbing";
  };

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const s = sim.current;
    if (s.mallet.mode !== "drag") return;
    const raw = angleAt(toSvg(e)) - s.mallet.offset;
    const prev = s.mallet.theta;
    const th = clamp(raw, 0, MAX_ANGLE);
    s.mallet.theta = th;
    const now = performance.now();
    s.samples.push({ t: now, th });
    while (s.samples.length > 1 && now - s.samples[0].t > 100) s.samples.shift();
    if (raw <= 0 && prev > 0.02) {
      const w = measuredOmega();
      playWhoosh(w / 12);
      impact(w);
      if (hitRef.current) hitRef.current.style.cursor = "grab";
    }
  };

  const onUp = () => {
    const s = sim.current;
    if (s.mallet.mode !== "drag") return;
    if (hitRef.current) hitRef.current.style.cursor = "grab";
    if (s.mallet.theta < 0.03) {
      s.mallet.mode = "rest";
      s.mallet.theta = 0;
      return;
    }
    const w = measuredOmega();
    s.mallet.omega = w;
    s.mallet.mode = "swing";
    playWhoosh(0.35 + w / 12);
  };

  /* ---------- render ---------- */
  const ticks = Array.from({ length: 21 }, (_, i) => i);

  return (
    <div style={styles.card}>
      <button
        type="button"
        onClick={() => setSoundOn((v) => !v)}
        aria-pressed={soundOn}
        style={styles.sound}
      >
        sound: {soundOn ? "on" : "off"}
      </button>

      <svg
        ref={svgRef}
        viewBox="0 0 520 490"
        style={styles.svg}
        role="img"
        aria-label="Fairground high striker. Drag the mallet up and release it to ring the bell."
      >
        <defs>
          <linearGradient id="sb-wood" x1="0" x2="1">
            <stop offset="0" stopColor="#1f150d" />
            <stop offset="0.45" stopColor="#4a3322" />
            <stop offset="1" stopColor="#1a110a" />
          </linearGradient>
          <linearGradient id="sb-mallet" x1="0" x2="1">
            <stop offset="0" stopColor="#8a5a2e" />
            <stop offset="0.5" stopColor="#c99256" />
            <stop offset="1" stopColor="#7a4d27" />
          </linearGradient>
          <linearGradient id="sb-handle" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d0a064" />
            <stop offset="1" stopColor="#7d5028" />
          </linearGradient>
          <linearGradient id="sb-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7c8087" />
            <stop offset="1" stopColor="#3c3f45" />
          </linearGradient>
          <linearGradient id="sb-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#8f6a22" />
            <stop offset="0.35" stopColor="#f1cf86" />
            <stop offset="0.7" stopColor="#c79a43" />
            <stop offset="1" stopColor="#7d5a1b" />
          </linearGradient>
          <linearGradient id="sb-puck" x1="0" x2="1">
            <stop offset="0" stopColor="#a8432f" />
            <stop offset="0.45" stopColor="#e07a5f" />
            <stop offset="1" stopColor="#8f3524" />
          </linearGradient>
          <radialGradient id="sb-glow">
            <stop offset="0" stopColor="#f6d99a" stopOpacity="0.9" />
            <stop offset="1" stopColor="#f6d99a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ground */}
        <line x1="0" x2="520" y1="470" y2="470" stroke="rgba(255,255,255,0.08)" />
        <ellipse cx="250" cy="472" rx="230" ry="8" fill="rgba(0,0,0,0.5)" />

        {/* glow behind bell */}
        <circle ref={glowRef} cx={BELL_CX} cy="58" r="85" fill="url(#sb-glow)" opacity="0" />

        {/* base + pad */}
        <rect x="70" y="452" width="250" height="18" rx="2" fill="url(#sb-wood)" />
        <circle cx="82" cy="461" r="2.5" fill="#111" />
        <circle cx="308" cy="461" r="2.5" fill="#111" />
        <rect x="198" y="446" width="92" height="6" rx="2" fill="url(#sb-band)" />
        <ellipse ref={flashRef} cx="244" cy="448" rx="14" ry="4" fill="#f3d9a4" opacity="0" />

        {/* tower */}
        <rect x="100" y="100" width="70" height="352" fill="url(#sb-wood)" />
        <rect x="94" y="90" width="82" height="12" rx="2" fill="#2b1d12" />
        <rect x="132.5" y="104" width="5" height="348" fill="#16100b" />
        <rect x="133" y="104" width="1.5" height="348" fill="#4b4f55" opacity="0.7" />
        {ticks.map((i) => {
          const y = PUCK_REST_Y - (i / 20) * TRAVEL;
          const major = i % 5 === 0;
          return (
            <line
              key={i}
              x1={major ? 112 : 119}
              x2="127"
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.38)"
              strokeWidth={major ? 1.3 : 0.8}
            />
          );
        })}
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <circle cx="108" cy={125 + i * 34} r="3.2" fill="#6a4a2e" />
            <circle cx="162" cy={125 + i * 34} r="3.2" fill="#6a4a2e" />
          </g>
        ))}
        {/* striker plate */}
        <rect x="124" y="104" width="22" height="5" rx="1" fill="url(#sb-band)" />

        {/* puck */}
        <g ref={puckRef}>
          <rect x="121" y="424" width="28" height="28" rx="4" fill="url(#sb-puck)" />
          <rect x="121" y="424" width="28" height="4" rx="2" fill="#f3a08a" opacity="0.8" />
          <rect x="121" y="447" width="28" height="5" rx="2" fill="#6b2517" opacity="0.7" />
        </g>

        {/* bell */}
        <g ref={bellRef}>
          <path d="M135 30 V14 H146" fill="none" stroke="#1c1d21" strokeWidth="4" strokeLinecap="round" />
          <rect x="129" y="26" width="12" height="12" rx="3" fill="url(#sb-gold)" />
          <path
            d="M100 88 C104 80 108 74 110 62 C112 46 120 37 135 37 C150 37 158 46 160 62 C162 74 166 80 170 88 Z"
            fill="url(#sb-gold)"
          />
          <ellipse cx="135" cy="88" rx="36" ry="5" fill="#6e4f17" />
          <ellipse cx="135" cy="87" rx="34" ry="3.5" fill="#caa14a" />
          <ellipse cx="123" cy="62" rx="5" ry="15" fill="#fff" opacity="0.25" />
        </g>

        {/* post */}
        <path d="M402 432 L418 432 L426 466 L394 466 Z" fill="#2a2c31" />
        <rect x="384" y="466" width="52" height="4" rx="2" fill="#1b1c20" />

        {/* mallet */}
        <g ref={malletRef}>
          <rect x="264" y="420" width="146" height="8" rx="3" fill="url(#sb-handle)" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={356 + i * 7} y="420" width="3" height="8" fill="#3a2410" opacity="0.8" />
          ))}
          <rect x="220" y="402" width="44" height="44" rx="6" fill="url(#sb-mallet)" />
          <rect x="220" y="408" width="44" height="7" fill="url(#sb-band)" />
          <rect x="220" y="433" width="44" height="7" fill="url(#sb-band)" />
          <circle cx={PIVOT.x} cy={PIVOT.y} r="10" fill="#26282d" />
          <circle cx={PIVOT.x} cy={PIVOT.y} r="4" fill="#9a9da3" />
          {/* invisible, generous grab area */}
          <rect
            ref={hitRef}
            x="210"
            y="392"
            width="210"
            height="64"
            fill="transparent"
            style={{ cursor: "grab", touchAction: "none" }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        </g>
      </svg>

      <h2 style={styles.title}>
        Ring the <span style={{ color: "#eccb94" }}>bell.</span>
      </h2>

      <div style={styles.row}>
        <p style={styles.status} aria-live="polite">
          {status}
        </p>
        {popped && (
          <button type="button" onClick={resetBell} style={styles.reset}>
            Put bell back
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- styles (inline so it works with or without Tailwind) ---------- */
const styles: Record<string, CSSProperties> = {
  card: {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    overflow: "hidden",
    borderRadius: 28,
    padding: "20px 16px 18px",
    background: "#050607",
    border: "1px solid rgba(255,255,255,0.08)",
    backgroundImage:
      "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
    backgroundSize: "48px 48px",
    color: "#ebe7dc",
    userSelect: "none",
    WebkitUserSelect: "none",
  },
  svg: { display: "block", width: "100%", maxWidth: "100%", height: "auto", maxHeight: 420, overflow: "hidden", touchAction: "none" },
  sound: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
    fontSize: 12,
    padding: "6px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.05)",
    color: "#ebe7dc",
    cursor: "pointer",
  },
  title: {
    margin: "8px 0 0",
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
    overflowWrap: "anywhere",
    lineHeight: 1,
    fontWeight: 800,
    letterSpacing: "-0.045em",
    color: "#ebe7dc",
  },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, minHeight: 34 },
  status: { margin: 0, fontSize: 14, color: "rgba(235,231,220,0.65)" },
  reset: {
    flexShrink: 0,
    fontSize: 13,
    padding: "7px 14px",
    borderRadius: 999,
    border: "1px solid rgba(236,203,148,0.5)",
    background: "transparent",
    color: "#eccb94",
    cursor: "pointer",
  },
};
