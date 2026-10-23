"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { QUESTION_BANK } from "@/data/question-bank";
import { playedTodayLocally, resolveContestDay } from "@/lib/contest";
import { useI18n } from "@/components/language-provider";
import { postToNative } from "@/lib/native-bridge";
import { useContestDay } from "@/lib/use-contest-day";

const PETALS: { key: string; style: CSSProperties }[] = [
  { key: "subtitle-left", style: { top: "29%", left: "2%", transform: "rotate(-35deg) scale(0.9)" } },
  { key: "subtitle-right", style: { top: "31.5%", right: "20%", transform: "rotate(20deg) scale(0.8)" } },
  { key: "title-left", style: { top: "21%", left: "1%", transform: "rotate(50deg) scale(0.7)" } },
  { key: "features-left", style: { top: "71%", left: "3%", transform: "rotate(-15deg)" } },
  { key: "features-right", style: { top: "68.5%", right: "4%", transform: "rotate(35deg) scale(1.1)" } },
  { key: "button-right", style: { top: "84%", right: "2%", transform: "rotate(-40deg) scale(0.85)" } },
  { key: "bottom-left", style: { bottom: "4%", left: "14%", transform: "rotate(25deg) scale(0.9)" } },
  { key: "bottom-mid", style: { bottom: "6.5%", left: "30%", transform: "rotate(-20deg) scale(0.75)" } },
  { key: "bottom-right", style: { bottom: "3%", right: "22%", transform: "rotate(60deg) scale(0.95)" } },
];

const HOME_PRIZES: {
  key: string;
  labelKey: "prize1" | "prize2" | "prize3" | "consolation";
  amount: string;
  note?: string;
  src: string;
  /** Amount pill colours, matching the trophy metal. */
  pill: string;
}[] = [
  { key: "first", labelKey: "prize1" as const, amount: "₹5,000", src: "/quiz/trophy-gold-simple.png", pill: "bg-[#FBE2A2] text-[#8A2A10]" },
  { key: "second", labelKey: "prize2" as const, amount: "₹3,000", src: "/quiz/trophy-silver-simple.png", pill: "bg-[#E3E6EE] text-[#1F2A48]" },
  { key: "third", labelKey: "prize3" as const, amount: "₹2,000", src: "/quiz/trophy-bronze-simple.png", pill: "bg-[#F8D3B8] text-[#8A2A10]" },
  {
    key: "consolation",
    labelKey: "consolation" as const,
    amount: "₹500",
    note: "Each",
    src: "/quiz/prize-gift-simple.png",
    pill: "bg-[#FBDDD6] text-[#8A2A10]",
  },
];

