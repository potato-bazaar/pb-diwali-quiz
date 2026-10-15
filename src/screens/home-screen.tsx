"use client";

import { useState, type ReactNode } from "react";
import { postToNative } from "@/lib/native-bridge";

const AVATARS = ["/quiz/avatar-1.jpg", "/quiz/avatar-3.jpg", "/quiz/avatar-2.jpg"];

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
        <span className="font-bold text-[#D9471D]">1st Nov 2026</span>
      </>
    ),
  },
];

export function HomeScreen() {
  const [interested, setInterested] = useState(false);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[linear-gradient(to_bottom,#FFF6EA_0%,#FEE6C7_40%,#FBECDE_66%,#FDF3E9_100%)] text-[#3A2E26]">
      {/* Background layers: lanterns at the top, mandalas at the bottom */}
      <img
        src="/quiz/bg-top.jpg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-0 left-0 w-full select-none [-webkit-mask-image:linear-gradient(to_bottom,black_62%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_62%,transparent_100%)]"
      />
      <img
        src="/quiz/bg-bottom.jpg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute bottom-0 left-0 w-full select-none [-webkit-mask-image:linear-gradient(to_top,black_45%,transparent_100%)] [mask-image:linear-gradient(to_top,black_45%,transparent_100%)]"
      />

      {/* Header */}
      <header className="relative z-10 shrink-0 px-6 pt-[max(clamp(36px,6.4dvh,56px),calc(env(safe-area-inset-top)+12px))] text-center">
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

      {/* Prize card */}
      <section className="relative z-10 mx-auto mt-[42px] w-[min(86%,300px)] shrink-0">
        <img
          src="/quiz/gift-top.png"
          alt=""
          className="absolute top-[-34px] left-1/2 z-10 h-[58px] w-[58px] -translate-x-1/2 object-contain drop-shadow-[0_4px_6px_rgba(150,60,20,0.25)]"
        />
        <div className="rounded-[22px] bg-gradient-to-b from-[#F8E2A8] via-[#E2B45A] to-[#C9963A] p-[2px] shadow-[0_10px_28px_rgba(175,95,35,0.16)]">
          <div className="rounded-[18.5px] bg-gradient-to-b from-[#FBEBD2] to-[#F7E0BF] px-4 pt-[22px] pb-[12px] text-center">
            <p className="text-[20px] leading-[22px] font-bold text-[#1A2344]">
              Win up to
            </p>
            <p className="mt-[2px] bg-gradient-to-b from-[#D2561F] via-[#C24419] to-[#9E2714] bg-clip-text text-[52px] leading-[54px] font-black tracking-[-0.02em] text-transparent">
              ₹12,500
            </p>
          </div>
        </div>
        <Star className="absolute top-[54px] left-[18px] h-[13px] w-[13px]" />
        <Star className="absolute top-[36px] right-[16px] h-[15px] w-[15px]" />
        <Star className="absolute top-[76px] right-[10px] h-[7px] w-[7px]" />
        <Star className="absolute top-[82px] left-[38px] h-[7px] w-[7px]" />
      </section>

      {/* Potato scene: natural size right under the prize card; shrinks on short screens.
          The floor glow (bottom 48px) runs behind the feature cards. */}
      <div className="relative -mt-[12px] aspect-[720/301] min-h-0 w-full shrink">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[62%] h-[calc(38%+220px)]"
          style={{
            background:
              "radial-gradient(ellipse 85% 34% at 50% 30%, rgba(236,138,62,0.42), rgba(236,138,62,0) 100%), linear-gradient(to bottom, rgba(249,218,184,0) 0%, #F9DAB8 16%, #F8D6B0 44%, rgba(249,218,184,0) 100%)",
          }}
        />
        <img
          src="/quiz/potato-sack-scene.jpg"
          alt=""
          draggable={false}
          className="pointer-events-none absolute bottom-[-48px] left-0 max-h-[calc(100%+128px)] w-full max-w-none object-cover object-bottom select-none [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_17%,black_84%,transparent_100%)] [mask-image:linear-gradient(to_bottom,transparent_0%,black_17%,black_84%,transparent_100%)]"
        />
      </div>

      {/* Bottom stack */}
      <footer className="relative z-10 flex flex-1 flex-col px-[30px] pt-[20px] pb-[clamp(28px,5dvh,48px)]">
        <div className="grid grid-cols-3 gap-[7px]">
          {FEATURES.map((feature) => (
            <article
              key={feature.key}
              className="flex min-w-0 flex-col items-center rounded-[16px] border border-[#EDD3B0] bg-gradient-to-b from-[#FBEDD8] to-[#F7E3C6] px-1 pt-[11px] pb-[10px] text-center shadow-[0_6px_16px_rgba(150,85,30,0.12)]"
            >
              <div className="flex h-[34px] items-center justify-center">
                {feature.icon}
              </div>
              <p className="mt-[7px] text-[12.5px] leading-[15px] font-semibold text-[#222222]">
                {feature.title}
              </p>
            </article>
          ))}
        </div>

        <div className="relative mt-[15px] flex items-center gap-[9px] rounded-[24px] bg-gradient-to-r from-[#FCF1E4] to-[#FDF5EC] py-[9px] pr-[12px] pl-[12px] shadow-[0_2px_4px_rgba(150,85,30,0.06),0_8px_20px_rgba(150,85,30,0.12)]">
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
              1,000+ people
            </span>
            <span className="mt-[3px] block text-[11px] leading-[14px] whitespace-nowrap text-[#595959]">
              have shown interest in this quiz this week!
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
              onClick={() => {
                setInterested(true);
                postToNative({ type: "QUIZ_INTERESTED" });
              }}
              className="relative mt-[13px] flex h-[46px] w-full items-center justify-center gap-[12px] rounded-full bg-gradient-to-r from-[#F6A346] via-[#EF7A2C] to-[#E3471A] text-[17px] font-bold text-white shadow-[0_10px_22px_rgba(232,80,25,0.35)] active:scale-[0.98]"
            >
              <DiyaIcon tone="light" className="absolute top-1/2 left-[16px] h-[20px] w-[23px] -translate-y-1/2 opacity-80" />
              <BellIcon className="h-[19px] w-[19px]" />
              <span>I&apos;m Interested</span>
              <ArrowIcon className="h-[19px] w-[19px]" />
              <DiyaIcon tone="light" className="absolute top-1/2 right-[16px] h-[20px] w-[23px] -translate-y-1/2 opacity-80" />
            </button>
          )}

          {!interested && (
            <p className="mt-[22px] flex items-center justify-center gap-[5px] text-[11.5px] leading-none text-[#6B6B6B]">
              <InfoIcon className="h-[12px] w-[12px] shrink-0" />
              <span>
                Quiz will start from{" "}
                <span className="font-bold text-[#DE4D1C]">1st November 2026.</span>
              </span>
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
          on <span className="font-bold text-[#DE3E1C]">1st November 2026.</span>
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
    <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F9D3AE]">
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
