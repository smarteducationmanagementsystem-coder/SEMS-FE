"use client";

import { useEffect, useRef } from "react";

/* ---------- geometry (all in SVG user units) ---------- */
const CX = 644; // hub centre x
const CY = 432; // hub centre y (blade plane)
const TILT = 2.6; // slight tilt of the blade disc
const FLAT = 0.2; // perspective squash of the blade disc
const BLADES = 4;
const GHOSTS = 3; // motion-blur copies per blade

/* ---------- behaviour ---------- */
const SPEEDS = [0, 140, 320, 620]; // deg / second : off, low, medium, high
const LABELS = ["Off", "Low", "Medium", "High"];
const PULL_DOWN = 26; // how far the chain moves while pressed
const PULL_MAX = 46;

/* ---------- sound (synthesised with the Web Audio API, no audio files needed) ---------- */
type AudioRig = {
  ctx: AudioContext;
  master: GainNode;
  fanGain: GainNode;
  lfo: OscillatorNode;
  lfoDepth: GainNode;
  lowpass: BiquadFilterNode;
  hum: OscillatorNode;
  humGain: GainNode;
  noise: AudioBuffer;
};

function createAudio(): AudioRig | null {
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();

  // two seconds of looping white noise = the "air" of the fan
  const noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  src.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 300;
  const fanGain = ctx.createGain();
  fanGain.gain.value = 0;
  const master = ctx.createGain();
  master.gain.value = 1;
  src.connect(lowpass);
  lowpass.connect(fanGain);
  fanGain.connect(master);
  master.connect(ctx.destination);

  // blade-pass "whoom whoom": a slow LFO that modulates the noise volume
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 1;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0;
  lfo.connect(lfoDepth);
  lfoDepth.connect(fanGain.gain);

  // low motor hum
  const hum = ctx.createOscillator();
  hum.type = "triangle";
  hum.frequency.value = 50;
  const humGain = ctx.createGain();
  humGain.gain.value = 0;
  hum.connect(humGain);
  humGain.connect(master);

  src.start();
  lfo.start();
  hum.start();
  return { ctx, master, fanGain, lfo, lfoDepth, lowpass, hum, humGain, noise };
}

// short "tick" for the pull chain
function playClick(rig: AudioRig, vol: number, freq: number) {
  const { ctx } = rig;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = rig.noise;
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = 1.2;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  src.connect(bp);
  bp.connect(g);
  g.connect(rig.master);
  src.start(t, Math.random() * 1.5);
  src.stop(t + 0.08);
}

const bladeTransform = (deg: number) =>
  `translate(${CX} ${CY}) rotate(${TILT}) scale(1 ${FLAT}) rotate(${deg})`;

const DARK: [number, number, number] = [46, 34, 23];
const LIGHT: [number, number, number] = [134, 97, 61];

