"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/language-provider";
import { QuizApiError, fetchInterestStatus, registerInterest } from "@/lib/diwali-quiz-api";
import { postToNative } from "@/lib/native-bridge";

const AVATARS = ["/quiz/avatar-1.jpg", "/quiz/avatar-3.jpg", "/quiz/avatar-2.jpg"];
const BASE_INTEREST_COUNT = 1000;
const INTERESTED_KEY = "pb-diwali-quiz:interested";

const BENEFITS = [
  { key: "funQuestions", icon: <BulbIcon />, ring: "bg-[#FFF8DE] ring-1 ring-[#F3E2B0]" },
  { key: "newInfo", icon: <BookIcon />, ring: "bg-[#FDECE6] ring-1 ring-[#F5D4C8]" },
  { key: "attractivePrizes", icon: <TrophyOutlineIcon />, ring: "bg-[#FFF6E0] ring-1 ring-[#F0E0B8]" },
  { key: "seeRank", icon: <RankIcon />, ring: "bg-[#F3EEFB] ring-1 ring-[#DDD0F2]" },
] as const;

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
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#FFF8EE] text-[#3A2E26]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[38%] [-webkit-mask-image:linear-gradient(to_bottom,black_58%,transparent_100%)] [mask-image:linear-gradient(to_bottom,black_58%,transparent_100%)]">
        <img
          src="/quiz/header.jpg"
          alt=""
          draggable={false}
          className="h-full w-full object-cover object-top select-none"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <img
          src="/quiz/mandala.png"
          alt=""
          draggable={false}
          className="chakra-spin absolute bottom-[-8%] left-[-22%] w-[58%] opacity-[0.22] select-none"
        />
        <img
          src="/quiz/mandala.png"
          alt=""
          draggable={false}
          className="chakra-spin absolute right-[-22%] bottom-[-8%] w-[58%] opacity-[0.22] select-none"
          style={{ animationDirection: "reverse" }}
        />
      </div>

      <button
        type="button"
        onClick={() => postToNative({ type: "QUIZ_CLOSE" })}
        aria-label="Back"
        className="absolute top-[10px] left-[12px] z-20 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/92 shadow-[0_4px_12px_rgba(80,40,10,0.16)] ring-1 ring-[#F0DCC4] active:scale-[0.96]"
      >
        <BackChevron className="h-[16px] w-[16px]" />
      </button>

      <header className="relative z-10 shrink-0 px-5 pt-[6px] text-center">
        <img
          src="/quiz/logo-pb.png?v=nobg"
          alt="Potato Bazaar"
          draggable={false}
          className="mx-auto h-[clamp(40px,6.6dvh,52px)] w-auto object-contain select-none"
        />
        <h1 className="mt-[8px] font-display text-[clamp(28px,7.4vw,36px)] leading-[1.02] font-black tracking-[-0.02em]">
          <span className="bg-gradient-to-b from-[#F6A044] via-[#E4551F] to-[#C9391B] bg-clip-text text-transparent">
            {t("diwali")}
          </span>{" "}
          <span className="text-[#1C2447]">{t("quiz")}</span>
        </h1>
        <p className="mx-auto mt-[5px] w-fit rounded-full bg-[#F6C445] px-[12px] py-[3px] text-[11.5px] leading-none font-extrabold text-[#1C2447]">
          {t("playLearnWin")}
        </p>
        <p className="mt-[5px] text-[12px] leading-none font-medium text-[#5C534C]">{t("headerSub")}</p>
        <LotusDivider className="mx-auto mt-[5px] h-[12px] w-[108px]" />
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end overflow-hidden">
        <div className="relative min-h-0 w-full flex-1 overflow-hidden">
          <img
            src="/quiz/potato-hero.jpg"
            alt=""
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center select-none"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%]"
            style={{
              background:
                "linear-gradient(to bottom, rgba(255,248,238,0) 0%, rgba(255,248,238,0.4) 50%, #FFF8EE 100%)",
            }}
          />
        </div>

        <div className="relative z-10 -mt-[52px] flex w-full min-w-0 shrink-0 flex-col gap-[8px] px-[12px] pb-[max(28px,calc(env(safe-area-inset-bottom,0px)+20px))]">
          <section className="flex min-w-0 items-center gap-[8px] rounded-[22px] border border-[#F6E2CC] bg-white px-[10px] py-[8px] shadow-[0_8px_18px_rgba(175,95,35,0.08)]">
            <div className="flex min-w-0 flex-1 items-center gap-[8px]">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] bg-[#FFF1E4]">
                <CalendarBadge className="h-[20px] w-[20px]" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] leading-[16px] font-extrabold text-[#E4551F]">
                  {t("startsNov")}
                </p>
                <p className="truncate text-[11px] leading-[14px] text-[#8A8178]">{t("getReady")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={showInterest}
              disabled={saving || interested}
              className={`flex min-w-0 max-w-[46%] shrink items-center justify-center gap-[5px] rounded-full px-[10px] py-[8px] text-[12px] leading-[14px] font-extrabold text-white shadow-[0_6px_12px_rgba(232,90,34,0.22)] active:scale-[0.98] disabled:opacity-100 ${
                interested ? "bg-[#2F9E5F] shadow-[0_6px_12px_rgba(47,158,95,0.22)]" : "bg-[#F0784A]"
              }`}
            >
              {!interested && <BellIcon className="h-[14px] w-[14px] shrink-0" />}
              <span className="text-center">
                {saving ? t("saving") : interested ? t("thanksRegistration") : t("notifyMe")}
              </span>
            </button>
          </section>
          {error && (
            <p role="alert" className="-mt-[4px] text-center text-[11px] font-semibold text-[#C2412A]">
              {error}
            </p>
          )}

          <section className="min-w-0 overflow-visible rounded-[22px] border border-[#F6E2CC] bg-white px-[10px] pt-[8px] pb-[10px] shadow-[0_8px_18px_rgba(175,95,35,0.08)]">
            <h2 className="flex items-center justify-center gap-[6px] text-[17px] leading-[21px] font-black">
              <Sparkle className="h-[12px] w-[12px]" />
              <span>
                <span className="text-[#E4551F]">{t("winPrizesLead")}</span>{" "}
                <span className="text-[#1C2447]">{t("winPrizesRest")}</span>
              </span>
              <Sparkle className="h-[12px] w-[12px]" />
            </h2>

            <div className="mt-[6px] grid w-full grid-cols-3 items-end gap-[2px]">
              <PrizePlace
                src="/quiz/trophy-2.png?v=nowing2"
                label={t("secondPrize")}
                amount="₹5,000"
                tone="blue"
              />
              <PrizePlace
                src="/quiz/trophy-1.png?v=nowing2"
                label={t("firstPrize")}
                amount="₹10,000"
                tone="gold"
                featured
              />
              <PrizePlace
                src="/quiz/trophy-3.png?v=nowing2"
                label={t("thirdPrize")}
                amount="₹2,000"
                tone="peach"
              />
            </div>

            <div className="mt-[8px] grid grid-cols-2 gap-[8px]">
              <GiftPrize
                title={t("dailyWinners")}
                amount="₹1,000"
                note={t("dailyWinnersNote")}
              />
              <GiftPrize
                title={t("consolationTitle")}
                amount="₹500"
                note={t("consolationEach")}
              />
            </div>
          </section>

          <section className="rounded-[22px] border border-[#F6E2CC] bg-white px-[10px] pt-[8px] pb-[8px] shadow-[0_8px_18px_rgba(175,95,35,0.06)]">
            <h2 className="flex items-center justify-center gap-[6px] text-[16px] leading-[20px] font-extrabold text-[#1C2447]">
              <Sparkle className="h-[11px] w-[11px]" />
              {t("whatYouGet")}
              <Sparkle className="h-[11px] w-[11px]" />
            </h2>
            <div className="mt-[8px] grid grid-cols-4 gap-[4px]">
              {BENEFITS.map((item) => (
                <div key={item.key} className="flex flex-col items-center">
                  <span className={`flex h-[44px] w-[44px] items-center justify-center rounded-full ${item.ring}`}>
                    {item.icon}
                  </span>
                  <p className="mt-[5px] text-center text-[10.5px] leading-[13px] font-semibold whitespace-pre-line text-[#5C534C]">
                    {t(item.key)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="relative flex items-center gap-[9px] rounded-[22px] bg-gradient-to-r from-[#FCF1E4] to-[#FDF5EC] py-[9px] pr-[12px] pl-[12px] shadow-[0_2px_4px_rgba(150,85,30,0.06),0_8px_20px_rgba(150,85,30,0.12)]">
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
              <span className="block text-[15px] leading-[18px] font-black text-[#1E2A4A]">
                {t("people", { n: shownInterest.toLocaleString("en-IN") })}
              </span>
              <span className="mt-[3px] block text-[11px] leading-[14px] text-[#595959]">
                {t("peopleRest")}
              </span>
            </p>
            <SparkleMark className="absolute top-[7px] right-[14px] h-[16px] w-[16px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PrizePlace({
  src,
  label,
  amount,
  tone,
  featured = false,
}: {
  src: string;
  label: string;
  amount: string;
  tone: "gold" | "blue" | "peach";
  featured?: boolean;
}) {
  const tones = {
    gold: "bg-[#FFF3C2] text-[#C2410C]",
    blue: "bg-[#E7F0FF] text-[#2F62C8]",
    peach: "bg-[#FDE4D6] text-[#E04B2A]",
  }[tone];

  return (
    <div className="flex min-w-0 flex-col items-center overflow-visible">
      <img
        src={src}
        alt=""
        draggable={false}
        className={`relative z-[1] mx-auto object-contain select-none ${featured ? "h-[90px] w-auto max-w-full" : "h-[72px] w-auto max-w-full"}`}
      />
      <div className={`mt-[2px] w-full rounded-[14px] px-[2px] py-[7px] text-center ${tones}`}>
        <p className="text-[11px] leading-[13px] font-bold opacity-90">{label}</p>
        <p className="text-[16px] leading-[19px] font-black">{amount}</p>
      </div>
    </div>
  );
}

function GiftPrize({ title, amount, note }: { title: string; amount: string; note: string }) {
  return (
    <div className="flex items-center gap-[8px] rounded-[16px] bg-[#FFF9F3] px-[8px] py-[9px]">
      <img
        src="/quiz/prize-gift-simple.png"
        alt=""
        draggable={false}
        className="h-[46px] w-[46px] shrink-0 object-contain select-none"
      />
      <div className="min-w-0">
        <p className="truncate text-[10.5px] leading-[13px] font-semibold text-[#6B625C]">{title}</p>
        <p className="text-[16px] leading-[18px] font-black text-[#E4551F]">{amount}</p>
        <p className="truncate text-[10px] leading-[12px] text-[#8A8178]">{note}</p>
      </div>
    </div>
  );
}

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

function LotusDivider({ className }: IconProps) {
  return (
    <svg viewBox="0 0 124 16" className={className} aria-hidden="true" fill="none">
      <path d="M2 9h40M82 9h40" stroke="#E6B96C" strokeWidth="1" strokeLinecap="round" />
      <path
        d="M62 14c-3.2-2.4-4.6-5.4-4.6-8.6C58.6 3.8 60.2 2 62 1c1.8 1 3.4 2.8 4.6 4.4 0 3.2-1.4 6.2-4.6 8.6Z"
        stroke="#E3A94F"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M62 14c-4.6-.6-8.2-3.2-9.6-7 2.6-.6 5.2 0 7.4 1.6M62 14c4.6-.6 8.2-3.2 9.6-7-2.6-.6-5.2 0-7.4 1.6"
        stroke="#E3A94F"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M62 14c-5.8 0-9.6-1.2-12.2-3.6 1.4-.2 3-.2 4.6 0M62 14c5.8 0 9.6-1.2 12.2-3.6-1.4-.2-3-.2-4.6 0"
        stroke="#E3A94F"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkleMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path d="M5.2 13.5 4 4.5M9.5 14.8 15.8 8.5M12 20.8l8.5.7" stroke="#E8582A" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Sparkle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M8 0.6 9.4 6.6 15.4 8 9.4 9.4 8 15.4 6.6 9.4 0.6 8 6.6 6.6Z" fill="#F0B429" />
    </svg>
  );
}

function CalendarBadge({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="6" y="8" width="20" height="18" rx="3" fill="#E4551F" />
      <rect x="6" y="8" width="20" height="6" rx="3" fill="#F08A32" />
      <path d="M11 6v5M21 6v5" stroke="#E4551F" strokeWidth="2" strokeLinecap="round" />
      <rect x="10" y="17" width="3.2" height="3.2" rx="0.6" fill="#FFF6EE" />
      <rect x="14.4" y="17" width="3.2" height="3.2" rx="0.6" fill="#FFF6EE" />
      <rect x="18.8" y="17" width="3.2" height="3.2" rx="0.6" fill="#FFF6EE" />
    </svg>
  );
}

function BulbIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[22px] w-[22px]" aria-hidden="true" fill="none">
      <path
        d="M16 6.2a6.4 6.4 0 0 0-3.6 11.7c.5.4.8 1 .8 1.7V21h5.6v-1.4c0-.7.3-1.3.8-1.7A6.4 6.4 0 0 0 16 6.2Z"
        stroke="#E39A12"
        strokeWidth="1.7"
      />
      <path d="M13.4 23.2h5.2M14.4 25.4h3.2" stroke="#E39A12" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[22px] w-[22px]" aria-hidden="true" fill="none">
      <path
        d="M8 8.2c2.8-1.1 5.4-.4 8 1 2.6-1.4 5.2-2.1 8-1v14.2c-2.8-1.1-5.4-.4-8 1-2.6-1.4-5.2-2.1-8-1Z"
        stroke="#E24A1C"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M16 9.4v14" stroke="#E24A1C" strokeWidth="1.7" />
    </svg>
  );
}

function TrophyOutlineIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[22px] w-[22px]" aria-hidden="true" fill="none">
      <path d="M10.5 7.5h11v6.2a5.5 5.5 0 0 1-11 0Z" stroke="#E3A94F" strokeWidth="1.7" />
      <path d="M10.5 9.2H8.2A2.8 2.8 0 0 0 11 13.6M21.5 9.2h2.3A2.8 2.8 0 0 1 21 13.6" stroke="#E3A94F" strokeWidth="1.7" />
      <path d="M14.6 19.4h2.8l.3 2.2h-3.4Z" stroke="#E3A94F" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12.2 23.4h7.6" stroke="#E3A94F" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function RankIcon() {
  return (
    <svg viewBox="0 0 32 32" className="h-[22px] w-[22px]" aria-hidden="true" fill="none">
      <path d="M8 22V16h4.2V22H8Zm5.9 0V10h4.2v12h-4.2Zm5.9 0v-4.6H24V22h-4.2Z" stroke="#7B5CFA" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M6 17h12l-1.1-1.7a6 6 0 0 1-.9-3.2v-1.6a4 4 0 0 0-8 0v1.6a6 6 0 0 1-.9 3.2L6 17Z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 17.3a2 2 0 0 0 4 0" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 4.5v1.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
