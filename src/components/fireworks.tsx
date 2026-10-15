"use client";

import { useEffect, useRef } from "react";
import { sfx } from "@/lib/sound";

type Rocket = { x: number; y: number; vx: number; vy: number; targetY: number; colours: [string, string] };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; decay: number; size: number; colour: string };

const PALETTES: [string, string][] = [
  ["#FFD54A", "#FFF4C2"],
  ["#FF8A3C", "#FFD9B0"],
  ["#FF5FA2", "#FFC8E4"],
  ["#7CF0A0", "#E2FFEA"],
  ["#6FC8FF", "#DCF2FF"],
  ["#FFFFFF", "#FFF6D0"],
];

/**
 * Fireworks drawn on a transparent canvas: rockets climb, burst into sparks that fall with
 * gravity and fade, leaving short trails. Stops when unmounted or when motion is reduced.
 */
export function Fireworks({ className, sound = true }: { className?: string; sound?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];
    let nextLaunch = performance.now() + 250;
    let running = true;
    let frame = 0;

    const launch = () => {
      const w = canvas.width;
      const h = canvas.height;
      rockets.push({
        x: w * (0.15 + Math.random() * 0.7),
        y: h,
        vx: (Math.random() - 0.5) * 0.8 * dpr,
        vy: -(h * 0.011 + Math.random() * h * 0.006),
        targetY: h * (0.12 + Math.random() * 0.4),
        colours: PALETTES[Math.floor(Math.random() * PALETTES.length)],
      });
    };

    const explode = (r: Rocket) => {
      const count = 70 + Math.floor(Math.random() * 50);
      const speed = (2 + Math.random() * 1.6) * dpr;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const s = speed * (0.35 + Math.random() * 0.65);
        sparks.push({
          x: r.x,
          y: r.y,
          vx: Math.cos(angle) * s,
          vy: Math.sin(angle) * s,
          life: 1,
          decay: 0.01 + Math.random() * 0.012,
          size: (1 + Math.random() * 1.6) * dpr,
          colour: r.colours[i % 3 === 0 ? 1 : 0],
        });
      }
      if (sound) sfx.fireworkBurst();
    };

    const draw = (now: number) => {
      if (!running) return;
      const w = canvas.width;
      const h = canvas.height;
      // Fade what is already there so sparks leave short trails on the transparent canvas.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      if (now > nextLaunch && rockets.length < 4) {
        launch();
        nextLaunch = now + 550 + Math.random() * 850;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = r.colours[1];
        ctx.beginPath();
        ctx.arc(r.x, r.y, 1.6 * dpr, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY || r.vy > -0.5 * dpr) {
          explode(r);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.045 * dpr;
        s.vx *= 0.985;
        s.vy *= 0.985;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.colour;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * (0.6 + s.life * 0.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [sound]);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