// lighter when the blade points toward the viewer / to the right
function bladeColor(deg: number) {
  const r = (deg * Math.PI) / 180;
  const v = Math.min(1, Math.max(0, 0.45 + 0.3 * Math.sin(r) + 0.25 * Math.cos(r)));
  const c = DARK.map((d, i) => Math.round(d + (LIGHT[i] - d) * v));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const START = 8; // initial blade angle

export default function CeilingFan({ fit = false }: { fit?: boolean }) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const fanRef = useRef<SVGGElement | null>(null);
  const bodyRefs = useRef<(SVGGElement | null)[]>([]);
  const ghostRefs = useRef<(SVGGElement | null)[][]>([]);
  const chainRef = useRef<SVGLineElement | null>(null);
  const handleRef = useRef<SVGGElement | null>(null);
  const labelRef = useRef<HTMLParagraphElement | null>(null);

  const level = useRef(0);
  const omega = useRef(0); // current angular speed (deg/s)
  const angle = useRef(START);
  const pull = useRef({ pos: 0, vel: 0, target: 0 });
  const drag = useRef<{ active: boolean; startY: number }>({ active: false, startY: 0 });
  const audio = useRef<AudioRig | null>(null);
  const muted = useRef(false);
  const soundBtn = useRef<HTMLButtonElement | null>(null);

  /* ---------- animation loop ---------- */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // speed eases toward the target (spins up quickly, coasts down slowly)
      const target = SPEEDS[level.current];
      const rate = target > omega.current ? 2.4 : 0.7;
      omega.current += (target - omega.current) * (1 - Math.exp(-rate * dt));
      if (target === 0 && omega.current < 0.4) omega.current = 0;
      angle.current = (angle.current + omega.current * dt) % 360;

      const s = omega.current / SPEEDS[3]; // 0..1
      const trail = omega.current * 0.014; // degrees between ghost copies

      // fan sound follows the real blade speed
      const rig = audio.current;
      if (rig) {
        const t = rig.ctx.currentTime;
        const vol = muted.current ? 0 : 0.28 * Math.pow(s, 0.6);
        rig.fanGain.gain.setTargetAtTime(vol, t, 0.08);
        rig.lfo.frequency.setTargetAtTime(Math.max(0.1, (BLADES * omega.current) / 360), t, 0.1);
        rig.lfoDepth.gain.setTargetAtTime(vol * 0.35, t, 0.1);
        rig.lowpass.frequency.setTargetAtTime(250 + 1100 * s, t, 0.1);
        rig.hum.frequency.setTargetAtTime(46 + 50 * s, t, 0.1);
        rig.humGain.gain.setTargetAtTime(muted.current ? 0 : 0.035 * s, t, 0.1);
      }

      for (let i = 0; i < BLADES; i++) {
        const a = angle.current + i * 90;
        const body = bodyRefs.current[i];
        if (body) {
          body.setAttribute("transform", bladeTransform(a));
          body.setAttribute("opacity", String(1 - 0.3 * s));
        }
        const ghosts = ghostRefs.current[i] || [];
        for (let g = 0; g < GHOSTS; g++) {
          const el = ghosts[g];
          if (!el) continue;
          el.setAttribute("transform", bladeTransform(a - (g + 1) * trail));
          el.setAttribute("opacity", String(Math.max(0, 0.5 * s * (1 - g / GHOSTS))));
        }
      }

      // chain: spring that follows the pull target, with a little bounce
      const p = pull.current;
      const steps = 3;
      const h = dt / steps;
      for (let k = 0; k < steps; k++) {
        const acc = 180 * (p.target - p.pos) - 9 * p.vel;
        p.vel += acc * h;
        p.pos += p.vel * h;
      }
      const sway = Math.sin(now / 260) * 1.2 * s;
      const chain = chainRef.current;
      if (chain) {
        chain.setAttribute("x2", String(CX + sway));
        chain.setAttribute("y2", String(598 + p.pos));
      }
      handleRef.current?.setAttribute("transform", `translate(${CX + sway} ${598 + p.pos})`);

      // whole fan wobbles very slightly when spinning fast
      const wob = Math.sin((now / 1000) * 2.2) * 0.22 * s;
      fanRef.current?.setAttribute("transform", `rotate(${wob} ${CX} 32)`);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    return () => {
      audio.current?.ctx.close();
      audio.current = null;
    };
  }, []);

  /* ---------- interaction ---------- */
  // browsers only allow sound after a user gesture, so it starts on the first pull
  const ensureAudio = () => {
    if (!audio.current) audio.current = createAudio();
    const rig = audio.current;
    if (rig && rig.ctx.state === "suspended") void rig.ctx.resume();
    return rig;
  };

  const click = (vol: number, freq: number) => {
    const rig = ensureAudio();
    if (rig && !muted.current) playClick(rig, vol, freq);
  };

  const toggleSound = () => {
    muted.current = !muted.current;
    if (soundBtn.current) soundBtn.current.textContent = muted.current ? "Sound: off" : "Sound: on";
    const rig = ensureAudio();
    rig?.master.gain.setTargetAtTime(muted.current ? 0 : 1, rig.ctx.currentTime, 0.05);
  };
  const cycle = () => {
    level.current = (level.current + 1) % SPEEDS.length; // off → low → medium → high → off
    if (labelRef.current) {
      labelRef.current.textContent = `Pull the chain · Speed: ${LABELS[level.current]}`;
    }
  };

  const onPointerDown = (e: React.PointerEvent<SVGRectElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { active: true, startY: e.clientY };
    pull.current.target = PULL_DOWN;
    click(0.5, 2600);
  };

  const onPointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    if (!drag.current.active) return;
    const ctm = svgRef.current?.getScreenCTM();
    const scale = ctm ? ctm.a : 1;
    const dy = Math.max(0, (e.clientY - drag.current.startY) / scale);
    pull.current.target = Math.min(PULL_MAX, PULL_DOWN + dy);
  };

  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    pull.current.target = 0;
    click(0.35, 1800);
    cycle();
  };

  const onPointerCancel = () => {
    drag.current.active = false;
    pull.current.target = 0;
  };

  const onKeyDown = (e: React.KeyboardEvent<SVGRectElement>) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    pull.current.target = PULL_DOWN;
    click(0.5, 2600);
    cycle();
    window.setTimeout(() => {
      pull.current.target = 0;
    }, 150);
  };

  const ghostArr = Array.from({ length: GHOSTS });

  return (
    <div
      style={{
        position: "relative",
        display: fit ? "grid" : "flex",
        flexDirection: fit ? undefined : "column",
        gridTemplateColumns: fit ? "minmax(0,1fr) auto minmax(0,1fr)" : undefined,
        alignItems: fit ? "center" : undefined,
        columnGap: fit ? 16 : undefined,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        minHeight: fit ? 0 : "100vh",
        backgroundColor: fit ? "transparent" : "#050608",
        backgroundImage: fit
          ? "none"
          : "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)",
        backgroundSize: "152px 152px",
        backgroundPosition: "center top",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <style style={{ display: "none" }}>{`.fan-chain, .fan-chain:focus, .fan-chain:focus-visible { outline: none; -webkit-tap-highlight-color: transparent; }`}</style>
      {fit ? null : (
        <div
          style={{
            height: 32,
            flex: "0 0 auto",
            background:
              "linear-gradient(to bottom,#2c2337 0,#2c2337 18px,#463b56 18px,#463b56 31px,#1a1620 31px)",
          }}
        />
      )}

      <svg
        ref={svgRef}
        viewBox="170 32 948 668"
        role="img"
        aria-label="Ceiling fan with a pull chain"
        style={{
          display: "block",
          gridColumn: fit ? "2" : undefined,
          gridRow: fit ? "1" : undefined,
          flex: fit ? undefined : 1,
          width: fit ? "min(320px, 42vw)" : "100%",
          minWidth: 0,
          maxWidth: fit ? 320 : "100%",
          height: fit ? "auto" : undefined,
          aspectRatio: fit ? "948 / 668" : undefined,
          minHeight: 0,
          overflow: "hidden",
          outline: "none",
        }}
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient id="fan-rod" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#1f2024" />
            <stop offset="0.5" stopColor="#55565b" />
            <stop offset="1" stopColor="#1c1d20" />
          </linearGradient>
          <linearGradient id="fan-canopy" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#141517" />
            <stop offset="1" stopColor="#2b2c30" />
          </linearGradient>
          <linearGradient id="fan-housing" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#1b1c1f" />
            <stop offset="0.25" stopColor="#2a2b2f" />
            <stop offset="0.48" stopColor="#4f5156" />
            <stop offset="0.72" stopColor="#2b2c30" />
            <stop offset="1" stopColor="#17181b" />
          </linearGradient>
          <linearGradient id="fan-shade" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.07" />
            <stop offset="0.4" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="fan-pull" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#e0c28a" />
            <stop offset="0.5" stopColor="#9a7a46" />
            <stop offset="1" stopColor="#5d4626" />
          </linearGradient>

          {/* blade parts, drawn pointing along +x from the hub centre */}
          <path id="fan-blade-body" d="M72 -15 L425 -19 Q460 -17 460 -2 Q460 13 425 18 L72 16 Z" />
          <path id="fan-blade-grain" d="M95 -5 Q210 -9 330 -2 T440 -4" fill="none" />
          <path id="fan-bracket" d="M60 -5 L142 -4 L142 4 L60 6 Z" />
        </defs>

        <g ref={fanRef}>
          {/* blades (behind the motor housing) */}
          {Array.from({ length: BLADES }).map((_, i) => {
            const a0 = START + i * 90;
            return (
              <g key={i}>
                {ghostArr.map((_, g) => (
                  <g
                    key={g}
                    ref={(el) => {
                      if (!ghostRefs.current[i]) ghostRefs.current[i] = [];
                      ghostRefs.current[i][g] = el;
                    }}
                    transform={bladeTransform(a0)}
                    opacity={0}
                  >
                    <use href="#fan-blade-body" fill="#7a5a3a" />
                  </g>
                ))}
                <g
                  ref={(el) => {
                    bodyRefs.current[i] = el;
                  }}
                  transform={bladeTransform(a0)}
                >
                  <use href="#fan-blade-body" fill="#6b4f35" />
                  <use href="#fan-blade-grain" stroke="rgba(0,0,0,0.35)" strokeWidth="1.3" />
                  <use href="#fan-bracket" fill="#15161a" />
                </g>
              </g>
            );
          })}

          {/* ceiling canopy + down rod */}
          <path d="M594 32 C594 52 614 64 644 64 C674 64 694 52 694 32 Z" fill="url(#fan-canopy)" />
          <rect x="639" y="32" width="10" height="314" fill="url(#fan-rod)" />
          <rect x="630" y="340" width="28" height="18" rx="4" fill="#2a2b2e" />

          {/* motor housing */}
          <path
            d="M572 420 C572 380 590 356 644 355 C698 356 716 380 716 420 L716 438 C716 458 690 472 644 472 C598 472 572 458 572 438 Z"
            fill="url(#fan-housing)"
          />
          <path
            d="M572 420 C572 380 590 356 644 355 C698 356 716 380 716 420 L716 438 C716 458 690 472 644 472 C598 472 572 458 572 438 Z"
            fill="url(#fan-shade)"
          />
          <path d="M574 413 Q644 432 714 413" stroke="#b89a6a" strokeWidth="2.5" fill="none" />
          <path d="M572 436 Q644 450 716 436" stroke="#0e0f11" strokeWidth="2" fill="none" />
          <ellipse cx="644" cy="471" rx="7" ry="5" fill="#a68a5c" />

          {/* pull chain: beads are a dotted line whose end follows the handle */}
          <line
            ref={chainRef}
            x1={CX}
            y1="474"
            x2={CX}
            y2="598"
            stroke="#b9a98f"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray="0 8.5"
          />
          <g ref={handleRef} transform={`translate(${CX} 598)`}>
            <path
              d="M0 -2 C6 12 11 22 11 29 C11 36 6 38 0 38 C-6 38 -11 36 -11 29 C-11 22 -6 12 0 -2 Z"
              fill="url(#fan-pull)"
            />
          </g>

          {/* hit area for the chain */}
          <rect
            x="616"
            y="474"
            width="56"
            height="200"
            className="fan-chain"
            fill="transparent"
            style={{ cursor: "pointer", touchAction: "none", outline: "none" }}
            role="button"
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            aria-label="Pull the fan chain to change speed"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onKeyDown={onKeyDown}
          />
        </g>
      </svg>

      <button
        ref={soundBtn}
        type="button"
        onClick={toggleSound}
        aria-label="Toggle fan sound"
        style={{
          position: fit ? "static" : "absolute",
          gridColumn: fit ? "3" : undefined,
          gridRow: fit ? "1" : undefined,
          justifySelf: fit ? "end" : undefined,
          alignSelf: fit ? "center" : undefined,
          top: fit ? undefined : 44,
          right: fit ? undefined : 16,
          padding: "6px 12px",
          borderRadius: 999,
          border: fit ? "1px solid rgba(23,23,23,0.15)" : "1px solid rgba(255,255,255,0.15)",
          background: fit ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.05)",
          color: fit ? "rgba(23,23,23,0.7)" : "rgba(255,255,255,0.6)",
          fontFamily: "system-ui, sans-serif",
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        Sound: on
      </button>

      <p
        ref={labelRef}
        style={{
          position: fit ? "static" : "absolute",
          gridColumn: fit ? "1" : undefined,
          gridRow: fit ? "1" : undefined,
          justifySelf: fit ? "start" : undefined,
          alignSelf: fit ? "center" : undefined,
          bottom: fit ? undefined : 24,
          left: fit ? undefined : 0,
          right: fit ? undefined : 0,
          margin: 0,
          textAlign: fit ? "left" : "center",
          fontFamily: "system-ui, sans-serif",
          fontSize: fit ? 12 : 13,
          letterSpacing: 0.4,
          color: fit ? "rgba(23,23,23,0.55)" : "rgba(255,255,255,0.35)",
          pointerEvents: "none",
        }}
      >
        Pull the chain · Speed: Off
      </p>
    </div>
  );
}
