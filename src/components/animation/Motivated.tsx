"use client";

/**
 * Motivated — looping illustration for the right side of a hero / section.
 *
 * A student keeps WALKING briskly forward. ONE STEP PER PHONE: a new phone "tab" (streak
 * card) pops in ahead of her, she puts exactly one foot on it, the grey (dead) flame
 * lights up orange with a stomp (shock ring + sparks), and the card drifts back behind
 * her, shrinking and fading. The next step lands on the next phone, with the other foot.
 *
 * Built with framer-motion + inline SVG.
 *   - STRIDE (1.0s = left step + right step): legs, arms, bob, hair
 *   - STEP   (0.5s): the little hop of every step
 *   - CARD life (2.5s): every card travels along the same path; 5 cards are spread
 *     evenly along it, so a new card arrives exactly once per step
 *   Change `P` (seconds per step) to make her walk faster or slower.
 *
 * Each card sits in its own <svg> layer whose z-index is animated, so the card that is
 * nearest to the viewer is always on top.
 *
 * Install:  npm i framer-motion
 * Usage:    <Motivated />   (right column; it scales to its container)
 * Colours:  edit the `C` object.
 */

import { motion, useReducedMotion } from "framer-motion";
import type { Easing, Transition } from "framer-motion";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

/* ---------------- palette ---------------- */
const C = {
  skin: "#f6c9b8",
  skinShade: "#e3a995",
  hair: "#2d2a4a",
  band: "#ffb703",
  jacket: "#ff6b5b",
  jacketDark: "#d94c3f",
  pants: "#2a2f55",
  shoe: "#ffffff",
  sole: "#ff6b5b",
  cardEdge: "#1b3fc2",
  cardRim: "#6f93ff",
  cardFace: "#ffffff",
  bar: "#9db6ff",
  flameO: "#f4962a",
  flameOi: "#ffd24d",
  flameG: "#a7a7ab",
  flameGi: "#e2e2e5",
};

/* ---------------- clocks ---------------- */
const P = 0.5; // seconds per step (smaller = faster walk)
const D = P * 2; // one stride = left step + right step
const LIFE = P * 5; // life of one card (5 cards in flight => one new card per step)

// step loop (every step): [foot lands, settle, lift off, foot lands]
const STEP_TIMES = [0, 0.15, 0.55, 1];
const STEP_EASE: Easing[] = ["easeOut", "linear", "easeIn"];
const step: Transition = { duration: P, times: STEP_TIMES, ease: STEP_EASE, repeat: Infinity };
const burst: Transition = { duration: D, times: [0, 0.2, 0.201, 1], ease: "easeOut", repeat: Infinity };
// one full stride (right foot lands at 0, left foot at 0.5)
const runLoop: Transition = { duration: D, times: [0, 0.25, 0.5, 0.75, 1], ease: "easeInOut", repeat: Infinity };

/* ---------------- the card conveyor ---------------- */
const N = 5; // cards in flight
const M = 160; // samples per life (keyframes)

// where a card is at progress p (0 = pops in ahead, 0.25 = under her feet, 1 = far behind)
const PATH = [
  { p: 0, x: 410, y: 510, s: 0.85 },
  { p: 0.25, x: 318, y: 425, s: 1.0 }, // the phone under her foot
  { p: 0.5, x: 172, y: 330, s: 0.74 },
  { p: 0.75, x: 95, y: 285, s: 0.52 },
  { p: 1, x: 50, y: 258, s: 0.38 },
];
// every card keeps its own tilt and a little sideways offset => scattered look
const TILT = [-14, 12, -9, 16, -17]; // all phones lie horizontally, only slightly turned
const JITTER = [
  { x: 0, y: 0 },
  { x: 12, y: -18 },
  { x: -10, y: 14 },
  { x: 8, y: -12 },
  { x: -12, y: 10 },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const outBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function pathAt(p: number) {
  for (let i = 0; i < PATH.length - 1; i++) {
    const a = PATH[i];
    const b = PATH[i + 1];
    if (p <= b.p) {
      const t = (p - a.p) / (b.p - a.p);
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t) };
    }
  }
  const l = PATH[PATH.length - 1];
  return { x: l.x, y: l.y, s: l.s };
}

type CardKeys = {
  x: number[];
  y: number[];
  scale: number[];
  rotate: number[];
  opacity: number[];
  zIndex: number[];
  lit: number[]; // 0 = grey flame, 1 = orange flame
  grey: number[];
  pop: number[]; // flame pop scale
};

