"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
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
  { key: "first", labelKey: "prize1" as const, amount: "₹10,000", src: "/quiz/trophy-gold-simple.png", pill: "bg-[#FBE2A2] text-[#8A2A10]" },
  { key: "second", labelKey: "prize2" as const, amount: "₹5,000", src: "/quiz/trophy-silver-simple.png", pill: "bg-[#E3E6EE] text-[#1F2A48]" },
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
  const frameRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const board = boardRef.current;
    if (!frame || !board) return;

    const fit = () => {
      board.style.zoom = "1";
      const need = board.scrollHeight;
      const avail = frame.clientHeight;
      if (need < 8 || avail < 8) return;
      if (need > avail) board.style.zoom = String(avail / need);
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(frame);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [done, ready]);

  return (
    <div
      ref={frameRef}
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[linear-gradient(to_bottom,#FFF4E6_0%,#FDE9D3_45%,#FCEEDF_75%,#FDF4EA_100%)] text-[#2A2A2A]"
    >
      <img
        src="/quiz/live-top.jpg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-0 left-0 z-0 w-full select-none [-webkit-mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_70%,transparent_100%)]"
      />
      {/* Potato scene stays full in the background; prize cards sit on top of it. */}
      <div className="pointer-events-none absolute inset-x-0 top-[22%] z-0 h-[min(420px,48%)] overflow-hidden">
        <img
          src="/quiz/live-hero.jpg"
          alt=""
          draggable={false}
          className="h-full w-[112%] max-w-none -translate-x-[5%] object-cover object-[50%_58%] select-none"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[42%]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(253,233,211,0) 0%, rgba(253,233,211,0.55) 45%, #FDE9D3 100%)",
          }}
        />
      </div>
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

      <div ref={boardRef} className="relative z-10 flex min-h-0 w-full flex-1 flex-col">
      {/* Top bar: parent already has safe-area padding */}
      <nav className="relative z-10 flex shrink-0 items-center px-[20px] pt-[36px]">
        <button
          type="button"
          aria-label="Back"
          onClick={() => postToNative({ type: "QUIZ_CLOSE" })}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-gradient-to-b from-[#F9B97F] to-[#F29A58] shadow-[0_4px_12px_rgba(230,120,50,0.30)] active:scale-95"
        >
          <ChevronLeftIcon className="h-[22px] w-[22px] -translate-x-[1px]" />
        </button>
      </nav>

      {/* Title */}
      <header className="relative z-10 shrink-0 px-[26px] pt-[20px]">
        <FireworkBurst className="absolute top-[70px] right-[28px] h-[28px] w-[28px]" />

        <p className="text-[15px] leading-[1.2] font-medium text-[#5C5C5C]">{t("tagline")}</p>
        <h1 className="mt-[2px] font-display leading-none">
          <span className="block text-[24px] leading-[1.15] font-extrabold tracking-[-0.01em] text-[#1C2447]">
            {t("brandLine")}
          </span>
          <span className="mt-[2px] block bg-gradient-to-b from-[#EE5A2A] to-[#C9301A] bg-clip-text pb-[2px] text-[36px] leading-[1.05] font-black tracking-[-0.02em] text-transparent">
            {t("title")}
          </span>
        </h1>
        <p className="mt-[6px] max-w-[290px] text-[14px] leading-[1.35] text-[#555555]">
          {t("subtitle")}
        </p>
      </header>

      {/* Prizes + rules + CTA sit as one block near the bottom so the middle gap closes. */}
      <div className="relative z-10 mt-auto flex w-full shrink-0 flex-col">
      {/* Prize breakdown sits over the potato background */}
      <section className="relative z-10 mx-[14px] shrink-0 rounded-[20px] border border-[#F4DCBC] bg-[linear-gradient(180deg,rgba(255,242,226,0.94)_0%,rgba(253,232,208,0.94)_100%)] px-[6px] pt-[8px] pb-[8px] shadow-[0_10px_22px_rgba(175,95,35,0.14)]">
        <div className="flex items-center justify-center gap-[6px]">
          <OrnamentLine className="h-[8px] w-[40px]" />
          <h2 className="text-[13px] leading-[17px] font-extrabold tracking-[0.04em] text-[#7A1A12] uppercase">
            {t("grandPrizes")}
          </h2>
          <OrnamentLine className="h-[8px] w-[40px] -scale-x-100" />
        </div>
        <p className="mt-[2px] text-center text-[10px] leading-[13px] font-semibold text-[#6B5344]">
          {t("grandPrizesNote")}
        </p>
        <div className="mt-[6px] grid grid-cols-4 divide-x divide-[rgba(205,160,110,0.32)]">
          {HOME_PRIZES.map((prize) => (
            <div key={prize.key} className="flex flex-col items-center px-[3px] text-center">
              <img src={prize.src} alt="" draggable={false} className="h-[34px] w-[34px] object-contain" />
              <p className="mt-[2px] flex min-h-[18px] items-center text-[9px] leading-[10px] font-bold text-[#3A2A1E]">
                {t(prize.labelKey)}
              </p>
              <p
                className={`mt-[2px] w-full max-w-[66px] rounded-[7px] py-[2px] text-[12px] leading-[14px] font-black tracking-[-0.02em] ${prize.pill}`}
              >
                {prize.amount}
              </p>
              {prize.note ? (
                <p className="mt-[1px] text-[8px] leading-[10px] font-semibold text-[#6B5A4E]">{t("each")}</p>
              ) : (
                <span className="h-[10px]" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-[8px] flex items-center gap-[8px] rounded-[14px] bg-[linear-gradient(90deg,#7A1548_0%,#B21F63_55%,#C42A55_100%)] px-[8px] py-[7px] text-white shadow-[0_4px_10px_rgba(140,20,70,0.22)]">
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-white/95">
            <DailyCalendarIcon className="h-[20px] w-[20px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] leading-[15px] font-black tracking-[0.04em] uppercase">{t("dailyPrizes")}</p>
            <p className="mt-[1px] text-[9.5px] leading-[12px] font-semibold text-white/90">{t("dailyPrizesNote")}</p>
          </div>
          <img
            src="/quiz/prize-gift-simple.png"
            alt=""
            draggable={false}
            className="h-[32px] w-[32px] shrink-0 object-contain"
          />
          <div className="shrink-0 text-right">
            <p className="text-[14px] leading-[17px] font-black tracking-[-0.02em]">₹1,000</p>
            <p className="text-[8.5px] leading-[10px] font-bold text-[#FFE7A8]">{t("dailyEveryDay")}</p>
            <p className="text-[8px] leading-[10px] font-semibold text-white/85">({t("dailyTenWinners")})</p>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-[14px] mt-[8px] shrink-0">
        <RulesTermsCard />
      </div>

      {/* Extra bottom pad clears the home indicator / gesture bar (WebView zeroes .mobile-device padding). */}
      <footer className="relative z-10 flex w-full shrink-0 flex-col px-[clamp(16px,6vw,26px)] pt-[10px] pb-[max(28px,calc(env(safe-area-inset-bottom)+18px))]">

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
          className="relative flex h-[52px] w-full items-center justify-center gap-[12px] rounded-full bg-gradient-to-r from-[#F2742C] via-[#EC5F24] to-[#E2461C] text-[18px] font-bold text-white shadow-[0_12px_26px_rgba(226,80,28,0.38)] active:scale-[0.98]"
        >
          <span className="pointer-events-none absolute top-1/2 left-[8px] flex h-[56px] w-[56px] -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,226,160,0.55)_0%,rgba(255,200,120,0.18)_45%,rgba(255,200,120,0)_70%)]">
            <img
              src="/quiz/sparkler.png"
              alt=""
              draggable={false}
              className="h-[52px] w-[52px] object-contain select-none [filter:brightness(1.5)_saturate(1.2)_drop-shadow(0_0_4px_rgba(255,236,170,0.95))]"
            />
          </span>
          <span>{done ? t("viewLeaderboard") : t("startQuiz")}</span>
          <ArrowIcon className="h-[20px] w-[20px]" />
          <img
            src="/quiz/diya.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute right-[6px] bottom-[-18px] h-[48px] w-[48px] object-contain select-none drop-shadow-[0_6px_8px_rgba(120,40,10,0.35)]"
          />
        </button>
        ) : (
          <div className="h-[52px]" />
        )}
        {done && (
          <p className="mt-[12px] flex items-center justify-center gap-[6px] text-[13.5px] leading-[18px] font-semibold text-[#8A4A1E]">
            <ClockIcon className="h-[15px] w-[15px] shrink-0" />
            {isLastDay ? t("lastDay") : t("tomorrow")}
          </p>
        )}
      </footer>
      </div>
      </div>
    </div>
  );
}

/* ---------- Icons ---------- */

type IconProps = { className?: string };

function DailyCalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3.2" y="4.5" width="17.6" height="16" rx="3" fill="#F4C430" />
      <rect x="3.2" y="4.5" width="17.6" height="5.2" rx="3" fill="#E24A1C" />
      <rect x="3.2" y="7.4" width="17.6" height="2.3" fill="#E24A1C" />
      <path d="M8 3.2v3.4M16 3.2v3.4" stroke="#8A2A10" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M12 11.2l.7 1.6 1.7.1-1.3 1.1.5 1.7L12 14.7 10.4 15.7l.5-1.7-1.3-1.1 1.7-.1Z"
        fill="#E24A1C"
      />
    </svg>
  );
}

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

function RulesTermsCard() {
  const { t } = useI18n();
  const rows = [
    { key: "duration", title: t("ruleDuration"), body: t("ruleDurationBody"), icon: <RuleDurationIcon className="h-[18px] w-[18px]" /> },
    { key: "scoring", title: t("ruleScoring"), body: t("ruleScoringBody"), icon: <RuleScoringIcon className="h-[18px] w-[18px]" /> },
    { key: "tie", title: t("ruleTie"), body: t("ruleTieBody"), icon: <RuleTrophyIcon className="h-[18px] w-[18px]" /> },
    { key: "prizes", title: t("rulePrizes"), body: t("rulePrizesBody"), icon: <RuleGiftIcon className="h-[18px] w-[18px]" /> },
    { key: "general", title: t("ruleGeneral"), body: t("ruleGeneralBody"), icon: <RulePeopleIcon className="h-[18px] w-[18px]" /> },
  ] as const;
  return (
    <section className="relative w-full overflow-hidden rounded-[16px] border border-[#F3D7B4] bg-[linear-gradient(180deg,#FFFBF6_0%,#FFF4E6_100%)] px-[10px] pt-[7px] pb-[8px] shadow-[0_6px_14px_rgba(175,95,35,0.10)]">
      <h2 className="w-fit rounded-full bg-[linear-gradient(90deg,#8B1A2A,#C62828)] px-[10px] py-[3px] text-[10px] leading-[13px] font-black tracking-[0.06em] text-white uppercase">
        {t("rulesTerms")}
      </h2>
      <ul className="mt-[5px] flex flex-col gap-[5px]">
        {rows.map((row) => (
          <li key={row.key} className="flex items-start gap-[8px]">
            <span className="mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center text-[#E24A1C]">
              {row.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] leading-[14px] font-extrabold text-[#1B3A78]">{row.title}</p>
              <p className="mt-[1px] text-[10px] leading-[13px] font-medium wrap-break-word text-[#2F4A86]">{row.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function RuleDurationIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 9.2h16M8 3.6v3M16 3.6v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8.2 13.2h2.2v2.4H8.2zM13.6 13.2h2.2v2.4h-2.2z" fill="currentColor" />
    </svg>
  );
}

function RuleScoringIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.5 8.2h7M8.5 11.4h7M8.5 14.6h4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function RuleTrophyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M8 5h8v3.6a4 4 0 0 1-8 0Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 5.4H5.4c0 2.6 1.2 4 3.2 4.4M16 5.4h2.6c0 2.6-1.2 4-3.2 4.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.4 13.2h3.2L14 17.2H10z" fill="currentColor" />
      <rect x="8.6" y="17.2" width="6.8" height="2.4" rx="0.6" fill="currentColor" />
    </svg>
  );
}

function RuleGiftIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="4.2" y="10" width="15.6" height="10" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.2 14.2h15.6M12 10v10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10c-2.2-3.4-5.6-2.2-5.4.4C6.8 12.2 9.2 12 12 10zM12 10c2.2-3.4 5.6-2.2 5.4.4C17.2 12.2 14.8 12 12 10z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function RulePeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="2.3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="15.4" cy="8.6" r="1.8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.8 18.4c.4-3 2.2-4.6 4.2-4.6s3.8 1.6 4.2 4.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13.2 18.2c.3-2.2 1.6-3.4 3-3.4 1.5 0 2.8 1.2 3.1 3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
