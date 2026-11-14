"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { classNames } from "@/lib/format";

/**
 * Still-water surface for the stats bar. Moving the pointer leaves a wake,
 * a click drops a pebble, and the drop makes a plip. The figures stay the
 * real type: the canvas only paints a light sheen, and leaving the card
 * clears that sheen so the bar returns to the page's own layout.
 */

const CELL = 2.5;
const STEP_HZ = 150;

interface Impulse {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  radius: number;
  strength: number;
  crown: number;
}

export function StatsRipple({
  children,
  className,
  contentClassName,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    const canvas = canvasRef.current;
    if (!root || !content || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let simW = 0;
    let simH = 0;
    let curr = new Float32Array(0);
    let next = new Float32Array(0);
    let energy = 0;
    let accum = 0;
    let last = performance.now();
    let frame = 0;
    let alive = true;
    const impulses: Impulse[] = [];
    const pointer = { x: 0, y: 0, px: 0, py: 0, has: false, down: false, downAt: 0, nextDrip: 0 };

    let audioCtx: AudioContext | null = null;
    let noise: AudioBuffer | null = null;

    function audio() {
      if (audioCtx) return audioCtx;
      const Ctx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
      noise = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      return audioCtx;
    }

    function plip(size = 1, volume = 1) {
      const ac = audio();
      if (!ac) return;
      if (ac.state === "suspended") {
        void ac.resume().then(() => plip(size, volume));
        return;
      }
      const now = ac.currentTime + 0.002;
      const freq = (620 + Math.random() * 360) / Math.sqrt(size);
      const source = ac.createBufferSource();
      source.buffer = noise;
      const filter = ac.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2200 + Math.random() * 1200;
      filter.Q.value = 1.2;
      const splash = ac.createGain();
      splash.gain.setValueAtTime(0.035 * volume, now);
      splash.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      source.connect(filter).connect(splash).connect(ac.destination);
      source.start(now, Math.random() * 0.4);
      source.stop(now + 0.08);

      const tone = (start: number, from: number, to: number, duration: number, gain: number) => {
        const osc = ac.createOscillator();
        const amp = ac.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(from, start);
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, to), start + duration * 0.6);
        amp.gain.setValueAtTime(0.0001, start);
        amp.gain.exponentialRampToValueAtTime(gain, start + 0.004);
        amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(amp).connect(ac.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      };
      tone(now + 0.008, freq, freq * (2.1 + Math.random() * 0.7), 0.07 + Math.random() * 0.04, 0.11 * volume);
      tone(now, 160 / size, 80 / size, 0.06, 0.035 * volume);
    }

    function index(x: number, y: number) {
      return y * simW + x;
    }

    function sample(buf: Float32Array, x: number, y: number) {
      const cx = Math.max(0, Math.min(simW - 1, x));
      const cy = Math.max(0, Math.min(simH - 1, y));
      return buf[index(cx, cy) * 2] ?? 0;
    }

    function rebuild() {
      const box = root!.getBoundingClientRect();
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas!.style.width = "100%";
      canvas!.style.height = "100%";
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      simW = Math.max(4, Math.round(width / CELL));
      simH = Math.max(4, Math.round(height / CELL));
      curr = new Float32Array(simW * simH * 2);
      next = new Float32Array(simW * simH * 2);
      drawStill();
    }

    function disturb(x0: number, y0: number, x1: number, y1: number, radius: number, strength: number, crown = 0) {
      impulses.push({
        x0: x0 / CELL,
        y0: y0 / CELL,
        x1: x1 / CELL,
        y1: y1 / CELL,
        radius: radius / CELL,
        strength,
        crown,
      });
    }

    function applyImpulses() {
      if (!impulses.length) return;
      const heightAt = (i: number) => curr[i * 2] ?? 0;
      for (const impulse of impulses) {
        const minX = Math.max(0, Math.floor(Math.min(impulse.x0, impulse.x1) - impulse.radius));
        const maxX = Math.min(simW - 1, Math.ceil(Math.max(impulse.x0, impulse.x1) + impulse.radius));
        const minY = Math.max(0, Math.floor(Math.min(impulse.y0, impulse.y1) - impulse.radius));
        const maxY = Math.min(simH - 1, Math.ceil(Math.max(impulse.y0, impulse.y1) + impulse.radius));
        const abx = impulse.x1 - impulse.x0;
        const aby = impulse.y1 - impulse.y0;
        const ab2 = abx * abx + aby * aby;
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            const t = ab2 < 1e-4 ? 0 : Math.max(0, Math.min(1, ((x - impulse.x0) * abx + (y - impulse.y0) * aby) / ab2));
            const dx = x - (impulse.x0 + abx * t);
            const dy = y - (impulse.y0 + aby * t);
            const distance = Math.hypot(dx, dy);
            const falloff = Math.max(0, 1 - distance / impulse.radius);
            if (falloff <= 0) continue;
            const bump = 0.5 - 0.5 * Math.cos(falloff * Math.PI);
            const wave = Math.cos((1 - falloff) * 7);
            const shaped = 1 + (wave - 1) * impulse.crown;
            const i = index(x, y);
            curr[i * 2] = heightAt(i) + bump * impulse.strength * shaped;
          }
        }
      }
      impulses.length = 0;
    }

    function step() {
      const damp = 0.9955;
      for (let y = 0; y < simH; y++) {
        for (let x = 0; x < simW; x++) {
          const i = index(x, y);
          const h = curr[i * 2] ?? 0;
          const v = curr[i * 2 + 1] ?? 0;
          const side = sample(curr, x - 1, y) + sample(curr, x + 1, y) + sample(curr, x, y - 1) + sample(curr, x, y + 1);
          const diag = sample(curr, x - 1, y - 1) + sample(curr, x + 1, y + 1) + sample(curr, x + 1, y - 1) + sample(curr, x - 1, y + 1);
          const avg = (side * 4 + diag) / 20;
          let vel = v + (avg - h) * 2;
          const edge = Math.min(x, y, simW - 1 - x, simH - 1 - y);
          const edgeMix = Math.max(0, Math.min(1, edge / 6));
          vel *= 0.93 + (damp - 0.93) * edgeMix;
          let nextH = (h + vel) * 0.9992;
          if (Math.abs(nextH) < 0.0004) nextH = 0;
          next[i * 2] = nextH;
          next[i * 2 + 1] = Math.abs(vel) < 0.0004 ? 0 : vel;
        }
      }
      const swap = curr;
      curr = next;
      next = swap;
    }

    function heightAt(x: number, y: number) {
      return sample(curr, x, y);
    }

    function drawStill() {
      content!.style.visibility = "";
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
    }

    function drawWater() {
      content!.style.visibility = "";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, width, height);
      for (let y = 0; y < simH; y++) {
        for (let x = 0; x < simW; x++) {
          const gx = (heightAt(x + 1, y) - heightAt(x - 1, y)) * 0.5;
          const gy = (heightAt(x, y + 1) - heightAt(x, y - 1)) * 0.5;
          const light = gx * 0.45 + gy * 0.7;
          const amount = Math.abs(light);
          if (amount < 0.02) continue;
          const alpha = Math.min(0.28, amount * 1.1);
          ctx!.fillStyle = light > 0 ? `rgba(255,255,255,${alpha})` : `rgba(23,23,23,${alpha * 0.45})`;
          ctx!.fillRect(x * CELL, y * CELL, CELL + 0.5, CELL + 0.5);
        }
      }
    }

    function pebble(x: number, y: number, size = 1, volume = 1) {
      disturb(x, y, x, y, 18 * size, -2.6 * size, 0.6);
      plip(size, volume);
    }

    function wake(dt: number) {
      if (!pointer.has) return;
      const dx = pointer.x - pointer.px;
      const dy = pointer.y - pointer.py;
      const len = Math.hypot(dx, dy);
      if (len < 0.5) return;
      const speed = Math.max(0, Math.min(1, len / Math.max(dt, 1 / 240) / 1400));
      disturb(pointer.px, pointer.py, pointer.x, pointer.y, 14 + speed * 10, -0.28 * speed - 0.03);
      pointer.px = pointer.x;
      pointer.py = pointer.y;
    }

    function drip(now: number) {
      if (!pointer.down || now - pointer.downAt < 260 || now < pointer.nextDrip) return;
      pointer.nextDrip = now + 70 + Math.random() * 60;
      pebble(pointer.x + (Math.random() * 14 - 7), pointer.y + (Math.random() * 14 - 7), 0.55 + Math.random() * 0.25, 0.45);
    }

    function localPoint(event: PointerEvent<HTMLDivElement>) {
      const box = root!.getBoundingClientRect();
      return { x: event.clientX - box.left, y: event.clientY - box.top };
    }

    function onMove(event: PointerEvent<HTMLDivElement>) {
      const point = localPoint(event);
      pointer.x = point.x;
      pointer.y = point.y;
      if (!pointer.has) {
        pointer.px = point.x;
        pointer.py = point.y;
        pointer.has = true;
      }
    }

    function onDown(event: PointerEvent<HTMLDivElement>) {
      onMove(event);
      pointer.down = true;
      pointer.downAt = performance.now();
      pointer.nextDrip = 0;
      audio();
      pebble(pointer.x, pointer.y);
    }

    function onUp() {
      pointer.down = false;
    }

    function onLeave() {
      pointer.has = false;
      pointer.down = false;
      impulses.length = 0;
      curr.fill(0);
      next.fill(0);
      energy = 0;
      drawStill();
    }

    function tick(now: number) {
      if (!alive) return;
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      if (!reduce) {
        wake(dt);
        drip(now);
        applyImpulses();
        accum += dt;
        const steps = Math.min(6, Math.floor(accum * STEP_HZ));
        accum = Math.max(0, Math.min(1 / STEP_HZ, accum - steps / STEP_HZ));
        for (let i = 0; i < steps; i++) step();
        energy = 0;
        for (let i = 0; i < curr.length; i += 2) energy = Math.max(energy, Math.abs(curr[i] ?? 0));
        if (pointer.has && (energy > 0.004 || impulses.length)) drawWater();
        else drawStill();
      }
      frame = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(() => rebuild());
    observer.observe(root);
    rebuild();
    frame = requestAnimationFrame(tick);

    root.addEventListener("pointermove", onMove as unknown as EventListener);
    root.addEventListener("pointerdown", onDown as unknown as EventListener);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onUp);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("pointermove", onMove as unknown as EventListener);
      root.removeEventListener("pointerdown", onDown as unknown as EventListener);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onUp);
      root.removeEventListener("pointerleave", onLeave);
      content.style.visibility = "";
      void audioCtx?.close();
    };
  }, []);

  return (
    <div ref={rootRef} className={classNames("relative overflow-hidden rounded-[2rem]", className ?? "bg-ivory-deep")}>
      <div ref={contentRef} className={contentClassName ?? "grid gap-8 px-6 py-10 sm:grid-cols-4 sm:px-10"}>
        {children}
      </div>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}
