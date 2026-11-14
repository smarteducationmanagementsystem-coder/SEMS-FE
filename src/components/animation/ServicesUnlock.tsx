"use client";

/**
 * ServicesUnlock — looping illustration for the right side of a section.
 *
 * A giant phone with a progress bar and four locked service tiles (Students, Teachers,
 * Fees, Attendance). A presenter gestures at the phone while the tiles unlock one by
 * one: the padlock jiggles and pops off, the tile floods with colour and bounces, a
 * ring pulses and the progress bar jumps 25% at a time. When all four are unlocked the
 * "#1" plaque shines, confetti bursts and the presenter hops and gives a thumbs-up.
 * Then everything locks again and the loop restarts. The velvet rope keeps swaying.
 *
 * Built with framer-motion + inline SVG. All story elements share one 9s timeline.
 *
 * Install:  npm i framer-motion
 * Usage:    <ServicesUnlock />   (scales to its container; put it in the right column)
 * Colours:  edit the `C` object (flat colours) and the <defs> gradients.
 */

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

/* ---------------- palette ---------------- */
const C = {
  gold: "#f2b632",
  goldLight: "#ffe58a",
  goldDark: "#c98a14",
  rope: "#c8283f",
  ink: "#16163a",
  skin: "#c98a63",
  skinLight: "#f1b99a",
  hair: "#15153a",
  kurta: "#12a58f",
  kurtaDark: "#0b7a6a",
  vest: "#1a2260",
  pants: "#1f2a6b",
  shoe: "#ff6b5b",
  lock: "#8d97b5",
  lockTile: "#d3dbf3",
  label: "#7a86a6",
  blue: "#2457e6",
  green: "#17b26a",
};

/* ---------------- timeline ---------------- */
const T = 9;
//            0    1     2    3     4    5     6    7     8    9     10    11    12
const TIMES = [0, 0.08, 0.12, 0.22, 0.26, 0.36, 0.4, 0.5, 0.54, 0.62, 0.88, 0.95, 1];
const L = TIMES.length;
const master: Transition = { duration: T, times: TIMES, ease: "easeInOut", repeat: Infinity };
const HOLD = 10; // frame shown for reduced motion (everything unlocked)

const arr = (base: number, m: Record<number, number> = {}) =>
  Array.from({ length: L }, (_, i) => (i in m ? m[i] : base));
const steps = (v0: number, ...changes: [number, number][]) => {
  let cur = v0;
  return Array.from({ length: L }, (_, i) => {
    for (const [idx, val] of changes) if (idx === i) cur = val;
    return cur;
  });
};

type Keys = Record<string, number[]>;
type GProps = Partial<ComponentProps<typeof motion.g>>;

type PivotProps = ComponentProps<typeof motion.g> & { x: number; y: number; r?: number };
function Pivot({ x, y, r = 100, children, ...rest }: PivotProps) {
  return (
    <motion.g {...rest}>
      <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill="transparent" pointerEvents="none" />
      {children}
    </motion.g>
  );
}

