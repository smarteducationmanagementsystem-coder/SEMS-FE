"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { classNames } from "@/lib/format";

const navy = "#001038";
const blue = "#0060e4";
const blueDeep = "#003ca8";
const mist = "#e7f3ff";

type SupplyKind = "book" | "open-book" | "pencil" | "pen";

interface Supply {
  kind: SupplyKind;
  x: string;
  y: string;
  rotate: number;
  delay: string;
  bob: string;
  front: boolean;
  scale?: number;
}

const supplies: Supply[] = [
  { kind: "book", x: "16%", y: "16%", rotate: -22, delay: "40ms", bob: "0s", front: false },
  { kind: "pencil", x: "48%", y: "8%", rotate: 28, delay: "90ms", bob: "0.4s", front: true },
  { kind: "pen", x: "82%", y: "18%", rotate: 16, delay: "140ms", bob: "0.8s", front: true },
  { kind: "open-book", x: "12%", y: "62%", rotate: -14, delay: "180ms", bob: "0.2s", front: true, scale: 1.05 },
  { kind: "pencil", x: "78%", y: "58%", rotate: -32, delay: "230ms", bob: "0.6s", front: false, scale: 0.9 },
  { kind: "pen", x: "30%", y: "86%", rotate: 12, delay: "280ms", bob: "1s", front: true, scale: 0.92 },
  { kind: "book", x: "70%", y: "84%", rotate: 18, delay: "330ms", bob: "0.15s", front: true, scale: 0.82 },
];

function Book({ open = false }: { open?: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 92 64" className="h-16 w-[5.75rem]" aria-hidden="true">
        <path d="M8 10c12 6 22 6 38 0v44c-16 6-26 6-38 0V10Z" fill={mist} stroke={blue} strokeWidth="2" />
        <path d="M84 10C72 16 62 16 46 10v44c16 6 26 6 38 0V10Z" fill="#f7fbff" stroke={blue} strokeWidth="2" />
        <path d="M46 12v42" stroke={navy} strokeWidth="3" />
        <path d="M16 22h20M16 30h16M54 22h20M58 30h16" stroke={blueDeep} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 72 56" className="h-14 w-[4.5rem]" aria-hidden="true">
      <path d="M8 8h40c8 0 16 3 16 10v30H18C10 48 8 42 8 34V8Z" fill={blue} />
      <path d="M8 8h40c8 0 16 3 16 10v4H14C10 22 8 16 8 12V8Z" fill={blueDeep} />
      <path d="M14 18v30" stroke={mist} strokeWidth="3" />
      <path d="M24 28h24M24 35h18" stroke={mist} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Pencil() {
  return (
    <svg viewBox="0 0 28 120" className="h-28 w-7" aria-hidden="true">
      <rect x="6" y="16" width="16" height="78" rx="2" fill={blue} />
      <rect x="6" y="16" width="16" height="10" fill={navy} />
      <path d="M6 94h16l-8 20Z" fill="#f4e2c4" />
      <path d="M10 106h8l-4 8Z" fill={navy} />
      <rect x="6" y="8" width="16" height="10" rx="2" fill="#f2b8b0" />
      <rect x="11" y="2" width="6" height="8" rx="1" fill={navy} />
    </svg>
  );
}

function Pen() {
  return (
    <svg viewBox="0 0 24 120" className="h-28 w-6" aria-hidden="true">
      <rect x="7" y="10" width="10" height="78" rx="5" fill={navy} />
      <rect x="7" y="34" width="10" height="8" fill={blue} />
      <path d="M7 88h10l-5 22Z" fill={blueDeep} />
      <rect x="9" y="4" width="6" height="10" rx="2" fill={blue} />
    </svg>
  );
}

function SupplyGraphic({ kind }: { kind: SupplyKind }) {
  if (kind === "book") return <Book />;
  if (kind === "open-book") return <Book open />;
  if (kind === "pencil") return <Pencil />;
  return <Pen />;
}

/** Resting phone in the logo blues. Hover or click sends books, pencils, and pens out of it. */
export function HeroSupplies() {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const touching = useRef(false);
  const shown = hovered || pinned;

  // Touch has no real hover. Only the tap decides, so a second tap puts the supplies back.
  function onPointerEnter(event: PointerEvent<HTMLButtonElement>) {
    touching.current = event.pointerType !== "mouse";
    if (!touching.current) setHovered(true);
  }

  // Scrolling the phone out of view tucks the supplies back inside.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting) {
          setPinned(false);
          setHovered(false);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={shown}
      aria-label={shown ? "Hide books, pencils, and pens" : "Show books, pencils, and pens"}
      onPointerEnter={onPointerEnter}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) setHovered(true);
      }}
      onBlur={() => setHovered(false)}
      onClick={() => {
        if (touching.current) setHovered(false);
        setPinned((open) => !open);
      }}
      className="group relative mx-auto block h-[440px] w-full max-w-[560px] cursor-pointer rounded-[2rem] outline-none focus-visible:ring-2 focus-visible:ring-[#0060e4] focus-visible:ring-offset-4 sm:h-[520px]"
    >
      {supplies.map((item, index) => (
        <span
          key={`${item.kind}-${index}`}
          className={classNames(
            "pointer-events-none absolute motion-reduce:transition-none",
            item.front ? "z-20" : "z-0",
          )}
          style={{
            left: shown ? item.x : "50%",
            top: shown ? item.y : "48%",
            opacity: shown ? 1 : 0,
            transform: `translate(-50%, -50%) rotate(${shown ? item.rotate : 0}deg) scale(${shown ? (item.scale ?? 1) : 0.2})`,
            transition: "left 700ms cubic-bezier(0.22, 1, 0.36, 1), top 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease",
            transitionDelay: shown ? item.delay : "0ms",
          }}
        >
          <span className={classNames("block", shown && "animate-hero-bob motion-reduce:animate-none")} style={{ animationDelay: item.bob }}>
            <SupplyGraphic kind={item.kind} />
          </span>
        </span>
      ))}

      <span
        className={classNames(
          "absolute top-1/2 left-1/2 z-10 block h-[320px] w-[210px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none sm:h-[360px] sm:w-[236px]",
          shown ? "-rotate-6" : "-rotate-[16deg]",
        )}
      >
        <span className="absolute inset-0 translate-x-[-18px] translate-y-[16px] rounded-[46px] bg-[#0060e4] shadow-[0_24px_40px_-24px_rgba(0,16,56,0.65)]" />
        <span className="absolute inset-0 rounded-[46px] border-[3px] border-[#9ec9ff] bg-[#f5f9ff] shadow-[inset_0_0_0_8px_#e7f3ff]">
          <span className="grid h-full place-items-center">
            <span className="grid size-24 place-items-center rounded-[28px] bg-[#0060e4] shadow-[0_10px_24px_-12px_rgba(0,16,56,0.8)] sm:size-28">
              <svg viewBox="0 0 64 64" className="size-14 sm:size-16" aria-hidden="true">
                <path d="M10 18h28c6 0 10 3 10 8v24H20c-6 0-10-4-10-10V18Z" fill="#f5f9ff" />
                <path d="M18 18v32" stroke={blue} strokeWidth="3" />
                <path d="M26 30h14M26 37h10" stroke={blueDeep} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
