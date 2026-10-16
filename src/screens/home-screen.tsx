"use client";

import { useEffect, useState, type ReactNode } from "react";
import { QuizApiError, fetchInterestStatus, registerInterest } from "@/lib/diwali-quiz-api";
import { postToNative } from "@/lib/native-bridge";

const AVATARS = ["/quiz/avatar-1.jpg", "/quiz/avatar-3.jpg", "/quiz/avatar-2.jpg"];

const HOME_PRIZES: {
  key: string;
  label: string;
  amount: string;
  note?: string;
  src: string;
  pill: string;
}[] = [
  { key: "first", label: "1st Prize", amount: "₹5,000", src: "/quiz/trophy-gold-simple.png", pill: "bg-[#FBE2A2] text-[#8A2A10]" },
  { key: "second", label: "2nd Prize", amount: "₹3,000", src: "/quiz/trophy-silver-simple.png", pill: "bg-[#E3E6EE] text-[#1F2A48]" },
  { key: "third", label: "3rd Prize", amount: "₹2,000", src: "/quiz/trophy-bronze-simple.png", pill: "bg-[#F8D3B8] text-[#8A2A10]" },
  {
    key: "consolation",
    label: "5 Consolation Prizes",
    amount: "₹500",
    note: "Each",
    src: "/quiz/prize-gift-simple.png",
    pill: "bg-[#FBDDD6] text-[#8A2A10]",
  },
];

const FEATURES = [
  {
    key: "questions",
    icon: <QuestionIcon />,
    title: (
      <>
        Simple
        <br />
        Questions
      </>
    ),
  },
  {
    key: "prizes",
    icon: <GiftIcon />,
    title: (
      <>
        Exciting
        <br />
        Cash Prizes
      </>
    ),
  },
  {
    key: "date",
    icon: <BoltIcon />,
    title: (
      <>
        Starts from
        <br />
        <span className="font-bold text-[#D9471D]">1st Nov 2024</span>
      </>
    ),
  },
];

/** Hanging lanterns over the header art. Percentages are of the 720x432 background box. */
const LANTERNS = [
  { key: "left-big", left: "10.3%", top: "-5.5%", width: "8.6%", duration: "4.6s", delay: "-0.8s" },
  { key: "left-small", left: "3.63%", top: "14.6%", width: "4.7%", duration: "5.8s", delay: "-2.4s" },
  { key: "right", left: "90.1%", top: "10.7%", width: "8.3%", duration: "5.2s", delay: "-3.6s" },
];

/** Shown count starts here. Each real Notify me registration adds one on top. */
const BASE_INTEREST_COUNT = 1000;

