"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Running() {
  const root = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!root.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const sine = "sine.inOut";

      // platforms float
      gsap.to("#pA", { y: -8, rotation: -0.8, svgOrigin: "260 600", duration: 2, ease: sine, yoyo: true, repeat: -1 });
      gsap.to("#pB", { y: -10, rotation: 0.8, svgOrigin: "660 600", duration: 2.3, ease: sine, yoyo: true, repeat: -1, delay: 0.4 });

      // BIKE: road scrolls toward viewer, wheel tread spins, body shudders and sways
      gsap.fromTo(".lineA", { strokeDashoffset: 0 }, { strokeDashoffset: 60, duration: 0.6, ease: "none", repeat: -1 });
      gsap.fromTo(".tread", { strokeDashoffset: 0 }, { strokeDashoffset: -24, duration: 0.25, ease: "none", repeat: -1 });
      gsap.to("#biker", { y: -3, duration: 0.09, ease: "none", yoyo: true, repeat: -1 });
      gsap.fromTo("#biker", { rotation: -1.6, svgOrigin: "290 520" }, { rotation: 1.6, svgOrigin: "290 520", duration: 1.4, ease: sine, yoyo: true, repeat: -1 });
      gsap.to("#bHead", { rotation: 2, svgOrigin: "366 292", duration: 0.8, ease: sine, yoyo: true, repeat: -1 });
      gsap.utils.toArray<SVGElement>(".puff").forEach((p, i) => {
        gsap.fromTo(
          p,
          { x: 0, y: 0, opacity: 0.9, scale: 0.6 },
          { x: 34, y: -55, opacity: 0, scale: 1.3, duration: 1.6, ease: "power1.out", repeat: -1, delay: i * 0.5, transformOrigin: "center" }
        );
      });

      // WALKER: one step = 0.42s, ground scrolls at the same pace
      const step = 0.42;
      const swing = (sel: string, origin: string, a: number, from: number) =>
        gsap.fromTo(
          sel,
          { rotation: from * a, svgOrigin: origin },
          { rotation: -from * a, svgOrigin: origin, duration: step, ease: sine, yoyo: true, repeat: -1 }
        );
      swing("#legL", "636 548", 22, -1);
      swing("#legR", "678 548", 22, 1);
      swing("#armL", "584 498", 16, 1);
      gsap.fromTo("#armR", { rotation: -4, svgOrigin: "698 498" }, { rotation: 4, svgOrigin: "698 498", duration: step, ease: sine, yoyo: true, repeat: -1 });
      gsap.fromTo("#torso", { y: 0 }, { y: -7, duration: step / 2, ease: sine, yoyo: true, repeat: -1 });
      gsap.fromTo("#head", { rotation: -4, svgOrigin: "640 440" }, { rotation: 4, svgOrigin: "640 440", duration: step, ease: sine, yoyo: true, repeat: -1 });
      gsap.fromTo(".lineB", { strokeDashoffset: 0 }, { strokeDashoffset: 56, duration: step * 2, ease: "none", repeat: -1 });
      gsap.to("#bloom", { rotation: 360, svgOrigin: "684 390", duration: 3, ease: "none", repeat: -1 });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", minWidth: 0, overflow: "hidden" }}>
    <svg
      ref={root}
          viewBox="40 80 860 720"
          role="img"
          aria-label="Biker riding and a man walking with a flower"
          style={{ display: "block", width: "100%", maxWidth: 720, height: "auto", overflow: "hidden" }}
        >
      {/* ORANGE PLATFORM */}
      <g id="pA">
        <path d="M52 585 Q52 560 80 530 L250 355 Q268 340 300 348 L455 385 Q478 392 472 420 L418 685 Q410 712 380 708 L120 662 Q60 645 52 585Z" fill="#e69032"/>
        <path d="M52 575 Q52 550 80 520 L250 345 Q268 330 300 338 L455 375 Q478 382 472 410 L418 670 Q408 695 380 690 L120 645 Q62 630 52 575Z" fill="#f5b355"/>
        <path d="M68 572 Q68 552 95 525 L260 358 Q272 348 296 354 L448 390 Q462 396 458 414 L404 662 Q398 676 380 674 L125 628 Q76 618 68 572Z" fill="#fff"/>
        <path className="lineA" d="M100 620 Q135 470 265 380" stroke="#e9f0fb" strokeWidth="16" fill="none" strokeDasharray="40 20"/>
        <path className="lineA" d="M330 668 Q360 520 440 392" stroke="#e9f0fb" strokeWidth="16" fill="none" strokeDasharray="40 20"/>
      </g>
      {/* BLUE PLATFORM */}
      <g id="pB">
        <path d="M455 420 L492 715 Q500 765 545 768 L800 712 Q858 698 862 640 L866 612 Q850 540 812 480 L690 405 Q520 385 455 420Z" fill="#1b438a"/>
        <path d="M455 415 L495 700 Q505 730 540 724 L812 664 Q858 652 862 612 Q850 550 812 478 L690 400 Q520 385 455 415Z" fill="#a6dcfb"/>
        <path d="M472 420 L510 688 Q516 708 540 705 L808 646 Q840 638 842 612 Q834 560 798 492 L682 418 Q525 402 472 420Z" fill="#fff"/>
        <path className="lineB" d="M545 690 Q540 560 590 440" stroke="#eef5fc" strokeWidth="14" fill="none" strokeDasharray="36 20"/>
        <path className="lineB" d="M790 640 Q800 560 740 450" stroke="#eef5fc" strokeWidth="14" fill="none" strokeDasharray="36 20"/>
      </g>
    
      <g fill="#d9d9d9">
        <circle className="puff" cx="445" cy="355" r="38"/>
        <circle className="puff" cx="460" cy="300" r="30"/>
        <circle className="puff" cx="478" cy="248" r="22"/>
      </g>
    
      {/* BIKER */}
      <g id="biker">
        {/* jacket body */}
        <path d="M262 218 Q262 200 292 205 L402 216 Q472 226 476 272 L478 332 L332 352 L300 300Z" fill="#bd6e22"/>
        <path d="M346 272 L406 268 L396 322 L360 322Z" fill="#fff"/>
        {/* legs: hips behind headlight, knees out, shins down to feet beside tank */}
        <path d="M332 318 L268 332 L284 388" stroke="#70410f" strokeWidth="48" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M346 322 L414 346 L374 402" stroke="#70410f" strokeWidth="48" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <ellipse cx="288" cy="398" rx="21" ry="12" fill="#f5b232" transform="rotate(-8 288 398)"/>
        <ellipse cx="372" cy="412" rx="21" ry="12" fill="#f5b232" transform="rotate(8 372 412)"/>
        {/* handlebar (full): left arm curve + grip, bar behind headlight, right arm + grip */}
        <path d="M300 314 L372 316" stroke="#a9a9a9" strokeWidth="9" strokeLinecap="round"/>
        <path d="M250 290 L292 295 Q302 297 303 316" stroke="#a9a9a9" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M366 314 L398 317" stroke="#a9a9a9" strokeWidth="9" strokeLinecap="round"/>
        <path d="M244 288 L274 292" stroke="#444" strokeWidth="14" strokeLinecap="round"/>
        <path d="M394 316 L442 322" stroke="#444" strokeWidth="14" strokeLinecap="round"/>
        {/* bike front */}
        <g transform="translate(338 330) rotate(10)">
          <rect x="-37" y="0" width="9" height="118" rx="4" fill="#a9a9a9"/>
          <rect x="28" y="0" width="9" height="118" rx="4" fill="#a9a9a9"/>
          <rect x="-24" y="62" width="48" height="152" rx="24" fill="#3d3d3d"/>
          <path className="tread" d="M0 78 V205" stroke="#6b6b6b" strokeWidth="24" strokeDasharray="9 15" fill="none"/>
          <path d="M-31 104 Q-31 76 0 74 Q31 76 31 104 L27 130 Q0 140 -27 130Z" fill="#9a9a9a"/>
          <rect x="-29" y="26" width="58" height="84" rx="26" fill="#ee5a52"/>
          <ellipse cx="0" cy="0" rx="37" ry="32" fill="#ee5a52"/>
          <ellipse cx="1" cy="0" rx="26" ry="20" fill="#dff0fc"/>
          <ellipse cx="-7" cy="-7" rx="8" ry="4" fill="#fff" opacity=".8"/>
        </g>
        {/* arms & hands on grips */}
        <path d="M306 256 L264 264 L268 290" stroke="#bd6e22" strokeWidth="32" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M430 262 L468 286 L428 310" stroke="#bd6e22" strokeWidth="32" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <ellipse cx="266" cy="291" rx="24" ry="16" fill="#f7cca8" transform="rotate(8 266 291)"/>
        <ellipse cx="422" cy="316" rx="24" ry="16" fill="#f7cca8" transform="rotate(10 422 316)"/>
        {/* head */}
        <g id="bHead">
          <circle cx="366" cy="240" r="58" fill="#f7cca8"/>
          <path d="M312 224 Q316 187 366 184 Q414 188 424 224 Q388 202 366 204 Q332 204 312 224Z" fill="#d7c8bc"/>
          <path d="M324 162 Q316 112 354 110 Q388 110 396 144 Q428 150 426 184 Q401 204 351 198 Q326 187 324 162Z" fill="#3b3b3b"/>
          <ellipse cx="350" cy="250" rx="13" ry="9" fill="#fff"/><ellipse cx="388" cy="246" rx="13" ry="9" fill="#fff"/>
          <circle cx="352" cy="252" r="5" fill="#333"/><circle cx="387" cy="248" r="5" fill="#333"/>
          <path d="M334 236 L362 246 M402 234 L376 244" stroke="#b9672b" strokeWidth="4" strokeLinecap="round"/>
          <path d="M361 278 Q374 288 388 278" stroke="#d98f6a" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </g>
      </g>
    
      {/* WALKER */}
      <g id="walker">
        <g id="legL"><path d="M636 548 L630 598" stroke="#3a82c4" strokeWidth="34" strokeLinecap="round"/><ellipse cx="628" cy="610" rx="22" ry="13" fill="#b9408f"/></g>
        <g id="legR"><path d="M678 548 L676 592" stroke="#3a82c4" strokeWidth="34" strokeLinecap="round"/><ellipse cx="680" cy="603" rx="22" ry="13" fill="#b9408f"/></g>
        <g id="torso">
          <path d="M572 472 Q640 440 706 470 Q724 520 704 560 L600 560 Q568 520 572 472Z" fill="#b9408f"/>
          <path d="M600 546 L704 528 L702 556 L604 574Z" fill="#1b438a"/>
          <path d="M610 495 l12 8 l12 -8 M640 505 l12 8 l12 -8 M625 522 l12 8 l12 -8" stroke="#8d2c6c" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <g id="armL">
            <path d="M584 500 L568 570" stroke="#b97a5c" strokeWidth="28" strokeLinecap="round"/>
            <path d="M584 500 L578 528" stroke="#b9408f" strokeWidth="34" strokeLinecap="round"/>
          </g>
          <g id="armR">
            <path d="M698 498 L726 470 L714 436" stroke="#b97a5c" strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M698 498 L716 482" stroke="#b9408f" strokeWidth="34" strokeLinecap="round"/>
            <path d="M714 436 L692 398" stroke="#58b9b9" strokeWidth="7" strokeLinecap="round"/>
            <g id="bloom"><circle cx="684" cy="390" r="20" fill="#b9408f"/><circle cx="684" cy="390" r="9" fill="#fff"/></g>
            <circle cx="714" cy="436" r="15" fill="#b97a5c"/>
          </g>
          <g id="head">
            <ellipse cx="625" cy="362" rx="88" ry="68" fill="#3a82c4"/>
            <path d="M660 300 Q700 340 690 395" stroke="#2f6aa6" strokeWidth="6" fill="none" strokeLinecap="round"/>
            <ellipse cx="640" cy="418" rx="52" ry="46" fill="#b97a5c"/>
            <path d="M588 412 Q596 505 650 508 Q706 500 702 412 Q650 448 588 412Z" fill="#3d3d3d"/>
            <ellipse cx="622" cy="398" rx="14" ry="18" fill="#fff"/><ellipse cx="662" cy="394" rx="14" ry="18" fill="#fff"/>
            <ellipse cx="627" cy="394" rx="6" ry="9" fill="#333"/><ellipse cx="667" cy="390" rx="6" ry="9" fill="#333"/>
            <ellipse cx="648" cy="445" rx="14" ry="6" fill="#fff"/>
          </g>
        </g>
      </g>
    </svg>
    </div>
  );
}