/** sample one card's whole life into keyframe arrays (computed once, at module load) */
function buildCard(k: number): CardKeys {
  const out: CardKeys = { x: [], y: [], scale: [], rotate: [], opacity: [], zIndex: [], lit: [], grey: [], pop: [] };
  for (let i = 0; i <= M; i++) {
    // integer maths so the "stomp" lands exactly on a sample
    const p = ((i + M * 0.25 + k * (M / N)) % M) / M;
    const pt = pathAt(p);
    const shove = p >= 0.25 - 1e-6 && p < 0.6 ? Math.exp(-(p - 0.25) / 0.06) : 0;

    out.x.push(pt.x + JITTER[k].x * pt.s + 8 * shove);
    out.y.push(pt.y + JITTER[k].y * pt.s + 14 * shove);
    out.scale.push(pt.s * (p < 0.1 ? Math.max(0, outBack(p / 0.1)) : 1));
    out.rotate.push(TILT[k] + p * 14 + 5 * shove);

    let op = 1;
    if (p < 0.02) op = p / 0.02;
    else if (p > 0.86) op = Math.max(0, (0.95 - p) / 0.09);
    out.opacity.push(op);

    out.zIndex.push(Math.round((1 - p) * 50) + 1); // nearer = on top

    const lit = p < 0.25 - 1e-6 ? 0 : Math.min(1, (p - 0.25) / 0.04);
    out.lit.push(lit);
    out.grey.push(1 - lit);
    out.pop.push(p >= 0.25 - 1e-6 && p < 0.6 ? 1 + 0.45 * Math.exp(-(p - 0.25) / 0.05) : 1);
  }
  return out;
}
const CARDS: CardKeys[] = Array.from({ length: N }, (_, k) => buildCard(k));
const cardLife: Transition = { duration: LIFE, ease: "linear", repeat: Infinity };

/* ---------------- helpers ---------------- */
type Keys = Record<string, number[]>;
type MotionGProps = Omit<ComponentProps<typeof motion.g>, "x" | "y" | "r" | "children">;

type PivotProps = MotionGProps & { x: number; y: number; r?: number; children?: ReactNode };
/** Invisible square centred on the pivot so a group rotates/scales exactly around (x, y). */
function Pivot({ x, y, r = 120, children, ...rest }: PivotProps) {
  return (
    <motion.g {...rest}>
      <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill="transparent" pointerEvents="none" />
      {children}
    </motion.g>
  );
}

function Flame({ outer, inner }: { outer: string; inner: string }) {
  return (
    <>
      <path
        d="M0 -52 C10 -34 34 -20 34 8 C34 32 18 46 0 46 C-18 46 -34 32 -34 8 C-34 -6 -26 -16 -18 -28 C-14 -18 -8 -14 -4 -12 C-2 -26 -4 -40 0 -52 Z"
        fill={outer}
      />
      <path
        d="M2 2 C12 10 20 16 20 26 C20 35 12 40 2 40 C-8 40 -16 35 -16 26 C-16 16 -8 10 2 2 Z"
        fill={inner}
      />
    </>
  );
}

/** a phone card drawn around (0,0) */
function CardArt({ children }: { children?: ReactNode }) {
  const w = 230; // landscape phone
  const h = 150;
  return (
    <>
      <rect x={-w / 2} y={-h / 2 + 10} width={w} height={h} rx={22} fill={C.cardEdge} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill={C.cardRim} />
      <rect x={-w / 2 + 5} y={-h / 2 + 5} width={w - 10} height={h - 10} rx={18} fill={C.cardFace} />
      <rect x={14} y={-24} width={84} height={15} rx={7.5} fill={C.bar} />
      <rect x={14} y={4} width={58} height={15} rx={7.5} fill={C.bar} />
      {children}
    </>
  );
}

const layerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  overflow: "visible",
  pointerEvents: "none",
};