export function HomeScreen() {
  const [interested, setInterested] = useState(false);
  /** Real Notify me registrations. The screen shows this on top of 1,000. */
  const [interestCount, setInterestCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchInterestStatus()
      .then((player) => {
        if (cancelled) return;
        setInterested(player.isInterested);
        if (Number.isFinite(player.interestCount)) setInterestCount(player.interestCount);
      })
      .catch(() => {
        // No login yet: the button still records interest once the app token is available.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function showInterest() {
    if (saving || interested) return;
    setSaving(true);
    setError(null);
    try {
      const result = await registerInterest("home");
      setInterested(true);
      setInterestCount((current) =>
        Number.isFinite(result.interestCount) ? result.interestCount : current + (result.created ? 1 : 0),
      );
      postToNative({ type: "QUIZ_INTERESTED", payload: { created: result.created } });
    } catch (caught) {
      setError(caught instanceof QuizApiError ? caught.message : "Could not save your interest.");
    } finally {
      setSaving(false);
    }
  }

  const shownInterest = BASE_INTEREST_COUNT + interestCount;
  const interestLabel = `${shownInterest.toLocaleString("en-IN")} people`;

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

      {/* Header */}
      <header className="relative z-10 shrink-0 px-6 pt-[clamp(36px,6.4dvh,56px)] text-center">
        <DiyaIcon className="mx-auto h-[40px] w-[54px]" />
        <p className="mt-[8px] text-[13px] leading-none font-bold tracking-[0.32em] text-[#5E5E5E]">
          POTATO BAZAAR
        </p>
        <h1 className="mt-[10px] font-display text-[54px] leading-[0.95] font-black tracking-[-0.02em]">
          <span className="bg-gradient-to-b from-[#F6A044] via-[#E4551F] to-[#C9391B] bg-clip-text text-transparent">
            Diwali
          </span>{" "}
          <span className="text-[#1C2447]">Quiz</span>
        </h1>
        <p className="mt-[10px] text-[16px] leading-none font-medium text-[#6A6A6A]">
          Simple questions. Big rewards.
        </p>
        <LotusDivider className="mx-auto mt-[10px] h-[16px] w-[140px]" />
      </header>

      {/* Prize breakdown, in place of the old "Win up to ₹12,500" card */}
      <section className="relative z-10 mx-[30px] mt-[16px] shrink-0 rounded-[20px] border border-[#F4DCBC] bg-[linear-gradient(180deg,rgba(255,242,226,0.96)_0%,rgba(253,232,208,0.96)_100%)] px-[6px] pt-[9px] pb-[9px] shadow-[0_10px_22px_rgba(175,95,35,0.14)]">
        <div className="flex items-center justify-center gap-[6px] pb-[6px]">
          <OrnamentLine className="h-[8px] w-[36px]" />
          <h2 className="text-[14px] leading-[18px] font-extrabold tracking-[-0.01em] text-[#1B2748]">
            Exciting Prizes to Win
          </h2>
          <OrnamentLine className="h-[8px] w-[36px] -scale-x-100" />
        </div>
        <div className="grid grid-cols-4 divide-x divide-[rgba(205,160,110,0.32)]">
          {HOME_PRIZES.map((prize) => (
            <div key={prize.key} className="flex flex-col items-center px-[3px] text-center">
              <img src={prize.src} alt="" draggable={false} className="h-[42px] w-[42px] object-contain" />
              <p className="mt-[2px] flex min-h-[20px] items-center text-[8.5px] leading-[10px] font-bold text-[#3A2A1E]">
                {prize.label}
              </p>
              <p className={`mt-[2px] w-full max-w-[64px] rounded-[7px] py-[3px] text-[12px] leading-[14px] font-black tracking-[-0.02em] ${prize.pill}`}>
                {prize.amount}
              </p>
              {prize.note ? (
                <p className="mt-[1px] text-[8px] leading-[10px] font-semibold text-[#6B5A4E]">{prize.note}</p>
              ) : (
                <span className="h-[11px]" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Full potato scene, uncropped at the top. The lower part may sit behind the feature cards. */}
      <div className="relative z-0 -mt-[28px] -mb-[52px] w-full shrink-0">
        <img
          src="/quiz/potato-sack-scene.jpg"
          alt=""
          draggable={false}
          className="pointer-events-none block w-full select-none [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.25)_7%,black_20%,black_46%,rgba(0,0,0,0.45)_62%,transparent_82%)] [mask-image:linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.25)_7%,black_20%,black_46%,rgba(0,0,0,0.45)_62%,transparent_82%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[8%] h-[42%]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(253,232,208,0) 0%, rgba(248,196,140,0.18) 28%, rgba(247,186,128,0.45) 58%, rgba(248,214,180,0) 100%)",
          }}
        />
      </div>

      {/* Bottom stack */}
      <footer className="relative z-10 -mt-[42px] flex flex-1 flex-col px-[30px] pt-[8px] pb-[16px]">
        <div className="grid grid-cols-3 gap-[7px]">
          {FEATURES.map((feature) => (
            <article
              key={feature.key}
              className="flex min-w-0 flex-col items-center rounded-[14px] border border-[#EDD3B0] bg-gradient-to-b from-[#FBEDD8] to-[#F7E3C6] px-1 pt-[6px] pb-[6px] text-center shadow-[0_6px_16px_rgba(150,85,30,0.12)]"
            >
              <div className="flex h-[28px] items-center justify-center">
                {feature.icon}
              </div>
              <p className="mt-[3px] text-[12px] leading-[14px] font-semibold text-[#222222]">
                {feature.title}
              </p>
            </article>
          ))}
        </div>

        <WinnerSelectionCard />

        <div className="relative mt-[10px] flex items-center gap-[9px] rounded-[24px] bg-gradient-to-r from-[#FCF1E4] to-[#FDF5EC] py-[9px] pr-[12px] pl-[12px] shadow-[0_2px_4px_rgba(150,85,30,0.06),0_8px_20px_rgba(150,85,30,0.12)]">
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
              {interestLabel}
            </span>
            <span className="mt-[3px] block text-[11px] leading-[14px] whitespace-nowrap text-[#595959]">
              have shown interest in this quiz!
            </span>
          </p>
          <SparkleMark className="absolute top-[7px] right-[14px] h-[17px] w-[17px]" />
        </div>

        <div className="mt-[4px]">
          {interested ? (
            <ThanksBanner />
          ) : (
            <button
              type="button"
              onClick={showInterest}
              disabled={saving}
              className="relative mt-[13px] flex h-[46px] w-full items-center justify-center gap-[12px] rounded-full bg-gradient-to-r from-[#F6A346] via-[#EF7A2C] to-[#E3471A] text-[17px] font-bold text-white shadow-[0_10px_22px_rgba(232,80,25,0.35)] active:scale-[0.98] disabled:opacity-70"
            >
              <DiyaIcon tone="light" className="absolute top-1/2 left-[16px] h-[20px] w-[23px] -translate-y-1/2 opacity-80" />
              <BellIcon className="h-[19px] w-[19px]" />
              <span>{saving ? "Saving…" : "Notify me"}</span>
              <ArrowIcon className="h-[19px] w-[19px]" />
              <DiyaIcon tone="light" className="absolute top-1/2 right-[16px] h-[20px] w-[23px] -translate-y-1/2 opacity-80" />
            </button>
          )}

          {error && (
            <p role="alert" className="mt-[10px] text-center text-[12px] leading-[16px] font-semibold text-[#C2412A]">
              {error}
            </p>
          )}

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

function OrnamentLine({ className }: IconProps) {
  return (
    <svg viewBox="0 0 46 8" className={className} fill="none" aria-hidden="true">
      <path d="M0 4h36" stroke="#D9A24A" strokeWidth="1" strokeLinecap="round" />
      <path d="M40 1.2 42.8 4 40 6.8 37.2 4Z" fill="#E2AE52" />
      <circle cx="45" cy="4" r="1" fill="#E2AE52" />
    </svg>
  );
}

const WINNER_RULES = [
  "1-10 नवंबर के कुल स्कोर के आधार पर विजेताओं की घोषणा की जाएगी।",
  "रोज खेल और अपना स्कोर जितना हो सके बढ़ाए। कोई भी आज का क्विज़ मिस न करें।",
  "विजेताओं की घोषणा और उनसे संपर्क 30 नवंबर तक किया जाएगा।",
  "यदि कुल स्कोर समान (टाई) होता है, तो सभी क्विज़ को कम समय में पूरा करने वाले प्रतिभागी को प्राथमिकता दी जाएगी।",
];

function WinnerSelectionCard() {
  return (
    <section className="relative z-10 mt-[12px] shrink-0 overflow-hidden rounded-[16px] border border-[#F3D7B4] bg-[linear-gradient(180deg,#FFF6EA_0%,#FDECD6_100%)] px-[12px] pt-[10px] pb-[10px] shadow-[0_6px_14px_rgba(175,95,35,0.10)]">
      <ConfettiBurst className="pointer-events-none absolute top-[8px] right-[10px] h-[22px] w-[22px] opacity-80" />
      <ConfettiBurst className="pointer-events-none absolute top-[28px] right-[28px] h-[14px] w-[14px] opacity-70" />
      <div className="flex items-center gap-[8px] pr-[28px]">
        <RedTrophy className="h-[22px] w-[22px] shrink-0" />
        <h2 className="text-[13.5px] leading-[17px] font-extrabold text-[#E24A1C]">विजेताओं का चयन कैसे होगा?</h2>
      </div>
      <ol className="mt-[8px] flex flex-col gap-[7px]">
        {WINNER_RULES.map((rule, index) => (
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
