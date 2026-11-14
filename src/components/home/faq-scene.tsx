import type { ReactNode } from "react";

/** Two tilted phones: a student rides a bicycle on the first, a teacher walks on the second. */
export function FaqScene() {
  return (
    <div className="relative mx-auto h-[420px] w-full max-w-xl sm:h-[500px]" style={{ perspective: "900px" }} aria-hidden="true">
      <div className="animate-faq-float absolute top-[18%] left-0 w-[62%] motion-reduce:animate-none">
        <Phone tone="orange" tilt="-22deg">
          <Lane />
          <Coin className="top-6 right-8" />
          <Coin className="bottom-8 left-10 size-9" />
          <span className="absolute bottom-5 left-1/2 size-10 -translate-x-1/2 rounded-full bg-[#d5d8de]" />
        </Phone>
      </div>

      <div className="animate-faq-ride absolute top-[2%] left-[8%] w-[46%] motion-reduce:animate-none sm:left-[12%]">
        <StudentOnCycle />
      </div>

      <div className="animate-faq-float absolute right-0 bottom-[6%] w-[62%] motion-reduce:animate-none" style={{ animationDelay: "0.6s" }}>
        <Phone tone="blue" tilt="16deg">
          <Coin className="top-8 left-8" />
          <Coin className="right-8 bottom-10 size-11" />
          <span className="absolute bottom-4 left-8 size-8 rounded-full bg-[#d5d8de]" />
          <Flower className="top-6 right-10" />
          <Flower className="bottom-8 right-16 scale-75" />
        </Phone>
      </div>

      <div className="animate-faq-bob absolute right-[14%] bottom-[28%] w-[34%] motion-reduce:animate-none sm:right-[16%]">
        <Teacher />
      </div>
    </div>
  );
}