/** one leg: thigh -> knee -> shin -> ankle -> foot. Straight down at rest. */
function Leg({
  hx, hy, thigh, shin, foot, run,
}: {
  hx: number; hy: number; thigh: number[]; shin: number[]; foot: number[];
  run: (k: Keys) => Partial<MotionGProps>;
}) {
  const kneeY = hy + 44;
  const ankleY = hy + 86;
  return (
    <Pivot x={hx} y={hy} r={125} {...run({ rotate: thigh })}>
      <path d={`M${hx} ${hy} L${hx} ${kneeY}`} stroke={C.pants} strokeWidth="26" strokeLinecap="round" />
      <Pivot x={hx} y={kneeY} r={85} {...run({ rotate: shin })}>
        <path d={`M${hx} ${kneeY} L${hx} ${ankleY}`} stroke={C.pants} strokeWidth="26" strokeLinecap="round" />
        <Pivot x={hx} y={ankleY} r={45} {...run({ rotate: foot })}>
          <ellipse cx={hx + 11} cy={ankleY + 8} rx="23" ry="10.5" fill={C.shoe} />
          <rect x={hx - 11} y={ankleY + 13} width="45" height="6" rx="3" fill={C.sole} />
        </Pivot>
      </Pivot>
    </Pivot>
  );
}

/** one arm: shoulder -> elbow -> fist. Hangs straight down at rest. */
function Arm({
  sx, sy, color, upper, fore, run,
}: {
  sx: number; sy: number; color: string; upper: number[]; fore: number[];
  run: (k: Keys) => Partial<MotionGProps>;
}) {
  const ex = sx + 2;
  const ey = sy + 44;
  return (
    <Pivot x={sx} y={sy} r={115} {...run({ rotate: upper })}>
      <path d={`M${sx} ${sy} L${ex} ${ey}`} stroke={color} strokeWidth="25" strokeLinecap="round" />
      <Pivot x={ex} y={ey} r={70} {...run({ rotate: fore })}>
        <path d={`M${ex} ${ey} L${ex + 2} ${ey + 38}`} stroke={color} strokeWidth="25" strokeLinecap="round" />
        <circle cx={ex + 2} cy={ey + 44} r="14" fill={C.skin} />
      </Pivot>
    </Pivot>
  );
}

/* ---------------- component ---------------- */
type Props = { className?: string; style?: CSSProperties; label?: string };

