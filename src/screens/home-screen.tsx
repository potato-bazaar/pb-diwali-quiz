"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/components/language-provider";
import { QuizApiError, fetchInterestStatus, registerInterest } from "@/lib/diwali-quiz-api";
import { postToNative } from "@/lib/native-bridge";

const AVATARS = ["/quiz/avatar-1.jpg", "/quiz/avatar-3.jpg", "/quiz/avatar-2.jpg"];
const BASE_INTEREST_COUNT = 1000;
const INTERESTED_KEY = "pb-diwali-quiz:interested";

const BENEFITS = [
  { key: "funQuestions", icon: <BulbIcon />, ring: "bg-[#FFF4D6]" },
  { key: "newInfo", icon: <BookIcon />, ring: "bg-[#FDE4DC]" },
  { key: "attractivePrizes", icon: <GoldTrophyIcon />, ring: "bg-[#E7F6EC]" },
  { key: "seeRank", icon: <RankIcon />, ring: "bg-[#EDE4FB]" },
] as const;

/** Hanging lanterns over the header art. Percentages are of the 720x432 background box. */
const LANTERNS = [
  { key: "left-big", left: "10.3%", top: "-5.5%", width: "8.6%", duration: "4.6s", delay: "-0.8s" },
  { key: "left-small", left: "3.63%", top: "14.6%", width: "4.7%", duration: "5.8s", delay: "-2.4s" },
  { key: "right", left: "90.1%", top: "10.7%", width: "8.3%", duration: "5.2s", delay: "-3.6s" },
];

