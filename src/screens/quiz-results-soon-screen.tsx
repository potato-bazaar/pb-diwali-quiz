"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/components/language-provider";
import { postToNative } from "@/lib/native-bridge";

const NAVY = "#1C2B4D";
const MAROON = "#8E1D35";
const PURPLE = "#5B2D91";

export function QuizResultsSoonScreen() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden"
      style={{ color: NAVY, backgroundColor: "#FEF2DC", containerType: "inline-size" }}
    >
      {/* Cream base, warm top glow, soft side vignette, candle bokeh along the bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle 46px at 8% 99%, rgba(255,205,118,0.55) 0%, rgba(255,205,118,0) 70%)," +
            "radial-gradient(circle 38px at 28% 101%, rgba(255,190,100,0.5) 0%, rgba(255,190,100,0) 70%)," +
            "radial-gradient(circle 52px at 52% 100%, rgba(255,205,118,0.45) 0%, rgba(255,205,118,0) 70%)," +
            "radial-gradient(circle 40px at 76% 101%, rgba(255,190,100,0.5) 0%, rgba(255,190,100,0) 70%)," +
            "radial-gradient(circle 48px at 95% 99%, rgba(255,205,118,0.55) 0%, rgba(255,205,118,0) 70%)," +
            "radial-gradient(ellipse 80% 30% at 50% 22%, rgba(255,226,160,0.55) 0%, rgba(255,236,196,0) 70%)," +
            "radial-gradient(ellipse 130% 110% at 50% 45%, rgba(255,246,226,0) 58%, rgba(240,196,152,0.4) 100%)," +
            "linear-gradient(to bottom, #FFF4DE 0%, #FDEFD4 45%, #FBE9CA 78%, #F9E6C8 100%)",
        }}
      />

      <StringLights className="absolute top-0 left-0 z-[6] w-full" />

      {/* Hanging lanterns */}
      <img
        src="/quiz/lantern.webp"
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-[-6px] left-[8%] z-[6] h-[clamp(96px,27cqw,160px)] w-auto object-contain select-none drop-shadow-[0_8px_14px_rgba(200,110,30,0.30)]"
      />
      <img
        src="/quiz/lantern.webp"
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-[-14px] right-[5%] z-[6] h-[clamp(78px,22cqw,130px)] w-auto object-contain select-none drop-shadow-[0_8px_14px_rgba(200,110,30,0.30)]"
      />

      {/* Fireworks + sparkles */}
      <FireworkBurst className="absolute top-[24%] left-[6px] z-[5] h-[clamp(40px,12cqw,72px)] w-[clamp(40px,12cqw,72px)]" />
      <FireworkBurst className="absolute top-[12%] right-[8px] z-[5] h-[clamp(34px,10cqw,62px)] w-[clamp(34px,10cqw,62px)] opacity-90" />
      <Sparkle className="absolute top-[20%] left-[22%] z-[5] h-[11px] w-[11px] opacity-70" />
      <Sparkle className="absolute top-[27%] right-[6px] z-[5] h-[12px] w-[12px] opacity-65" />
      <Sparkle className="absolute top-[42%] left-[10px] z-[5] h-[9px] w-[9px] opacity-60" />

      <nav className="absolute top-0 left-0 z-30 flex items-center px-[14px] pt-[max(10px,env(safe-area-inset-top))]">
        <button
          type="button"
          aria-label={t("back")}
          onClick={() => postToNative({ type: "QUIZ_CLOSE" })}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-gradient-to-b from-[#F9B97F] to-[#F29A58] shadow-[0_4px_12px_rgba(230,120,50,0.30)] active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] -translate-x-[1px]" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </nav>

      <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col px-[18px] pt-[max(12px,env(safe-area-inset-top))]">
        {/* ——— Brand logo ——— */}
        <img
          src="/quiz/brand-logo.png"
          alt="Potato Bazaar — आलू की दुनिया"
          draggable={false}
          className="mx-auto mt-[clamp(16px,4.6cqw,30px)] h-[clamp(52px,15cqw,84px)] w-auto shrink-0 object-contain select-none"
        />

        {/* ——— Diwali Quiz 2026 plaque ——— */}
        <div className="relative mx-auto mt-[clamp(10px,2.8cqw,18px)] w-[clamp(220px,64cqw,330px)] shrink-0 [filter:drop-shadow(0_4px_8px_rgba(110,20,30,0.3))]">
          <svg viewBox="0 0 260 46" className="h-auto w-full" aria-hidden="true">
            <defs>
              <linearGradient id="tq-maroon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8E1526" />
                <stop offset="55%" stopColor="#6E0D1C" />
                <stop offset="100%" stopColor="#570A15" />
              </linearGradient>
              <linearGradient id="tq-goldstroke" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F3D389" />
                <stop offset="50%" stopColor="#D9A93F" />
                <stop offset="100%" stopColor="#B9842C" />
              </linearGradient>
              <linearGradient id="tq-goldtext" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FBE7AE" />
                <stop offset="45%" stopColor="#F0C464" />
                <stop offset="100%" stopColor="#D79B33" />
              </linearGradient>
            </defs>
            <path
              d="M22 4 H238 Q248 4 250 12 L258 23 L250 34 Q248 42 238 42 H22 Q12 42 10 34 L2 23 L10 12 Q12 4 22 4 Z"
              fill="url(#tq-maroon)"
              stroke="url(#tq-goldstroke)"
              strokeWidth="2.2"
            />
            <path d="M24 8.5 H236" stroke="#C86A50" strokeWidth="0.9" opacity="0.5" />
            <text
              x="130"
              y="30.5"
              textAnchor="middle"
              fontFamily="var(--font-poster), Georgia, serif"
              fontWeight="800"
              fontSize="22"
              fill="url(#tq-goldtext)"
              letterSpacing="0.4"
            >
              Diwali Quiz 2026
            </text>
          </svg>
        </div>

        {/* ——— धन्यवाद! headline with rays + gold swoosh ——— */}
        <div className="relative mx-auto mt-[clamp(4px,1.4cqw,10px)] shrink-0">
          <HeadlineRays className="absolute top-[14%] left-[-34px] h-[60%] w-[26px] -scale-x-100" />
          <HeadlineRays className="absolute top-[14%] right-[-34px] h-[60%] w-[26px]" />
          <p
            className="text-center text-[clamp(44px,13.6cqw,78px)] leading-[1.18]"
            style={{
              fontFamily: "var(--font-yatra)",
              backgroundImage: "linear-gradient(to bottom, #E33A32 0%, #CB1F26 55%, #A80F18 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 3px 5px rgba(150,40,20,0.3))",
            }}
          >
            धन्यवाद!
          </p>
          <svg viewBox="0 0 220 16" className="mx-auto -mt-[clamp(2px,0.8cqw,6px)] h-auto w-[clamp(150px,44cqw,250px)]" aria-hidden="true">
            <path d="M8 7 Q110 15 212 5" fill="none" stroke="#F2B63C" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M46 11.5 Q122 16.5 178 10" fill="none" stroke="#E7A322" strokeWidth="2.6" strokeLinecap="round" opacity="0.85" />
          </svg>
        </div>

        {/* ——— Date pill ——— */}
        <div className="mx-auto mt-[clamp(8px,2.2cqw,14px)] flex w-fit shrink-0 items-center gap-[8px] rounded-[10px] bg-[#FBECC3] px-[clamp(12px,3.4cqw,20px)] py-[clamp(5px,1.4cqw,9px)] shadow-[0_2px_5px_rgba(180,130,50,0.18)]">
          <CalendarGold className="h-[clamp(15px,4.2cqw,22px)] w-[clamp(15px,4.2cqw,22px)]" />
          <p
            className="text-[clamp(13.5px,3.9cqw,20px)] leading-none font-bold"
            style={{ color: "#5A3A10", fontFamily: "var(--font-baloo)" }}
          >
            1 &ndash; 10 November 2026
          </p>
        </div>

        {/* ——— Thank-you line ——— */}
        <p
          className="relative z-[2] mx-auto mt-[clamp(8px,2.2cqw,14px)] max-w-[clamp(300px,85cqw,450px)] shrink-0 text-center text-[clamp(14.5px,4.2cqw,21px)] leading-[1.32] font-bold"
          style={{ color: "#20305A", fontFamily: "var(--font-display)" }}
        >
          Thank you to all participants for making our 10&#8209;day Diwali Quiz a great success!
        </p>

        <div aria-hidden="true" className="max-h-[78px] min-h-[8px] flex-[1.5_1_0%]" />

        {/* ——— Card: Results & Eligibility Verification (diya + gift tucked behind its top corners) ——— */}
        <div className="relative shrink-0">
          <img
            src="/quiz/diya-copper.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute top-[clamp(-66px,-16cqw,-50px)] left-[-8px] z-0 h-[clamp(48px,14cqw,78px)] w-auto object-contain select-none"
          />
          <img
            src="/quiz/thanks-gift-v2.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute top-[clamp(-96px,-23.5cqw,-74px)] right-[-14px] z-0 h-[clamp(74px,21.5cqw,120px)] w-auto object-contain select-none"
          />
          <div className="relative z-[1] rounded-[20px] bg-[#FFFDF7] p-[clamp(12px,3.4cqw,18px)] shadow-[0_10px_24px_rgba(165,105,40,0.14)]">
          <div className="flex items-stretch gap-[clamp(10px,2.8cqw,16px)]">
            <div className="flex shrink-0 flex-col items-center justify-center">
              <img
                src="/quiz/trophy-gold-simple.png"
                alt=""
                draggable={false}
                className="h-[clamp(66px,19cqw,102px)] w-auto object-contain select-none"
              />
            </div>
            <div className="w-[2px] shrink-0 self-stretch rounded-full bg-[#E8CFA0]" />
            <div className="min-w-0 flex-1">
              <p
                className="text-[clamp(15.5px,4.5cqw,23px)] leading-[1.15] font-extrabold"
                style={{ color: MAROON, fontFamily: "var(--font-display)" }}
              >
                Results &amp; Eligibility Verification
              </p>
              <p className="mt-[4px] text-[clamp(11.5px,3.35cqw,16px)] leading-[1.38] font-semibold" style={{ color: "#33436B" }}>
                The Diwali Quiz has concluded. Top&#8209;scoring participants are currently being reviewed to verify their
                eligibility and compliance with the Quiz Terms &amp; Conditions.
              </p>
              <p
                className="mt-[clamp(6px,1.6cqw,10px)] rounded-[8px] bg-[#FAF0C6] px-[10px] py-[clamp(5px,1.4cqw,8px)] text-[clamp(10.5px,3.05cqw,15px)] leading-[1.3] font-bold"
                style={{ color: "#2A3A5C" }}
              >
                Final winners will be confirmed after completion of this process.
              </p>
            </div>
          </div>
          </div>
        </div>

        {/* ——— Card: Prize Distribution ——— */}
        <div className="mt-[clamp(10px,2.8cqw,16px)] shrink-0 rounded-[20px] bg-[#F3EFFB] p-[clamp(12px,3.4cqw,18px)] shadow-[0_10px_24px_rgba(120,90,180,0.12)]">
          <div className="flex items-center gap-[clamp(10px,2.8cqw,16px)]">
            <div className="flex h-[clamp(52px,15cqw,80px)] w-[clamp(52px,15cqw,80px)] shrink-0 items-center justify-center rounded-[16px] bg-[#E9E1F8]">
              <CalendarPurple className="h-[62%] w-[62%]" />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-[clamp(15.5px,4.5cqw,23px)] leading-[1.15] font-extrabold"
                style={{ color: PURPLE, fontFamily: "var(--font-display)" }}
              >
                Prize Distribution
              </p>
              <p className="mt-[4px] text-[clamp(11.5px,3.35cqw,16px)] leading-[1.38] font-semibold" style={{ color: "#33436B" }}>
                Verification and prize processing are underway, Eligible winners will receive their prizes by{" "}
                <b style={{ color: "#1A2A52" }}>30 November 2026</b>.
              </p>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="max-h-[28px] min-h-[4px] flex-1" />

        {/* ——— View Quiz Leaderboard ——— */}
        <div className="shrink-0 pb-[max(10px,calc(env(safe-area-inset-bottom)+8px))]">
          <button
            type="button"
            onClick={() => {
              postToNative({ type: "QUIZ_LEADERBOARD" });
              router.push("/leaderboard");
            }}
            className="mx-auto flex h-[clamp(50px,14cqw,60px)] w-[min(100%,480px)] items-center justify-center gap-[12px] rounded-full bg-gradient-to-b from-[#A32036] to-[#740D20] text-[clamp(16.5px,4.8cqw,22px)] font-extrabold text-white shadow-[0_12px_26px_rgba(130,20,40,0.38),0_0_0_3px_rgba(255,255,255,0.35)_inset] active:scale-[0.98]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <ChartBars className="h-[clamp(18px,5cqw,24px)] w-[clamp(18px,5cqw,24px)]" />
            <span>View Quiz Leaderboard</span>
            <svg viewBox="0 0 24 24" className="h-[clamp(18px,5cqw,24px)] w-[clamp(18px,5cqw,24px)]" fill="none" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* Two drooping fairy-light strands with glowing bulbs */
function StringLights({ className }: { className?: string }) {
  const bulbs: [number, number][] = [
    [22, 26], [62, 42], [104, 52], [148, 54], [192, 48], [236, 38], [278, 46], [318, 54], [356, 44], [384, 30],
  ];
  return (
    <svg viewBox="0 0 390 72" className={className} aria-hidden="true">
      <path d="M-4 14 Q100 62 195 46 Q290 30 394 20" fill="none" stroke="#B8893B" strokeWidth="1.3" opacity="0.8" />
      <path d="M-4 30 Q120 72 250 54 Q330 44 394 48" fill="none" stroke="#B8893B" strokeWidth="1.1" opacity="0.55" />
      {bulbs.map(([x, y], i) => (
        <g key={i}>
          <line x1={x} y1={y - 5} x2={x} y2={y} stroke="#9A6F2C" strokeWidth="1" />
          <circle cx={x} cy={y + 4} r="7.5" fill="rgba(255,200,110,0.3)" />
          <circle cx={x} cy={y + 4} r="3.6" fill={i % 2 ? "#FFCF7E" : "#FFE2A5"} />
          <circle cx={x} cy={y + 3} r="1.5" fill="#FFF6DB" />
        </g>
      ))}
    </svg>
  );
}

/* Three gold dashes fanning out beside the headline */
function HeadlineRays({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 26 40" className={className} aria-hidden="true">
      <path d="M22 6 L6 12" stroke="#F2B63C" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 20 L4 20" stroke="#F2B63C" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M22 34 L6 28" stroke="#F2B63C" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

function CalendarGold({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" stroke="#B8812E" strokeWidth="1.9" />
      <path d="M3 10h18" stroke="#B8812E" strokeWidth="1.9" />
      <path d="M8 2.5v4M16 2.5v4" stroke="#B8812E" strokeWidth="1.9" strokeLinecap="round" />
      <rect x="7" y="13" width="3" height="3" rx="0.6" fill="#B8812E" />
      <rect x="12.5" y="13" width="3" height="3" rx="0.6" fill="#D9A93F" />
    </svg>
  );
}

function CalendarPurple({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="#6D3BB8" strokeWidth="2" />
      <path d="M3 10h18" stroke="#6D3BB8" strokeWidth="2" />
      <path d="M8 2.5v4M16 2.5v4" stroke="#6D3BB8" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 15.5l2.4 2.4 4.6-4.6" stroke="#6D3BB8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChartBars({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="4" y="12" width="4" height="8" rx="1.2" fill="currentColor" />
      <rect x="10" y="7" width="4" height="13" rx="1.2" fill="currentColor" />
      <rect x="16" y="10" width="4" height="10" rx="1.2" fill="currentColor" />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 0c.8 5.6 3.6 8.4 10 10-6.4 1.6-9.2 4.4-10 10-.8-5.6-3.6-8.4-10-10C6.4 8.4 9.2 5.6 10 0Z"
        fill="#E9C063"
      />
    </svg>
  );
}

function FireworkBurst({ className }: { className?: string }) {
  const rays = 16;
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      {Array.from({ length: rays }, (_, i) => {
        const angle = (i * Math.PI) / (rays / 2);
        const inner = i % 2 ? 5 : 3.4;
        const outer = i % 2 ? 14.5 : 18.5;
        return (
          <g key={i}>
            <line
              x1={20 + Math.cos(angle) * inner}
              y1={20 + Math.sin(angle) * inner}
              x2={20 + Math.cos(angle) * outer}
              y2={20 + Math.sin(angle) * outer}
              stroke={i % 2 ? "#EFCB6E" : "#DFA93B"}
              strokeWidth={i % 2 ? 1.05 : 1.4}
              strokeLinecap="round"
            />
            {i % 2 === 0 && (
              <circle cx={20 + Math.cos(angle) * (outer + 1.6)} cy={20 + Math.sin(angle) * (outer + 1.6)} r="0.9" fill="#F2D488" />
            )}
          </g>
        );
      })}
      <circle cx="20" cy="20" r="1.9" fill="#F8E7A0" />
    </svg>
  );
}