/* ---------------- tile icons (centred on 0,0, cropped by a round plate) ---------------- */
function StudentIcon() {
  return (
    <>
      <path d="M-30 44 Q0 22 30 44 L30 52 L-30 52 Z" fill="#2457e6" />
      <circle cx="0" cy="8" r="22" fill="#f1b99a" />
      <path d="M-20 -6 L-20 6 L0 14 L20 6 L20 -6 L0 2 Z" fill="#3a3478" />
      <path d="M-36 -14 L0 -32 L36 -14 L0 4 Z" fill="#15153a" />
      <path d="M28 -11 L28 8" stroke="#f2b632" strokeWidth="3" strokeLinecap="round" />
      <circle cx="28" cy="10" r="3.5" fill="#f2b632" />
      <circle cx="-8" cy="14" r="2.6" fill="#16163a" />
      <circle cx="8" cy="14" r="2.6" fill="#16163a" />
      <path d="M-6 22 Q0 27 6 22" fill="none" stroke="#9c4a3c" strokeWidth="2.4" strokeLinecap="round" />
    </>
  );
}
function TeacherIcon() {
  return (
    <>
      <path d="M-32 44 Q0 20 32 44 L32 52 L-32 52 Z" fill="#ff6b5b" />
      <circle cx="0" cy="6" r="22" fill="#c98a63" />
      <path d="M-22 2 C-24 -18 -8 -24 0 -24 C10 -24 24 -18 22 2 C14 -8 -14 -8 -22 2 Z" fill="#15153a" />
      <circle cx="-9" cy="8" r="7.5" fill="#fff" stroke="#16163a" strokeWidth="2.6" />
      <circle cx="9" cy="8" r="7.5" fill="#fff" stroke="#16163a" strokeWidth="2.6" />
      <path d="M-1.5 8 L1.5 8" stroke="#16163a" strokeWidth="2.6" />
      <circle cx="-8" cy="9" r="2.4" fill="#16163a" />
      <circle cx="10" cy="9" r="2.4" fill="#16163a" />
      <path d="M-6 20 Q0 26 6 20" fill="none" stroke="#7a1f1a" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="-24" y="34" width="22" height="14" rx="2" fill="#17b26a" />
      <rect x="2" y="34" width="22" height="14" rx="2" fill="#3ed598" />
    </>
  );
}
function FeesIcon() {
  return (
    <>
      {[26, 14, 2].map((y, i) => (
        <g key={y}>
          <ellipse cx="0" cy={y + 6} rx="30" ry="11" fill="#c98a14" />
          <ellipse cx="0" cy={y} rx="30" ry="11" fill="#ffc83d" />
          {i === 2 && (
            <>
              <ellipse cx="0" cy={y} rx="19" ry="6.5" fill="none" stroke="#c98a14" strokeWidth="2.4" />
              <path d={`M0 ${y - 4} L0 ${y + 4}`} stroke="#c98a14" strokeWidth="2.6" strokeLinecap="round" />
            </>
          )}
        </g>
      ))}
      <path d="M26 -22 L29 -14 L37 -11 L29 -8 L26 0 L23 -8 L15 -11 L23 -14 Z" fill="#fff3b0" />
    </>
  );
}
function AttendanceIcon() {
  return (
    <>
      <rect x="-30" y="-28" width="60" height="62" rx="9" fill="#fff" stroke="#b9c3e0" strokeWidth="3" />
      <path d="M-30 -19 Q-30 -28 -21 -28 L21 -28 Q30 -28 30 -19 L30 -12 L-30 -12 Z" fill="#2457e6" />
      <rect x="-17" y="-34" width="6" height="14" rx="3" fill="#16163a" />
      <rect x="11" y="-34" width="6" height="14" rx="3" fill="#16163a" />
      <path d="M-15 10 L-4 21 L16 -2" fill="none" stroke="#17b26a" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

const TILES: { cx: number; cy: number; label: string; u: number; icon: ReactNode; shadow: string }[] = [
  { cx: 224, cy: 305, label: "Students", u: 2, icon: <StudentIcon />, shadow: "#1a2f9a" },
  { cx: 354, cy: 305, label: "Teachers", u: 4, icon: <TeacherIcon />, shadow: "#a8281a" },
  { cx: 224, cy: 435, label: "Fees", u: 6, icon: <FeesIcon />, shadow: "#b06c08" },
  { cx: 354, cy: 435, label: "Attendance", u: 8, icon: <AttendanceIcon />, shadow: "#0b7a4b" },
];

const CONFETTI = Array.from({ length: 18 }, (_, i) => {
  const ang = (i / 18) * Math.PI * 2 + (i % 3) * 0.2;
  const dist = 90 + (i % 4) * 28;
  return {
    dx: Math.cos(ang) * dist,
    up: Math.sin(ang) * dist - 70,
    fall: Math.sin(ang) * dist + 90,
    rot: (i % 2 ? 1 : -1) * (200 + i * 25),
    color: ["#2457e6", "#ffc83d", "#ff6b5b", "#3ed598", "#9b6bff", "#22c3ee"][i % 6],
    w: 7 + (i % 3) * 2,
  };
});

/* ---------------- component ---------------- */
type Props = { className?: string; style?: CSSProperties; label?: string };

export default function ServicesUnlock({
  className,
  style,
  label = "A presenter shows a phone whose service tiles unlock one by one",
}: Props) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const u = (name: string) => `url(#${uid}-${name})`;

  const a = (keys: Keys): GProps => {
    const frame = (i: number) => Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, v[i]]));
    if (reduce) return { initial: frame(HOLD) };
    return { initial: frame(0), animate: keys, transition: master };
  };
  const idle = (anim: Record<string, number[]>, duration: number, delay = 0): GProps =>
    reduce ? {} : { animate: anim, transition: { duration, repeat: Infinity, ease: "easeInOut", delay } };

  const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      style={{ position: "relative", width: "100%", maxWidth: 520, minWidth: 0, aspectRatio: "540 / 800", overflow: "hidden", ...style }}
    >
      <svg viewBox="0 0 540 800" style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", overflow: "hidden" }}>
        <defs>
          <linearGradient id={`${uid}-frame`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#3550cc" />
            <stop offset="1" stopColor="#0f1650" />
          </linearGradient>
          <linearGradient id={`${uid}-screen`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f8faff" />
            <stop offset="1" stopColor="#d9e2ff" />
          </linearGradient>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff0a8" />
            <stop offset="1" stopColor="#eeae2c" />
          </linearGradient>
          <linearGradient id={`${uid}-rope`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f0586a" />
            <stop offset="1" stopColor="#9c1d38" />
          </linearGradient>
          <linearGradient id={`${uid}-bar`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#2457e6" />
            <stop offset="1" stopColor="#22c3ee" />
          </linearGradient>
          {[
            ["t0", "#5b86ff", "#2243c9"],
            ["t1", "#ff8d77", "#e0452f"],
            ["t2", "#ffd54f", "#ee9512"],
            ["t3", "#4de3a8", "#14a068"],
          ].map(([id, from, to]) => (
            <linearGradient key={id} id={`${uid}-${id}`} x1="0" y1="0" x2="0.3" y2="1">
              <stop offset="0" stopColor={from} />
              <stop offset="1" stopColor={to} />
            </linearGradient>
          ))}
          <radialGradient id={`${uid}-glowBlue`}>
            <stop offset="0" stopColor="#5b7cff" stopOpacity="0.42" />
            <stop offset="1" stopColor="#5b7cff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-glowGold`}>
            <stop offset="0" stopColor="#ffc83d" stopOpacity="0.42" />
            <stop offset="1" stopColor="#ffc83d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-glowViolet`}>
            <stop offset="0" stopColor="#9b6bff" stopOpacity="0.4" />
            <stop offset="1" stopColor="#9b6bff" stopOpacity="0" />
          </radialGradient>
          <filter id={`${uid}-blur`} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <clipPath id={`${uid}-plaque`}>
            <rect x="215" y="594" width="150" height="48" rx="8" />
          </clipPath>
          {TILES.map((t, i) => (
            <clipPath key={i} id={`${uid}-plate${i}`}>
              <circle cx={t.cx} cy={t.cy - 10} r="38" />
            </clipPath>
          ))}
        </defs>

        {/* ===== soft coloured glow behind everything ===== */}
        <motion.circle cx="290" cy="340" r="290" fill={u("glowBlue")} {...(idle({ scale: [1, 1.06, 1] }, 6) as object)} />
        <motion.circle cx="90" cy="690" r="190" fill={u("glowGold")} {...(idle({ scale: [1.05, 0.95, 1.05] }, 5, 0.6) as object)} />
        <motion.circle cx="480" cy="130" r="170" fill={u("glowViolet")} {...(idle({ scale: [0.95, 1.08, 0.95] }, 7, 1) as object)} />

        {/* floating sparkles */}
        {[
          { x: 72, y: 170, s: 1, c: "#ffc83d", d: 2.4 },
          { x: 492, y: 330, s: 0.8, c: "#22c3ee", d: 3 },
          { x: 64, y: 430, s: 0.7, c: "#9b6bff", d: 2.8 },
          { x: 500, y: 520, s: 1, c: "#ff6b5b", d: 3.4 },
          { x: 470, y: 60, s: 0.7, c: "#ffc83d", d: 2.6 },
        ].map((p, i) => (
          <motion.g key={i} {...idle({ scale: [0.5, 1.15, 0.5], opacity: [0.35, 1, 0.35], rotate: [0, 45, 0] }, p.d, i * 0.4)}>
            <rect x={p.x - 20} y={p.y - 20} width="40" height="40" fill="transparent" pointerEvents="none" />
            <path
              d={`M${p.x} ${p.y - 14 * p.s} Q${p.x + 2} ${p.y - 2} ${p.x + 14 * p.s} ${p.y} Q${p.x + 2} ${p.y + 2} ${p.x} ${p.y + 14 * p.s} Q${p.x - 2} ${p.y + 2} ${p.x - 14 * p.s} ${p.y} Q${p.x - 2} ${p.y - 2} ${p.x} ${p.y - 14 * p.s} Z`}
              fill={p.c}
            />
          </motion.g>
        ))}

        {/* ground shadow */}
        <ellipse cx="290" cy="722" rx="215" ry="16" fill="#0f1650" opacity="0.18" filter={u("blur")} />

        {/* ===== the phone ===== */}
        <rect x="132" y="84" width="316" height="516" rx="52" fill="#0b1240" opacity="0.28" filter={u("blur")} />
        <rect x="132" y="72" width="316" height="516" rx="52" fill={u("frame")} />
        <rect x="448" y="170" width="5" height="46" rx="2.5" fill="#1a2780" />
        <rect x="127" y="150" width="5" height="30" rx="2.5" fill="#1a2780" />
        <rect x="127" y="196" width="5" height="30" rx="2.5" fill="#1a2780" />
        <rect x="146" y="86" width="288" height="488" rx="40" fill={u("screen")} />
        <rect x="146" y="86" width="288" height="488" rx="40" fill="none" stroke={C.gold} strokeWidth="2.5" opacity="0.9" />
        <rect x="256" y="96" width="68" height="9" rx="4.5" fill="#1a2260" />
        <rect x="258" y="560" width="64" height="6" rx="3" fill="#aab7e6" />

        {/* progress bar */}
        <rect x="175" y="140" width="230" height="18" rx="9" fill="#c5d0f3" />
        <motion.rect
          x="175"
          y="140"
          width="230"
          height="18"
          rx="9"
          fill={u("bar")}
          style={{ originX: 0, originY: 0.5 }}
          {...(a({ scaleX: steps(0.001, [2, 0.25], [4, 0.5], [6, 0.75], [8, 1], [11, 0.001]) }) as object)}
        />
        <rect x="181" y="144" width="218" height="4" rx="2" fill="#ffffff" opacity="0.28" />

        {/* ===== service tiles ===== */}
        {TILES.map((t, i) => (
          <g key={t.label}>
            {/* soft shadow under the tile */}
            <rect x={t.cx - 56} y={t.cy - 50} width="112" height="112" rx="20" fill="#0f1650" opacity="0.14" />
            <Pivot x={t.cx} y={t.cy} r={80} {...a({ scale: arr(1, { [t.u]: 1.12 }) })}>
              {/* locked base */}
              <rect x={t.cx - 56} y={t.cy - 56} width="112" height="112" rx="20" fill={C.lockTile} />
              {/* colour floods in on unlock */}
              <motion.g {...a({ opacity: steps(0, [t.u, 1], [11, 0]) })}>
                <rect x={t.cx - 56} y={t.cy - 56} width="112" height="112" rx="20" fill={u(`t${i}`)} />
                <rect x={t.cx - 56} y={t.cy - 56} width="112" height="112" rx="20" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
                <path d={`M${t.cx - 40} ${t.cy - 54} Q${t.cx} ${t.cy - 36} ${t.cx + 40} ${t.cy - 54}`} stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round" />
              </motion.g>
              {/* round plate + icon */}
              <motion.g {...a({ opacity: steps(0.45, [t.u, 1], [11, 0.45]) })}>
                <circle cx={t.cx} cy={t.cy - 10} r="38" fill="#fff" />
                <g clipPath={`url(#${uid}-plate${i})`}>
                  <g transform={`translate(${t.cx} ${t.cy - 10}) scale(0.78)`}>{t.icon}</g>
                </g>
              </motion.g>
              {/* label: grey while locked, white when unlocked */}
              <motion.text
                x={t.cx}
                y={t.cy + 45}
                textAnchor="middle"
                fontSize="13"
                fontWeight="800"
                fill={C.label}
                fontFamily={FONT}
                {...(a({ opacity: steps(1, [t.u, 0], [11, 1]) }) as object)}
              >
                {t.label}
              </motion.text>
              <motion.text
                x={t.cx}
                y={t.cy + 45}
                textAnchor="middle"
                fontSize="13"
                fontWeight="800"
                fill="#fff"
                fontFamily={FONT}
                {...(a({ opacity: steps(0, [t.u, 1], [11, 0]) }) as object)}
              >
                {t.label}
              </motion.text>
              {/* padlock: jiggles, then pops off */}
              <Pivot
                x={t.cx}
                y={t.cy - 4}
                r={40}
                {...a({
                  opacity: steps(1, [t.u, 0], [11, 1]),
                  y: steps(0, [t.u, -18], [11, 0]),
                  rotate: steps(0, [t.u - 1, 12], [t.u, -25], [t.u + 1, 0]),
                })}
              >
                <path
                  d={`M${t.cx - 11} ${t.cy - 6} L${t.cx - 11} ${t.cy - 15} C${t.cx - 11} ${t.cy - 31} ${t.cx + 11} ${t.cy - 31} ${t.cx + 11} ${t.cy - 15} L${t.cx + 11} ${t.cy - 6}`}
                  fill="none"
                  stroke={C.lock}
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <rect x={t.cx - 19} y={t.cy - 8} width="38" height="30" rx="7" fill={C.lock} />
                <circle cx={t.cx} cy={t.cy + 4} r="4" fill="#fff" />
                <rect x={t.cx - 1.8} y={t.cy + 5} width="3.6" height="9" rx="1.8" fill="#fff" />
              </Pivot>
            </Pivot>
            {/* unlock pulse ring */}
            <motion.circle
              cx={t.cx}
              cy={t.cy}
              r={56}
              fill="none"
              stroke={t.shadow}
              strokeWidth="4"
              {...(a({ scale: arr(0.7, { [t.u + 1]: 1.45 }), opacity: arr(0, { [t.u]: 0.85 }) }) as object)}
            />
          </g>
        ))}

        {/* ===== "#1" plaque ===== */}
        <Pivot x={290} y={618} r={110} {...a({ scale: arr(1, { 8: 1.15 }) })}>
          <rect x="215" y="600" width="150" height="48" rx="9" fill="#a8700c" />
          <rect x="215" y="594" width="150" height="48" rx="9" fill={u("gold")} stroke="#c98a14" strokeWidth="5" />
          <text x="290" y="632" textAnchor="middle" fontSize="34" fontWeight="900" fill="#b8780f" fontFamily={FONT}>
            #1
          </text>
          <text x="290" y="629" textAnchor="middle" fontSize="34" fontWeight="900" fill="#ffffff" fontFamily={FONT}>
            #1
          </text>
          <g clipPath={`url(#${uid}-plaque)`}>
            <g transform="rotate(20 228 620)">
              <motion.rect
                x="215"
                y="580"
                width="26"
                height="80"
                fill="#fff"
                {...(reduce
                  ? { style: { opacity: 0 } }
                  : (a({ x: arr(-40, { 9: 190, 10: 190, 11: 190 }), opacity: arr(0, { 8: 0.85 }) }) as object))}
              />
            </g>
          </g>
        </Pivot>

        {/* ===== velvet rope + posts ===== */}
        <g>
          {[67, 462].map((x) => (
            <g key={x}>
              <rect x={x - 7} y="610" width="14" height="92" rx="3" fill={u("gold")} />
              <rect x={x - 7} y="640" width="14" height="8" fill="#c98a14" />
              <circle cx={x} cy="604" r="12" fill={u("gold")} />
              <circle cx={x - 4} cy="600" r="3.4" fill="#fff" opacity="0.7" />
              <rect x={x - 27} y="700" width="54" height="15" rx="7.5" fill={u("gold")} />
              <rect x={x - 27} y="709" width="54" height="6" rx="3" fill="#c98a14" />
            </g>
          ))}
          <motion.path
            d="M68 614 Q266 770 462 614"
            fill="none"
            stroke={u("rope")}
            strokeWidth="15"
            strokeLinecap="round"
            {...(reduce
              ? {}
              : {
                  animate: {
                    d: [
                      "M68 614 Q266 770 462 614",
                      "M68 614 Q292 792 462 614",
                      "M68 614 Q240 752 462 614",
                      "M68 614 Q266 770 462 614",
                    ],
                  },
                  transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                })}
          />
          <motion.path
            d="M68 610 Q266 766 462 610"
            fill="none"
            stroke="#ff9aa6"
            strokeOpacity="0.55"
            strokeWidth="3.5"
            strokeLinecap="round"
            {...(reduce
              ? {}
              : {
                  animate: {
                    d: [
                      "M68 610 Q266 766 462 610",
                      "M68 610 Q292 788 462 610",
                      "M68 610 Q240 748 462 610",
                      "M68 610 Q266 766 462 610",
                    ],
                  },
                  transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
                })}
          />
          <circle cx="68" cy="614" r="8.5" fill={u("gold")} />
          <circle cx="462" cy="614" r="8.5" fill={u("gold")} />
        </g>

        {/* ===== presenter ===== */}
        <ellipse cx="120" cy="800" rx="62" ry="7" fill="#0f1650" opacity="0.22" />
        <motion.g {...idle({ y: [0, -3, 0] }, 1.9)}>
          <motion.g {...a({ y: arr(0, { 8: -18 }) })}>
            {/* shoes + legs */}
            <ellipse cx="96" cy="796" rx="22" ry="9" fill={C.shoe} />
            <ellipse cx="146" cy="796" rx="22" ry="9" fill={C.shoe} />
            <rect x="84" y="752" width="20" height="42" rx="8" fill={C.pants} />
            <rect x="136" y="752" width="20" height="42" rx="8" fill={C.pants} />

            {/* left arm (thumbs-up at the finale) */}
            <Pivot x={88} y={694} r={90} {...a({ rotate: steps(0, [8, 140], [11, 0]) })}>
              <path d="M88 694 L76 750" stroke={C.kurta} strokeWidth="22" strokeLinecap="round" />
              <circle cx="75" cy="758" r="12" fill={C.skin} />
              <rect x="70" y="742" width="8" height="14" rx="4" fill={C.skin} />
            </Pivot>

            {/* kurta + waistcoat */}
            <path
              d="M78 692 C78 676 90 668 104 668 L136 668 C150 668 162 676 162 692 L166 762 C166 772 160 778 150 778 L90 778 C80 778 74 772 76 762 Z"
              fill={C.kurta}
            />
            <path d="M150 700 L162 692 L166 762 C166 772 160 778 150 778 Z" fill={C.kurtaDark} opacity="0.55" />
            <path d="M92 672 L118 706 L118 774 L88 774 Z" fill={C.vest} />
            <path d="M148 672 L122 706 L122 774 L152 774 Z" fill={C.vest} />
            <circle cx="120" cy="722" r="2.8" fill="#ffe58a" />
            <circle cx="120" cy="742" r="2.8" fill="#ffe58a" />
            <circle cx="120" cy="762" r="2.8" fill="#ffe58a" />

            {/* head */}
            <rect x="112" y="654" width="16" height="18" fill={C.skin} />
            <Pivot x={120} y={660} r={70} {...idle({ rotate: [-2, 2, -2] }, 2.6)}>
              <circle cx="88" cy="634" r="7" fill={C.skin} />
              <circle cx="152" cy="634" r="7" fill={C.skin} />
              <ellipse cx="120" cy="632" rx="32" ry="34" fill={C.skin} />
              <ellipse cx="108" cy="652" rx="9" ry="5" fill="#ff8f85" opacity="0.28" />
              <ellipse cx="136" cy="652" rx="9" ry="5" fill="#ff8f85" opacity="0.28" />
              <path
                d="M88 628 C85 596 106 588 122 588 C142 588 157 600 152 628 C146 610 134 606 120 606 C106 606 94 612 88 628 Z"
                fill={C.hair}
              />
              <circle cx="108" cy="636" r="9.5" fill="rgba(255,255,255,0.6)" stroke={C.ink} strokeWidth="3.2" />
              <circle cx="134" cy="636" r="9.5" fill="rgba(255,255,255,0.6)" stroke={C.ink} strokeWidth="3.2" />
              <path d="M117.5 636 L124.5 636" stroke={C.ink} strokeWidth="3.2" />
              <circle cx="110" cy="637" r="3.2" fill={C.ink} />
              <circle cx="136" cy="637" r="3.2" fill={C.ink} />
              <path d="M99 622 L116 619" stroke={C.hair} strokeWidth="3.4" strokeLinecap="round" />
              <path d="M126 619 L143 622" stroke={C.hair} strokeWidth="3.4" strokeLinecap="round" />
              <path d="M108 652 Q121 664 135 652" fill="none" stroke="#6b1a14" strokeWidth="3.6" strokeLinecap="round" />
            </Pivot>

            {/* pointing arm: gestures at the phone on every unlock */}
            <Pivot
              x={152}
              y={692}
              r={110}
              {...a({ rotate: arr(0, { 2: -14, 3: 2, 4: -14, 5: 2, 6: -14, 7: 2, 8: -18, 9: 0 }) })}
            >
              <path d="M152 692 L214 652" stroke={C.kurta} strokeWidth="22" strokeLinecap="round" />
              <circle cx="221" cy="647" r="12" fill={C.skin} />
              <path d="M226 644 L244 634" stroke={C.skin} strokeWidth="8" strokeLinecap="round" />
            </Pivot>
          </motion.g>
        </motion.g>

        {/* ===== confetti burst from the plaque ===== */}
        {CONFETTI.map((c, i) => (
          <motion.rect
            key={i}
            x={290 - c.w / 2}
            y={618 - c.w / 2}
            width={c.w}
            height={c.w * 0.6}
            rx="1.5"
            fill={c.color}
            {...(reduce
              ? { style: { opacity: 0 } }
              : (a({
                  x: arr(0, { 9: c.dx * 0.7, 10: c.dx }),
                  y: arr(0, { 9: c.up, 10: c.fall }),
                  rotate: arr(0, { 9: c.rot * 0.5, 10: c.rot }),
                  opacity: arr(0, { 8: 1, 9: 1 }),
                  scale: arr(0, { 8: 1, 9: 1, 10: 0.8 }),
                }) as object))}
          />
        ))}
      </svg>
    </div>
  );
}