export default function Motivated({
  className,
  style,
  label = "A motivated student runs forward while new streak phones appear under her feet and light up",
}: Props) {
  const reduce = useReducedMotion();

  const withKeys = (keys: Keys, transition: Transition): Partial<MotionGProps> => {
    if (reduce) return {};
    const initial = Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, v[0]]));
    return { initial, animate: keys, transition };
  };
  const a = (keys: Keys) => withKeys(keys, step);
  const run = (keys: Keys) => withKeys(keys, runLoop);
  const flicker = (delay = 0): Partial<MotionGProps> =>
    reduce
      ? {}
      : {
          animate: { scaleY: [1, 1.07, 0.97, 1.05, 1], scaleX: [1, 0.97, 1.03, 0.98, 1] },
          transition: { duration: 1.1, repeat: Infinity, ease: "easeInOut", delay },
        };

  /** props for a card layer / group: animated normally, or frozen on its first frame */
  const cardAnim = (keys: Partial<CardKeys>) => {
    const first = Object.fromEntries(Object.entries(keys).map(([k, v]) => [k, (v as number[])[0]]));
    return reduce ? { initial: first } : { initial: first, animate: keys, transition: cardLife };
  };

  // right foot lands at the start of the stride, left foot half a stride (= one step) later
  const FEET = [
    { x: 332, y: 434, delay: 0 },
    { x: 296, y: 434, delay: P },
  ];
  const sparks = [200, 250, 300, 345, 20].map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const dist = 56 + (i % 2) * 18;
    return {
      dx: Math.cos(rad) * dist,
      dy: Math.sin(rad) * dist,
      fill: [C.flameO, C.flameOi, C.cardRim][i % 3],
      r: 4 + (i % 3),
    };
  });

  // leg poses [contact, stance, push-off, knee-up, contact] (negative = forward)
  const R = { thigh: [-38, -5, 35, -60, -38], shin: [5, 0, 45, 75, 5], foot: [33, 5, -45, -10, 33] };
  const L = { thigh: [35, -60, -38, -5, 35], shin: [45, 75, 5, 0, 45], foot: [-45, -10, 33, 5, -45] };

  return (
    <div
      className={className}
      role="img"
      aria-label={label}
      style={{ position: "relative", width: "100%", maxWidth: 560, minWidth: 0, aspectRatio: "540 / 590", isolation: "isolate", overflow: "hidden", ...style }}
    >
      {/* ground shadow */}
      <svg viewBox="0 0 540 590" style={{ ...layerStyle, zIndex: 0 }} aria-hidden="true">
        <ellipse cx="300" cy="572" rx="170" ry="11" fill="rgba(20,30,90,0.08)" />
      </svg>

      {/* ===== the conveyor of phone cards, one layer each ===== */}
      {CARDS.map((c, k) => (
        <motion.svg
          key={k}
          viewBox="0 0 540 590"
          aria-hidden="true"
          style={layerStyle}
          {...(reduce
            ? { initial: { zIndex: c.zIndex[0] } }
            : { initial: { zIndex: c.zIndex[0] }, animate: { zIndex: c.zIndex }, transition: cardLife })}
        >
          <motion.g
            {...cardAnim({ x: c.x, y: c.y, scale: c.scale, rotate: c.rotate, opacity: c.opacity })}
          >
            <rect x={-150} y={-150} width={300} height={300} fill="transparent" pointerEvents="none" />
            <CardArt>
              {/* flame on the left of the landscape phone */}
              <g transform="translate(-46 0) scale(1.05)">
                <motion.g {...cardAnim({ scale: c.pop })}>
                  <rect x={-60} y={-60} width={120} height={120} fill="transparent" pointerEvents="none" />
                  <motion.g {...cardAnim({ opacity: c.grey })} style={reduce ? { opacity: 1 - c.lit[0] } : undefined}>
                    <Flame outer={C.flameG} inner={C.flameGi} />
                  </motion.g>
                  <motion.g {...cardAnim({ opacity: c.lit })} style={reduce ? { opacity: c.lit[0] } : undefined}>
                    <Pivot x={0} y={0} r={60} {...flicker(k * 0.23)}>
                      <Flame outer={C.flameO} inner={C.flameOi} />
                    </Pivot>
                  </motion.g>
                </motion.g>
              </g>
            </CardArt>
          </motion.g>
        </motion.svg>
      ))}

      {/* ===== stomp effects + speed streaks ===== */}
      <svg viewBox="0 0 540 590" style={{ ...layerStyle, zIndex: 90 }} aria-hidden="true">
        {[212, 236, 260].map((y, i) => (
          <motion.line
            key={y}
            x1={176 - i * 6}
            x2={206 - i * 6}
            y1={y}
            y2={y}
            stroke={C.cardRim}
            strokeWidth="5"
            strokeLinecap="round"
            {...(reduce
              ? { style: { opacity: 0 } }
              : {
                  initial: { x: 0, opacity: 0 },
                  animate: { x: [0, -22], opacity: [0, 0.55, 0] },
                  transition: { duration: P / 2, repeat: Infinity, ease: "easeOut", delay: i * 0.07 },
                })}
          />
        ))}
        {FEET.map((f, fi) => (
          <g key={fi}>
            <motion.circle
              cx={f.x}
              cy={f.y}
              r={38}
              fill="none"
              stroke={C.flameO}
              strokeWidth="5"
              {...(reduce
                ? { style: { opacity: 0 } }
                : {
                    initial: { scale: 0, opacity: 0 },
                    animate: { scale: [0.2, 1.8, 0, 0], opacity: [0.9, 0, 0, 0] },
                    transition: { ...burst, delay: f.delay },
                  })}
            />
            {sparks.map((s, i) => (
              <motion.circle
                key={i}
                cx={f.x}
                cy={f.y}
                r={s.r}
                fill={s.fill}
                {...(reduce
                  ? { style: { opacity: 0 } }
                  : {
                      initial: { x: 0, y: 0, scale: 0, opacity: 0 },
                      animate: {
                        x: [0, s.dx, s.dx, 0],
                        y: [0, s.dy + 10, s.dy + 10, 0],
                        scale: [1, 0.4, 0, 0],
                        opacity: [1, 0, 0, 0],
                      },
                      transition: { ...burst, delay: f.delay },
                    })}
              />
            ))}
          </g>
        ))}
      </svg>

      {/* ===== the runner ===== */}
      <svg viewBox="0 0 540 590" style={{ ...layerStyle, zIndex: 100 }} aria-hidden="true">
        <motion.g
          {...a({
            x: [6, 3, -3, 6],
            y: [5, 0, -9, 5],
          })}
        >
          <Pivot x={258} y={325} r={250} {...a({ rotate: [10, 8, 5, 10] })}>
            <motion.g {...run({ y: [-3, 5, -3, 5, -3] })}>
              {/* back arm */}
              <Arm sx={232} sy={238} color={C.jacketDark} upper={[-45, -10, 45, 10, -45]} fore={[-70, -85, -95, -85, -70]} run={run} />
              {/* back leg */}
              <Leg hx={244} hy={330} thigh={L.thigh} shin={L.shin} foot={L.foot} run={run} />

              {/* torso + shorts */}
              <path
                d="M228 218 C228 205 238 198 250 198 L274 198 C286 198 296 205 296 218 L300 302 C300 320 290 332 272 332 L246 332 C228 332 222 320 224 302 Z"
                fill={C.jacket}
              />
              <path d="M262 208 L262 326" fill="none" stroke="#ffd9d3" strokeWidth="4" strokeLinecap="round" />
              <path d="M247 200 L262 214 L277 200" fill="none" stroke={C.jacketDark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="258" y="206" width="8" height="12" rx="2" fill="#ffffff" />
              <path d="M224 306 L300 306 C300 322 290 334 272 334 L246 334 C228 334 222 322 224 306 Z" fill={C.pants} />

              {/* front leg */}
              <Leg hx={280} hy={328} thigh={R.thigh} shin={R.shin} foot={R.foot} run={run} />

              {/* head: faces the viewer, turned a touch to the right (walking direction) */}
              <Pivot x={262} y={196} r={115} {...run({ rotate: [3, 7, 3, 7, 3] })}>
                <Pivot x={218} y={140} r={90} {...run({ rotate: [-12, 8, -12, 8, -12] })}>
                  <path d="M222 128 C190 120 166 142 168 180 C190 164 206 164 226 172 Z" fill={C.hair} />
                </Pivot>
                <circle cx="262" cy="142" r="50" fill={C.hair} />
                <Pivot x={262} y={110} r={34} {...run({ rotate: [-8, 8, -8, 8, -8] })}>
                  <circle cx="262" cy="92" r="18" fill={C.hair} />
                </Pivot>
                <circle cx="217" cy="154" r="9" fill={C.skinShade} />
                <circle cx="308" cy="154" r="9" fill={C.skinShade} />
                <ellipse cx="262" cy="152" rx="45" ry="45" fill={C.skin} />
                <path
                  d="M217 138 C213 102 238 90 262 90 C288 90 311 102 307 138 C295 118 278 112 262 114 C246 112 230 118 217 138 Z"
                  fill={C.hair}
                />
                <path d="M217 130 C240 118 284 118 307 130 L307 143 C284 132 240 132 217 143 Z" fill={C.band} />
                <path d="M216 134 L196 126 L199 148 Z" fill={C.band} />
                {/* eyes look straight at the viewer */}
                <circle cx="246" cy="153" r="9.5" fill="#fff" />
                <circle cx="280" cy="153" r="9.5" fill="#fff" />
                <circle cx="248" cy="155" r="4.8" fill="#23223a" />
                <circle cx="282" cy="155" r="4.8" fill="#23223a" />
                <circle cx="249.5" cy="153" r="1.6" fill="#fff" />
                <circle cx="283.5" cy="153" r="1.6" fill="#fff" />
                <path d="M236 139 Q246 133 257 138" fill="none" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" />
                <path d="M270 138 Q281 133 291 139" fill="none" stroke={C.hair} strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="234" cy="172" r="7" fill="#ff8f85" opacity="0.35" />
                <circle cx="292" cy="172" r="7" fill="#ff8f85" opacity="0.35" />
                <path d="M259 165 Q263 172 268 166" fill="none" stroke={C.skinShade} strokeWidth="3" strokeLinecap="round" />
                {/* big happy open smile */}
                <path d="M246 176 Q263 190 281 176 Q277 197 263 197 Q249 197 246 176 Z" fill="#8c2a22" />
                <path d="M248 177 Q263 184 279 177 L278 182 Q263 188 249 182 Z" fill="#fff" />
                <ellipse cx="263" cy="192" rx="7" ry="3.5" fill="#e0605a" />
              </Pivot>

              {/* front arm */}
              <Arm sx={290} sy={238} color={C.jacket} upper={[45, 10, -45, -10, 45]} fore={[-75, -85, -95, -85, -75]} run={run} />
            </motion.g>
          </Pivot>
        </motion.g>
      </svg>
    </div>
  );
}