export function HomeScreen() {
  const { t } = useI18n();
  const [interested, setInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    try {
      if (window.localStorage.getItem(INTERESTED_KEY) === "1") setInterested(true);
    } catch {
      // Private mode can block localStorage.
    }

    const loadStatus = () => {
      fetchInterestStatus()
        .then((player) => {
          if (cancelled) return;
          if (player.isInterested) {
            setInterested(true);
            try {
              window.localStorage.setItem(INTERESTED_KEY, "1");
            } catch {
              /* ignore */
            }
          }
          if (Number.isFinite(player.interestCount)) setInterestCount(player.interestCount);
        })
        .catch(() => {
          // No login yet: tapping Notify Me still shows the thank-you state.
        });
    };

    loadStatus();
    window.addEventListener("pbzone-session-ready", loadStatus);
    return () => {
      cancelled = true;
      window.removeEventListener("pbzone-session-ready", loadStatus);
    };
  }, []);

  function markInterested(created = true) {
    setInterested(true);
    setError(null);
    try {
      window.localStorage.setItem(INTERESTED_KEY, "1");
    } catch {
      /* ignore */
    }
    postToNative({ type: "QUIZ_INTERESTED", payload: { created } });
  }

  async function showInterest() {
    if (saving || interested) return;
    setSaving(true);
    setError(null);
    try {
      const result = await registerInterest("home");
      setInterestCount((current) =>
        Number.isFinite(result.interestCount) ? result.interestCount : current + (result.created ? 1 : 0),
      );
      markInterested(result.created);
    } catch (caught) {
      // App session missing in the browser: still thank the user; native WebView will retry with a token.
      if (caught instanceof QuizApiError && (caught.code === "NO_TOKEN" || caught.status === 401)) {
        markInterested(true);
      } else {
        setError(caught instanceof QuizApiError ? caught.message : t("saveError"));
      }
    } finally {
      setSaving(false);
    }
  }

  const shownInterest = BASE_INTEREST_COUNT + interestCount;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[linear-gradient(to_bottom,#FFF6EA_0%,#FEE6C7_40%,#FBECDE_66%,#FDF3E9_100%)] text-[#3A2E26]">
      {/* Background layers: lanterns at the top, mandalas at the bottom.
          The lanterns are separate images so they can sway; bg-top-clean.jpg has them removed. */}
      <div className="pointer-events-none absolute top-0 left-0 aspect-[720/432] w-full [-webkit-mask-image:linear-gradient(to_bottom,black_62%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_62%,transparent_100%)]">
        <img
          src="/quiz/bg-top-clean.jpg"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full select-none"
        />
        {LANTERNS.map((lantern) => (
          <div
            key={lantern.key}
            className="lantern-sway absolute"
            style={{
              left: lantern.left,
              top: lantern.top,
              width: lantern.width,
              animationDuration: lantern.duration,
              animationDelay: lantern.delay,
            }}
          >
            <img
              src="/quiz/lantern.webp"
              alt=""
              draggable={false}
              className="block w-full select-none"
            />
          </div>
        ))}
      </div>
      <img
        src="/quiz/bg-bottom-plain.jpg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute bottom-0 left-0 w-full select-none [-webkit-mask-image:linear-gradient(to_top,black_45%,transparent_100%)] [mask-image:linear-gradient(to_top,black_45%,transparent_100%)]"
      />
      <style>{`@keyframes mandala-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div className="pointer-events-none absolute bottom-[18px] left-0 z-[1] w-[42%] -translate-x-1/2 translate-y-[28%]">
        <img
          src="/quiz/mandala.png"
          alt=""
          draggable={false}
          className="aspect-square w-full opacity-80 select-none"
          style={{ animation: "mandala-spin 18s linear infinite" }}
        />
      </div>
      <div className="pointer-events-none absolute right-0 bottom-[18px] z-[1] w-[42%] translate-x-1/2 translate-y-[28%]">
        <img
          src="/quiz/mandala.png"
          alt=""
          draggable={false}
          className="aspect-square w-full opacity-80 select-none"
          style={{ animation: "mandala-spin 18s linear infinite reverse" }}
        />
      </div>

      <button
        type="button"
        onClick={() => postToNative({ type: "QUIZ_CLOSE" })}
        aria-label="Back"
        className="absolute top-[calc(env(safe-area-inset-top,0px)+58px)] left-[12px] z-20 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-white/90 shadow-[0_4px_12px_rgba(80,40,10,0.18)] ring-1 ring-[#F0DCC4] active:scale-[0.96]"
      >
        <BackChevron className="h-[18px] w-[18px]" />
      </button>

      {/* Header */}
      <header className="relative z-10 shrink-0 px-6 pt-[calc(env(safe-area-inset-top,0px)+10px)] text-center">
        <DiyaIcon className="mx-auto h-[32px] w-[44px]" />
        <p className="mt-[4px] text-[12px] leading-none font-bold tracking-[0.28em] text-[#6A625C]">
          POTATO BAZAAR
        </p>
        <h1 className="mt-[2px] font-display text-[46px] leading-[0.95] font-black tracking-[-0.02em]">
          <span className="bg-gradient-to-b from-[#F6A044] via-[#E4551F] to-[#C9391B] bg-clip-text text-transparent">
            {t("diwali")}
          </span>{" "}
          <span className="text-[#1C2447]">{t("quiz")}</span>
        </h1>
        <p className="mx-auto mt-[6px] w-fit rounded-full bg-[#F6C445] px-[14px] py-[4px] text-[13px] leading-none font-extrabold text-[#1C2447]">
          {t("playLearnWin")}
        </p>
        <p className="mt-[6px] text-[13px] leading-none font-medium text-[#5C534C]">
          {t("headerSub")}
        </p>
        <LotusDivider className="mx-auto mt-[6px] h-[14px] w-[120px]" />
      </header>

      <div className="relative z-0 min-h-0 w-full flex-1 overflow-hidden">
        <img
          src="/quiz/potato-sack-scene.jpg"
          alt=""
          draggable={false}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_42%] select-none [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.25)_7%,black_20%,black_62%,rgba(0,0,0,0.45)_82%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.25)_7%,black_20%,black_62%,rgba(0,0,0,0.45)_82%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(253,232,208,0) 0%, rgba(248,196,140,0.18) 28%, rgba(247,186,128,0.45) 58%, rgba(248,214,180,0) 100%)",
          }}
        />
      </div>

      <footer className="relative z-10 -mt-[48px] flex shrink-0 flex-col px-[16px] pb-[max(40px,calc(env(safe-area-inset-bottom,0px)+16px))]">
        <section className="rounded-[22px] border border-[#F6E2CC] bg-[#FFF9F3] px-[16px] pt-[14px] pb-[12px] text-center shadow-[0_10px_22px_rgba(175,95,35,0.10)]">
          <CalendarBadge className="mx-auto h-[28px] w-[28px]" />
          <p className="mt-[6px] text-[14px] font-semibold text-[#3A312C]">{t("ours")}</p>
          <div className="mx-auto mt-[2px] flex w-fit items-center justify-center gap-[4px]">
            <RayBurst className="pointer-events-none h-[48px] w-[32px] shrink-0" />
            <h2 className="font-display text-[30px] leading-[34px] font-black tracking-[-0.02em]">
              <span className="text-[#E4551F]">{t("diwali")}</span> <span className="text-[#1C2447]">{t("quiz")}</span>
            </h2>
            <RayBurst className="pointer-events-none h-[48px] w-[32px] shrink-0 scale-x-[-1]" />
          </div>
          <p className="text-[16px] leading-[22px] font-extrabold text-[#E4551F]">
            {t("startsNov")}
          </p>
          <p className="mx-auto mt-[6px] max-w-[270px] text-[12.5px] leading-[18px] text-[#5C534C]">
            {interested ? t("thanksRegistration") : t("cardBody")}
          </p>
          <div className="relative mx-auto mt-[12px] w-full max-w-[300px]">
            <button
              type="button"
              onClick={showInterest}
              disabled={saving || interested}
              className="relative flex h-[48px] w-full items-center justify-center gap-[8px] rounded-full bg-gradient-to-r from-[#F8B15A] via-[#F08A32] to-[#E85A22] text-[18px] font-extrabold text-white shadow-[0_8px_16px_rgba(232,90,34,0.28)] active:scale-[0.98] disabled:opacity-70"
            >
              <BellIcon className="h-[22px] w-[22px]" />
              <span>{saving ? t("saving") : t("notifyMe")}</span>
            </button>
          </div>
          <p className="mt-[8px] text-[11.5px] leading-[16px] text-[#8A8178]">
            {t("notifyHint")}
          </p>
          {error && (
            <p role="alert" className="mt-[6px] text-[12px] leading-[16px] font-semibold text-[#C2412A]">
              {error}
            </p>
          )}
        </section>

        <section className="mt-[8px] rounded-[22px] border border-[#F6E2CC] bg-[#FFF9F3] px-[10px] pt-[10px] pb-[10px] text-center shadow-[0_8px_18px_rgba(175,95,35,0.06)]">
          <h2 className="flex items-center justify-center gap-[8px] text-[18px] leading-[22px] font-extrabold text-[#24315C]">
            <span className="text-[#F0B429]">✦</span>
            {t("whatYouGet")}
            <span className="text-[#F0B429]">✦</span>
          </h2>
          <div className="mt-[10px] grid grid-cols-4 gap-[4px]">
            {BENEFITS.map((item) => (
              <div key={item.key} className="flex flex-col items-center">
                <span className={`flex h-[48px] w-[48px] items-center justify-center rounded-full ${item.ring}`}>
                  {item.icon}
                </span>
                <p className="mt-[6px] text-center text-[11px] leading-[14px] font-semibold whitespace-pre-line text-[#3A312C]">
                  {t(item.key)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="relative mt-[8px] flex items-center gap-[9px] rounded-[24px] bg-gradient-to-r from-[#FCF1E4] to-[#FDF5EC] py-[8px] pr-[12px] pl-[12px] shadow-[0_2px_4px_rgba(150,85,30,0.06),0_8px_20px_rgba(150,85,30,0.12)]">
          <div className="flex shrink-0 -space-x-[7px]">
            {AVATARS.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                style={{ zIndex: AVATARS.length - i }}
                className="relative h-[34px] w-[34px] rounded-full border-[2.5px] border-white bg-[#F6E3C8] object-cover shadow-[0_2px_6px_rgba(150,85,30,0.22)]"
              />
            ))}
          </div>
          <p className="min-w-0 leading-none">
            <span className="block text-[15px] leading-[17px] font-black text-[#1E2A4A]">
              {t("people", { n: shownInterest.toLocaleString("en-IN") })}
            </span>
            <span className="mt-[3px] block text-[11px] leading-[14px] text-[#595959]">
              {t("peopleRest")}
            </span>
          </p>
          <SparkleMark className="absolute top-[7px] right-[14px] h-[17px] w-[17px]" />
        </div>
      </footer>
    </div>
  );
}

function ThanksBanner() {
  return (
    <div
      role="status"
      className="thanks-in relative mt-[13px] flex items-center gap-[4px] py-[2px] pr-[10px]"
    >
      <FireworkBurst className="absolute top-[2px] right-[3px] h-[18px] w-[18px] opacity-80" />
      <FireworkBurst className="absolute right-[2px] bottom-[3px] h-[26px] w-[26px] opacity-80" />
      <Star className="absolute right-[30px] bottom-[30px] h-[9px] w-[9px]" />
      <Star className="absolute top-[30px] right-[4px] h-[7px] w-[7px]" />

      <img
        src="/quiz/thanks-gift-v3.png"
        alt=""
        draggable={false}
        className="h-[80px] w-[96px] shrink-0 object-contain select-none"
      />

      <div className="relative min-w-0 flex-1 pr-[8px] text-center">
        <p className="font-display text-[15px] leading-[19px] font-black whitespace-nowrap text-[#1C2447]">
          <span className="text-[#E2551F]">Thanks</span> for showing interest!
        </p>
        <p className="mt-[4px] text-[12px] leading-[16px] font-medium text-[#4A5878]">
          We&apos;ll notify you when the quiz starts
          <br />
          on <span className="font-bold text-[#DE3E1C]">1st November 2024.</span>
        </p>
      </div>
    </div>
  );
}

/* ---------- Icons ---------- */

type IconProps = { className?: string };

function BackChevron({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path
        d="M15 5.5 8.5 12 15 18.5"
        stroke="#1C2447"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DiyaIcon({ className, tone = "gold" }: IconProps & { tone?: "gold" | "light" }) {
  if (tone === "light") {
    return (
      <svg viewBox="0 0 36 32" className={className} aria-hidden="true">
        <path d="M18 2c3.2 3.6 4.8 6.4 4.8 8.8a4.8 4.8 0 0 1-9.6 0C13.2 8.4 14.8 5.6 18 2Z" fill="#FFF3C4" />
        <path d="M18 6.4c1.5 1.9 2.2 3.4 2.2 4.6a2.2 2.2 0 0 1-4.4 0c0-1.2.7-2.7 2.2-4.6Z" fill="#FFFFFF" />
        <path d="M4.5 17.5h27c-.6 5.4-6 9.2-13.5 9.2S5.1 22.9 4.5 17.5Z" fill="#FFE3B0" />
        <path d="M4.5 17.5h27" stroke="#FFD08A" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M12 29.5h12" stroke="#FFD08A" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 36" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="dy-flame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB338" />
          <stop offset="1" stopColor="#E8641E" />
        </linearGradient>
        <linearGradient id="dy-bowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F08A2C" />
          <stop offset="1" stopColor="#D2541A" />
        </linearGradient>
      </defs>
      <g stroke="#E98A35" strokeWidth="1.3" strokeLinecap="round">
        <path d="M19.35 5.03 17.66 1.41M28.65 5.03l1.69-3.62" />
        <path d="M15.57 7.93 12.51 5.36M32.43 7.93l3.06-2.57" />
        <path d="M13.37 12.15 9.51 11.12M34.63 12.15l3.86-1.03" />
      </g>
      <path d="M24 5.5c2.6 3.2 3.8 5.7 3.8 7.9a3.8 3.8 0 0 1-7.6 0c0-2.2 1.2-4.7 3.8-7.9Z" fill="url(#dy-flame)" />
      <path d="M24 10c1 1.3 1.5 2.4 1.5 3.3a1.5 1.5 0 0 1-3 0c0-.9.5-2 1.5-3.3Z" fill="#FFE7A6" />
      <path d="M7 20h34c-1.4 6.4-8.2 10.6-17 10.6S8.4 26.4 7 20Z" fill="url(#dy-bowl)" />
      <ellipse cx="24" cy="20" rx="17" ry="2.2" fill="#F6A548" />
      <path d="M18.5 33.6h11" stroke="#D2541A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function LotusDivider({ className }: IconProps) {
  return (
    <svg viewBox="0 0 124 16" className={className} aria-hidden="true" fill="none">
      <path d="M2 9h40M82 9h40" stroke="#E6B96C" strokeWidth="1" strokeLinecap="round" />
      <path d="M62 14c-3.2-2.4-4.6-5.4-4.6-8.6C58.6 3.8 60.2 2 62 1c1.8 1 3.4 2.8 4.6 4.4 0 3.2-1.4 6.2-4.6 8.6Z" stroke="#E3A94F" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M62 14c-4.6-.6-8.2-3.2-9.6-7 2.6-.6 5.2 0 7.4 1.6M62 14c4.6-.6 8.2-3.2 9.6-7-2.6-.6-5.2 0-7.4 1.6" stroke="#E3A94F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M62 14c-5.8 0-9.6-1.2-12.2-3.6 1.4-.2 3-.2 4.6 0M62 14c5.8 0 9.6-1.2 12.2-3.6-1.4-.2-3-.2-4.6 0" stroke="#E3A94F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Star({ className }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" className={className} aria-hidden="true">
      <path d="M6 0l1.5 4.5L12 6 7.5 7.5 6 12 4.5 7.5 0 6l4.5-1.5Z" fill="#F2B232" />
    </svg>
  );
}

function FireworkBurst({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6;
        const x1 = 12 + Math.cos(angle) * 4;
        const y1 = 12 + Math.sin(angle) * 4;
        const x2 = 12 + Math.cos(angle) * 10;
        const y2 = 12 + Math.sin(angle) * 10;
        return (
          <line
            key={i}
            x1={x1.toFixed(2)}
            y1={y1.toFixed(2)}
            x2={x2.toFixed(2)}
            y2={y2.toFixed(2)}
            stroke={i % 2 ? "#F2A03A" : "#E8572A"}
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function FeatureBadge({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#F9D3AE]">
      {children}
    </span>
  );
}

function QuestionIcon() {
  return (
    <FeatureBadge>
      <span className="text-[19px] leading-none font-black text-[#D9471D]">?</span>
    </FeatureBadge>
  );
}

function GiftIcon() {
  return (
    <FeatureBadge>
      <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" aria-hidden="true">
        <path d="M12 8.2C10.6 5 7.6 3.6 6.3 4.9 5 6.2 6.6 8.2 12 8.2Z" fill="#D9471D" />
        <path d="M12 8.2c1.4-3.2 4.4-4.6 5.7-3.3 1.3 1.3-.3 3.3-5.7 3.3Z" fill="#D9471D" />
        <rect x="3" y="8.2" width="18" height="4.4" rx="1" fill="#D9471D" />
        <rect x="4.4" y="13.4" width="15.2" height="7.6" rx="1" fill="#D9471D" />
        <rect x="11" y="8.2" width="2" height="12.8" fill="#F9D3AE" />
      </svg>
    </FeatureBadge>
  );
}

function BoltIcon() {
  return (
    <FeatureBadge>
      <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" aria-hidden="true">
        <path d="M13.6 2.5 5.5 13.5h5.4l-1.3 8 8.9-11.5h-5.6l.7-7.5Z" fill="#D9471D" />
      </svg>
    </FeatureBadge>
  );
}

function SparkleMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path d="M5.2 13.5 4 4.5M9.5 14.8 15.8 8.5M12 20.8l8.5.7" stroke="#E8582A" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function RayBurst({ className }: IconProps) {
  return (
    <svg viewBox="0 0 46 72" className={className} aria-hidden="true" fill="none">
      <path d="M40 36H8" stroke="#F0B429" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M36 22 14 16" stroke="#F0B429" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M36 50 14 56" stroke="#F0B429" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M30 12 22 6" stroke="#F6C445" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 60 22 66" stroke="#F6C445" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarBadge({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="6" y="8" width="20" height="18" rx="3" fill="#E4551F" />
      <path d="M6 13h20" stroke="#FFF6EE" strokeWidth="1.6" />
      <path d="M11 6v5M21 6v5" stroke="#E4551F" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[26px] w-[26px]" aria-hidden="true">
      <path d="M16 5a7 7 0 0 0-3.8 13c.6.5 1 1.3 1 2.1V22h5.6v-1.9c0-.8.4-1.6 1-2.1A7 7 0 0 0 16 5Z" fill="#F0B429" />
      <path d="M13.2 24.2h5.6M14.2 26.4h3.6" stroke="#E39A12" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[26px] w-[26px]" aria-hidden="true">
      <path d="M7 8c3-1.3 5.8-.5 9 .9 3.2-1.4 6-2.2 9-.9v15c-3-1.3-5.8-.5-9 .9-3.2-1.4-6-2.2-9-.9Z" fill="#E24A1C" />
      <path d="M16 8.8v15" stroke="#FFF6EE" strokeWidth="1.4" />
    </svg>
  );
}

function GoldTrophyIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[26px] w-[26px]" aria-hidden="true">
      <path d="M10 7h12v6a6 6 0 0 1-12 0Z" fill="#F0B429" />
      <path d="M10 9H7.2A3.2 3.2 0 0 0 10.6 14M22 9h2.8A3.2 3.2 0 0 1 21.4 14" fill="none" stroke="#E39A12" strokeWidth="1.5" />
      <path d="M14.4 19.2h3.2l.4 2.6h-4Z" fill="#C98412" />
      <rect x="11" y="22" width="10" height="2.8" rx="1" fill="#E39A12" />
    </svg>
  );
}

function RankIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[26px] w-[26px]" aria-hidden="true">
      <path d="M7 22V15h4v7H7Zm7 0V9h4v13h-4Zm7 0v-5h4v5h-4Z" fill="#7B5CFA" />
      <path d="M22 8.5l1 2.2 2.4.2-1.8 1.6.6 2.3-2.2-1.3-2.2 1.3.6-2.3-1.8-1.6 2.4-.2Z" fill="#F0B429" />
    </svg>
  );
}

function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 17h12l-1.1-1.7a6 6 0 0 1-.9-3.2v-1.6a4 4 0 0 0-8 0v1.6a6 6 0 0 1-.9 3.2L6 17Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 17.3a2 2 0 0 0 4 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 4.5v1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4.5 12h15M13.5 6l6 6-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="6.3" stroke="#8E8E8E" strokeWidth="1.3" />
      <path d="M8 7.3v4" stroke="#8E8E8E" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.8" fill="#8E8E8E" />
    </svg>
  );
}