function Phone({ tone, tilt, children }: { tone: "orange" | "blue"; tilt: string; children: ReactNode }) {
  const edge = tone === "orange" ? "bg-[#f08a00]" : "bg-[#0b4fbe]";
  const rim = tone === "orange" ? "bg-[#ff9f1c]" : "bg-[#2f7cf6]";
  return (
    <div style={{ transform: `rotateX(58deg) rotateZ(${tilt})` }}>
      <div className={`rounded-[2.2rem] ${edge} pt-1 pr-1 pb-5 pl-4 shadow-[0_18px_30px_-20px_rgba(0,0,0,0.35)]`}>
        <div className={`rounded-[1.9rem] p-[3px] ${rim}`}>
          <div className="relative h-40 overflow-hidden rounded-[1.7rem] bg-white sm:h-48">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Lane() {
  return (
    <>
      <span className="absolute inset-y-0 left-[18%] w-3 -rotate-12 bg-[#e7eef8]" />
      <span className="absolute inset-y-0 left-[42%] w-3 -rotate-12 bg-[#e7eef8]" />
      <span className="absolute inset-y-0 left-[66%] w-3 -rotate-12 bg-[#e7eef8]" />
    </>
  );
}

function Coin({ className }: { className?: string }) {
  return <span className={`absolute size-10 rounded-full bg-[#ffd000] shadow-[inset_0_-3px_0_#e6b800] ${className ?? ""}`} />;
}

function Flower({ className }: { className?: string }) {
  return (
    <span className={`absolute ${className ?? ""}`}>
      <span className="block h-4 w-0.5 bg-[#3aaa5a]" />
      <span className="absolute -top-2 -left-1.5 size-4 rounded-full bg-[#ff4f8b]" />
    </span>
  );
}

function StudentOnCycle() {
  return (
    <svg viewBox="0 0 220 250" className="h-auto w-full overflow-visible">
      <g className="animate-faq-spin motion-reduce:animate-none" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx="58" cy="188" r="28" fill="none" stroke="#2a2a2a" strokeWidth="7" />
        <circle cx="58" cy="188" r="5" fill="#2a2a2a" />
        <path d="M58 162v52M32 188h52M40 170l36 36M40 206l36-36" stroke="#2a2a2a" strokeWidth="3" />
      </g>
      <g className="animate-faq-spin motion-reduce:animate-none" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <circle cx="162" cy="188" r="28" fill="none" stroke="#2a2a2a" strokeWidth="7" />
        <circle cx="162" cy="188" r="5" fill="#2a2a2a" />
        <path d="M162 162v52M136 188h52M144 170l36 36M144 206l36-36" stroke="#2a2a2a" strokeWidth="3" />
      </g>
      <path d="M58 188 L110 150 L162 120 L162 188 L118 188 Z" fill="none" stroke="#e23b3b" strokeWidth="6" strokeLinejoin="round" />
      <path d="M110 150 L118 188" stroke="#e23b3b" strokeWidth="6" />
      <path d="M148 112h28" stroke="#2a2a2a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="118" cy="188" r="7" fill="#2a2a2a" />
      <g className="animate-faq-spin motion-reduce:animate-none" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
        <path d="M118 188 l18 -8 M118 188 l-16 10" stroke="#2a2a2a" strokeWidth="4" strokeLinecap="round" />
      </g>
      <circle cx="112" cy="62" r="20" fill="#f3c7a6" />
      <path d="M94 58c2-16 34-16 36 0-2 8-8 12-12 12h-14c-6 0-10-4-10-12Z" fill="#1a1a1a" />
      <circle cx="105" cy="64" r="2" fill="#1a1a1a" />
      <circle cx="119" cy="64" r="2" fill="#1a1a1a" />
      <path d="M106 72c3 3 8 3 11 0" stroke="#1a1a1a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M92 88c8-14 36-14 44 2l6 28H96l-4-30Z" fill="#0060e4" />
      <path d="M100 116c6 18 8 36 4 52" stroke="#1a1a1a" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M124 116c8 16 16 30 10 48" stroke="#1a1a1a" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M96 96c-8 10 8 18 20 8" stroke="#0060e4" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Teacher() {
  return (
    <svg viewBox="0 0 160 230" className="h-auto w-full overflow-visible">
      <circle cx="82" cy="42" r="24" fill="#f3c7a6" />
      <path d="M60 40c4-22 42-24 48-2 2 8-4 14-12 14H70c-6 0-12-4-10-12Z" fill="#1a1a1a" />
      <circle cx="74" cy="44" r="2.2" fill="#1a1a1a" />
      <circle cx="92" cy="44" r="2.2" fill="#1a1a1a" />
      <path d="M74 54c4 4 12 4 16 0" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M58 78c6-16 44-16 52 2l8 46H54l4-48Z" fill="#7a3cff" />
      <path d="M70 86h24" stroke="#ffffff" strokeWidth="3" opacity="0.7" />
      <g className="origin-[70px_124px] animate-faq-step motion-reduce:animate-none">
        <path d="M70 124 l-8 62" stroke="#0060e4" strokeWidth="10" strokeLinecap="round" />
      </g>
      <g className="origin-[96px_124px] animate-faq-step motion-reduce:animate-none" style={{ animationDelay: "0.35s" }}>
        <path d="M96 124 l10 62" stroke="#0060e4" strokeWidth="10" strokeLinecap="round" />
      </g>
      <g className="origin-[58px_90px] animate-faq-step motion-reduce:animate-none" style={{ animationDelay: "0.35s" }}>
        <path d="M58 90 l-16 28" stroke="#f3c7a6" strokeWidth="6" strokeLinecap="round" />
      </g>
      <g className="origin-[108px_92px] animate-faq-step motion-reduce:animate-none">
        <path d="M108 92 l22 8" stroke="#f3c7a6" strokeWidth="6" strokeLinecap="round" />
        <rect x="124" y="86" width="18" height="14" rx="2" fill="#f7fbff" stroke="#0060e4" strokeWidth="2" />
      </g>
    </svg>
  );
}