/** `completed`: shown after today's quiz is done, with a leaderboard link instead of Start Quiz. */
export function QuizHomeScreen({ completed = false }: { completed?: boolean }) {
  const router = useRouter();
  const { t } = useI18n();
  const contestState = useContestDay();
  const [clockDay, setClockDay] = useState<number | null>(null);
  useEffect(() => {
    setClockDay(resolveContestDay());
  }, []);
  const day = contestState?.day ?? clockDay;
  const isLastDay = day !== null && day >= QUESTION_BANK.length;
  const savedToday = day !== null && day >= 1 && playedTodayLocally(day);
  const ready = day !== null;
  const playedToday = savedToday || (contestState?.playedToday ?? false);
  // Right after the quiz, `/completed` shows this screen before the day check returns.
  // Once the day is known, only a real attempt for that day keeps Start Quiz hidden.
  const done = playedToday || (completed && !ready);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[linear-gradient(to_bottom,#FFF4E6_0%,#FDE9D3_45%,#FCEEDF_75%,#FDF4EA_100%)] text-[#2A2A2A]">
      <img
        src="/quiz/live-top.jpg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-0 left-0 w-full select-none [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"
      />
      {/* Right-side chakra: turns the opposite way, a little slower than the bottom one */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[clamp(150px,21dvh,190px)] right-[-92px] w-[210px] opacity-60"
      >
        <img
          src="/quiz/mandala.png"
          alt=""
          draggable={false}
          style={{ animationDirection: "reverse", animationDuration: "55s" }}
          className="chakra-spin block w-full select-none"
        />
      </div>
      {/* Bottom chakra: the mandala keeps turning slowly (see .chakra-spin in globals.css) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-218px] left-1/2 w-[290px] -translate-x-1/2 opacity-85"
      >
        <img
          src="/quiz/mandala.png"
          alt=""
          draggable={false}
          className="chakra-spin block w-full select-none"
        />
      </div>
      {PETALS.map((petal) => (
        <Petal key={petal.key} style={petal.style} />
      ))}

      {/* Top bar: the app shows the quiz full screen, so keep the button below the status bar / notch */}
      <nav className="relative z-10 flex shrink-0 items-center px-[20px] pt-[max(clamp(22px,3.6dvh,34px),calc(env(safe-area-inset-top)+10px))]">
        <button
          type="button"
          aria-label="Back"
          onClick={() => postToNative({ type: "QUIZ_CLOSE" })}
          className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-gradient-to-b from-[#F9B97F] to-[#F29A58] shadow-[0_4px_12px_rgba(230,120,50,0.30)] active:scale-95"
        >
          <ChevronLeftIcon className="h-[22px] w-[22px] -translate-x-[1px]" />
        </button>
      </nav>

      {/* Title */}
      <header className="relative z-10 shrink-0 px-[26px] pt-[clamp(10px,2.2dvh,24px)]">
        <FireworkBurst className="absolute top-[92px] right-[30px] h-[38px] w-[38px]" />

        <p className="text-[18px] leading-[22px] font-medium text-[#5C5C5C]">{t("tagline")}</p>
        <h1 className="mt-[6px] font-display leading-none">
          <span className="block text-[28px] leading-[32px] font-extrabold tracking-[-0.01em] text-[#1C2447]">
            {t("brandLine")}
          </span>
          <span className="mt-[2px] block bg-gradient-to-b from-[#EE5A2A] to-[#C9301A] bg-clip-text pb-[4px] text-[48px] leading-[52px] font-black tracking-[-0.02em] text-transparent">
            {t("title")}
          </span>
        </h1>
        <p className="-mt-[2px] max-w-[250px] text-[15.5px] leading-[21px] text-[#555555]">
          {t("subtitle")}
        </p>
      </header>

      {/* Hero: shrinks first on short screens */}
      <div className="relative -mt-[8px] -ml-[6%] aspect-[760/478] min-h-[150px] w-[112%] max-w-none shrink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[60%] h-[calc(40%+300px)]"
          style={{
            background:
              "radial-gradient(ellipse 70% 30% at 50% 26%, rgba(238,140,64,0.34), rgba(238,140,64,0) 100%), radial-gradient(ellipse 60% 26% at 50% 62%, rgba(240,150,80,0.22), rgba(240,150,80,0) 100%), linear-gradient(to bottom, rgba(249,218,184,0) 0%, #F9DAB8 14%, #F8D8B4 50%, rgba(249,218,184,0) 100%)",
          }}
        />
        <img
          src="/quiz/live-hero.jpg"
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[50%_58%] select-none [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_80%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_18%,black_80%,transparent_100%)]"
        />
      </div>

      {/* Prize breakdown */}
      <section className="relative z-10 mx-[14px] -mt-[22px] shrink-0 rounded-[20px] border border-[#F4DCBC] bg-[linear-gradient(180deg,rgba(255,242,226,0.94)_0%,rgba(253,232,208,0.94)_100%)] px-[6px] pt-[9px] pb-[9px] shadow-[0_10px_22px_rgba(175,95,35,0.14)]">
        <div className="flex items-center justify-center gap-[6px] pb-[6px]">
          <OrnamentLine className="h-[8px] w-[46px]" />
          <h2 className="text-[15px] leading-[18px] font-extrabold tracking-[-0.01em] text-[#1B2748]">
            {t("prizesTitle")}
          </h2>
          <OrnamentLine className="h-[8px] w-[46px] -scale-x-100" />
        </div>
        <div className="grid grid-cols-4 divide-x divide-[rgba(205,160,110,0.32)]">
          {HOME_PRIZES.map((prize) => (
            <div key={prize.key} className="flex flex-col items-center px-[3px] text-center">
              <img src={prize.src} alt="" draggable={false} className="h-[46px] w-[46px] object-contain" />
              <p className="mt-[2px] flex min-h-[22px] items-center text-[9px] leading-[10px] font-bold text-[#3A2A1E]">
                {t(prize.labelKey)}
              </p>
              <p
                className={`mt-[2px] w-full max-w-[66px] rounded-[7px] py-[3px] text-[13px] leading-[15px] font-black tracking-[-0.02em] ${prize.pill}`}
              >
                {prize.amount}
              </p>
              {prize.note ? (
                <p className="mt-[1px] text-[8px] leading-[10px] font-semibold text-[#6B5A4E]">{t("each")}</p>
              ) : (
                <span className="h-[11px]" />
              )}
            </div>
          ))}
        </div>
      </section>

      <WinnerSelectionCard />

      {/* CTA */}
      <footer className="relative z-10 flex flex-1 flex-col justify-start px-[26px] pt-[4px] pb-[clamp(24px,5dvh,48px)]">

        {ready || completed ? (
        <button
          type="button"
          onClick={() => {
            if (done) {
              postToNative({ type: "QUIZ_LEADERBOARD" });
              router.push("/leaderboard");
            } else {
              postToNative({ type: "QUIZ_START" });
              router.push("/play");
            }
          }}
          className="relative mt-[12px] flex h-[58px] w-full items-center justify-center gap-[12px] rounded-full bg-gradient-to-r from-[#F2742C] via-[#EC5F24] to-[#E2461C] text-[21px] font-bold text-white shadow-[0_12px_26px_rgba(226,80,28,0.38)] active:scale-[0.98]"
        >
          <span className="pointer-events-none absolute top-1/2 left-[8px] flex h-[62px] w-[62px] -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,226,160,0.55)_0%,rgba(255,200,120,0.18)_45%,rgba(255,200,120,0)_70%)]">
            <img
              src="/quiz/sparkler.png"
              alt=""
              draggable={false}
              className="h-[60px] w-[60px] object-contain select-none [filter:brightness(1.5)_saturate(1.2)_drop-shadow(0_0_4px_rgba(255,236,170,0.95))]"
            />
          </span>
          <span>{done ? t("viewLeaderboard") : t("startQuiz")}</span>
          <ArrowIcon className="h-[22px] w-[22px]" />
          <img
            src="/quiz/diya.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute right-[4px] bottom-[-26px] h-[60px] w-[60px] object-contain select-none drop-shadow-[0_6px_8px_rgba(120,40,10,0.35)]"
          />
        </button>
        ) : (
          <div className="mt-[12px] h-[58px]" />
        )}
        {done && (
          <p className="mt-[12px] flex items-center justify-center gap-[6px] text-[13.5px] leading-[18px] font-semibold text-[#8A4A1E]">
            <ClockIcon className="h-[15px] w-[15px] shrink-0" />
            {isLastDay ? t("lastDay") : t("tomorrow")}
          </p>
        )}
      </footer>
    </div>
  );
}

/* ---------- Icons ---------- */

type IconProps = { className?: string };

function ClockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#E2551F" strokeWidth="2" />
      <path d="M12 7.5V12l3 2" stroke="#E2551F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FireworkBurst({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * Math.PI) / 8;
        const inner = i % 2 ? 9 : 7;
        const outer = i % 2 ? 17 : 22;
        return (
          <line
            key={i}
            x1={(24 + Math.cos(angle) * inner).toFixed(2)}
            y1={(24 + Math.sin(angle) * inner).toFixed(2)}
            x2={(24 + Math.cos(angle) * outer).toFixed(2)}
            y2={(24 + Math.sin(angle) * outer).toFixed(2)}
            stroke={i % 2 ? "#F29A3A" : "#E2452A"}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

/** Thin gold rule that ends in a small diamond next to the heading. */
function OrnamentLine({ className }: IconProps) {
  return (
    <svg viewBox="0 0 46 8" className={className} fill="none" aria-hidden="true">
      <path d="M0 4h36" stroke="#D9A24A" strokeWidth="1" strokeLinecap="round" />
      <path d="M40 1.2 42.8 4 40 6.8 37.2 4Z" fill="#E2AE52" />
      <circle cx="45" cy="4" r="1" fill="#E2AE52" />
    </svg>
  );
}

function WinnerSelectionCard() {
  const { t } = useI18n();
  const rules = [t("rule1"), t("rule2"), t("rule3"), t("rule4")];
  return (
    <section className="relative z-10 mx-[14px] mt-[8px] shrink-0 overflow-hidden rounded-[16px] border border-[#F3D7B4] bg-[linear-gradient(180deg,#FFF6EA_0%,#FDECD6_100%)] px-[12px] pt-[10px] pb-[10px] shadow-[0_6px_14px_rgba(175,95,35,0.10)]">
      <ConfettiBurst className="pointer-events-none absolute top-[8px] right-[10px] h-[22px] w-[22px] opacity-80" />
      <ConfettiBurst className="pointer-events-none absolute top-[28px] right-[28px] h-[14px] w-[14px] opacity-70" />
      <div className="flex items-center gap-[8px] pr-[28px]">
        <RedTrophy className="h-[22px] w-[22px] shrink-0" />
        <h2 className="text-[13.5px] leading-[17px] font-extrabold text-[#E24A1C]">{t("winnerTitle")}</h2>
      </div>
      <ol className="mt-[8px] flex flex-col gap-[7px]">
        {rules.map((rule, index) => (
          <li key={rule} className="flex items-start gap-[8px]">
            <span className="mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#F08A2E] text-[9px] font-black text-white">
              {index + 1}
            </span>
            <span className="text-[11px] leading-[15px] font-medium text-[#3A312C]">{rule}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function RedTrophy({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M6.5 4.5H3.6c0 3.6 1.6 5.6 4.2 6M17.5 4.5h2.9c0 3.6-1.6 5.6-4.2 6" fill="none" stroke="#B8261A" strokeWidth="1.6" />
      <path d="M6.2 3h11.6v4.6a5.8 5.8 0 0 1-11.6 0Z" fill="#D2352A" />
      <path d="M8.2 4.4v3a3.4 3.4 0 0 0 1.6 2.9" fill="none" stroke="#F07A5E" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M10.6 13.2h2.8l.5 4h-3.8Z" fill="#B8261A" />
      <rect x="7.6" y="17.2" width="8.8" height="3.6" rx="0.8" fill="#9E1F15" />
    </svg>
  );
}

function ConfettiBurst({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <path d="M10 2.2v3.4M4 5l2.2 2.4M16 5l-2.2 2.4M2.4 11h3M14.6 11h3" stroke="#EE7A2A" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.6 15.4 8 13.2M13.4 15.4 12 13.2" stroke="#D9431B" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="17" r="1.1" fill="#F2B33A" />
    </svg>
  );
}

function Petal({ style }: { style: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 20 12"
      aria-hidden="true"
      className="pointer-events-none absolute h-[12px] w-[20px]"
      style={style}
    >
      <path d="M1 6C4 1 12-.5 19 3c-4 6.5-12 8-18 3Z" fill="#F08A2E" />
      <path d="M2.5 6C7 5 12 4.2 17.5 3.4" stroke="#FBB55E" strokeWidth="0.9" fill="none" />
    </svg>
  );
}

function ArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
