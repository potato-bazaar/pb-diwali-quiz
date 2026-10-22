"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type UIEvent } from "react";
import { QUESTION_BANK } from "@/data/question-bank";
import { QuizApiError, fetchLeaderboard, type LeaderboardEntry, type LeaderboardPage } from "@/lib/diwali-quiz-api";
import { useI18n } from "@/components/language-provider";
import { postToNative } from "@/lib/native-bridge";

const TOTAL_DAYS = QUESTION_BANK.length;
const PER_PAGE = 50;

type Board =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      rows: LeaderboardEntry[];
      page: number;
      totalPages: number;
      totalPlayers: number;
      me: LeaderboardPage["me"];
    };

const errorMessage = (error: unknown) =>
  error instanceof QuizApiError ? error.message : "Could not load the leaderboard.";

/** Overall standings from the backend, loading further pages as the list is scrolled. */
function useLeaderboard() {
  const [board, setBoard] = useState<Board>({ status: "loading" });
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchLeaderboard(1, PER_PAGE)
      .then((data) => {
        if (cancelled) return;
        setBoard({
          status: "ready",
          rows: data.leaderboard,
          page: data.page,
          totalPages: data.totalPages,
          totalPlayers: data.totalPlayers,
          me: data.me,
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) setBoard({ status: "error", message: errorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  function retry() {
    setBoard({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  function loadMore() {
    if (board.status !== "ready" || board.page >= board.totalPages || busy.current) return;
    busy.current = true;
    setLoadingMore(true);
    fetchLeaderboard(board.page + 1, PER_PAGE)
      .then((data) => {
        setBoard((prev) => {
          if (prev.status !== "ready") return prev;
          const seen = new Set(prev.rows.map((r) => r.userId));
          return {
            ...prev,
            rows: [...prev.rows, ...data.leaderboard.filter((r) => !seen.has(r.userId))],
            page: data.page,
            totalPages: data.totalPages,
            totalPlayers: data.totalPlayers,
          };
        });
      })
      .catch(() => {
        // The next scroll to the bottom tries again.
      })
      .finally(() => {
        busy.current = false;
        setLoadingMore(false);
      });
  }

  return { board, loadingMore, retry, loadMore };
}

const BURSTS: { key: string; tone: "red" | "gold"; style: CSSProperties }[] = [
  { key: "a", tone: "red", style: { top: 10, left: 46, width: 28, height: 28 } },
  { key: "b", tone: "gold", style: { top: 8, right: 108, width: 24, height: 24 } },
];

const CONFETTI: { key: string; style: CSSProperties }[] = [
  { key: "c1", style: { top: 18, left: 88, background: "#E8913C", transform: "rotate(28deg)" } },
  { key: "c3", style: { top: 14, right: 92, background: "#E8B23C", transform: "rotate(16deg)" } },
];

export function LeaderboardScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { board, loadingMore, retry, loadMore } = useLeaderboard();

  function onListScroll(event: UIEvent<HTMLOListElement>) {
    const list = event.currentTarget;
    if (list.scrollHeight - list.scrollTop - list.clientHeight < 240) loadMore();
  }

  return (
    <div className="question-in relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[linear-gradient(to_bottom,#FDF1E3_0%,#FDF4E8_40%,#FCEEDD_72%,#FBE6D0_100%)] text-[#141B36]">
      {/* Decoration behind the nav */}
      {BURSTS.map((b) => (
        <FireworkBurst key={b.key} tone={b.tone} style={b.style} />
      ))}
      {CONFETTI.map((c) => (
        <span
          key={c.key}
          aria-hidden="true"
          className="pointer-events-none absolute h-[5px] w-[9px] rounded-[1px] opacity-75"
          style={c.style}
        />
      ))}
      <HangingDiya className="absolute top-[-18px] left-[6px] h-[52px] w-[24px]" />
      <HangingDiya className="absolute top-[-16px] right-[8px] h-[56px] w-[26px]" />
      <StringLights className="absolute top-0 left-0 h-[28px] w-full" />

      {/* Nav */}
      <nav className="relative z-10 grid shrink-0 grid-cols-[40px_1fr_40px] items-center px-[12px] pt-[max(clamp(22px,calc(8dvh-32px),42px),calc(env(safe-area-inset-top)+8px))] pb-[8px]">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => {
            postToNative({ type: "QUIZ_BACK" });
            router.back();
          }}
          className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[#1C2447] active:scale-95 active:bg-[#F8DCC0]"
        >
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0 text-center">
          <h1 className="font-display text-[20px] leading-[24px] font-extrabold tracking-[-0.01em]">{t("title").replace("!", "")}</h1>
          <p className="mt-[2px] font-display text-[15px] leading-[18px] font-extrabold tracking-[0.01em] text-[#E2551F]">
            {t("leaderboard")}
          </p>
        </div>
        <a
          href="#how-ranking-works"
          aria-label="How ranking works"
          className="flex h-[40px] w-[40px] items-center justify-center justify-self-end rounded-full text-[#4A4A5A] active:scale-95 active:bg-[#F8DCC0]"
        >
          <svg viewBox="0 0 24 24" className="h-[24px] w-[24px]" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.7-.9 1.3v.5"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16.6" r="1" fill="currentColor" />
          </svg>
        </a>
      </nav>

      {/* The page stays put. Only the rows inside the card scroll. */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-[14px] pt-[8px] pb-[calc(16px+env(safe-area-inset-bottom))]">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[18px] border border-[#F2E2CE] bg-white/92 shadow-[0_8px_22px_rgba(170,110,60,0.10)]">
          <ColumnHeader />
          {board.status === "loading" ? (
            <ol aria-busy="true" aria-label="Loading leaderboard" className="min-h-0 flex-1 overflow-hidden">
              {Array.from({ length: 7 }, (_, i) => (
                <SkeletonRow key={i} />
              ))}
            </ol>
          ) : board.status === "error" ? (
            <BoardMessage title={t("loadFailed")} detail={board.message} onRetry={retry} />
          ) : board.rows.length === 0 ? (
            <BoardMessage title={t("emptyTitle")} detail={t("emptyDetail")} />
          ) : (
            <>
              <ol
                onScroll={onListScroll}
                className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {board.rows.map((entry) => (
                  <LeaderboardRow key={entry.userId} entry={entry} isMe={entry.userId === board.me?.userId} />
                ))}
                {loadingMore && <SkeletonRow />}
              </ol>
              {board.me && !board.rows.some((r) => r.userId === board.me?.userId) && (
                <ul aria-label="Your rank" className="shrink-0 border-t border-[#F2D9BC] shadow-[0_-6px_14px_rgba(170,110,60,0.10)]">
                  <LeaderboardRow entry={{ ...board.me, name: t("you") }} isMe />
                </ul>
              )}
            </>
          )}
        </section>

        <HowRankingWorks />
      </div>
    </div>
  );
}

const MEDAL_PALETTE = {
  gold: {
    light: "#FFF7CF",
    mid: "#F3C44A",
    dark: "#C07A12",
    rim: "#E8B83A",
    text: "#6B4308",
    ribbonL: "#EE4E3C",
    ribbonR: "#C42C22",
  },
  silver: {
    light: "#FFFFFF",
    mid: "#D5DCE4",
    dark: "#8A96A4",
    rim: "#C5CDD6",
    text: "#3A4450",
    ribbonL: "#EE4E3C",
    ribbonR: "#C42C22",
  },
  bronze: {
    light: "#F8D4AA",
    mid: "#D89048",
    dark: "#A45A1E",
    rim: "#C97A38",
    text: "#5A2C0A",
    ribbonL: "#EE4E3C",
    ribbonR: "#C42C22",
  },
  rest: {
    light: "#FFE0B0",
    mid: "#F08A32",
    dark: "#C25410",
    rim: "#E07828",
    text: "#5C2808",
    ribbonL: "#EE4E3C",
    ribbonR: "#C42C22",
  },
} as const;

type MedalKind = keyof typeof MEDAL_PALETTE;

/** Hanging prize medal: red ribbon + metallic disc with a highlight and inner ring. */
function PrizeMedal({
  place,
  medal,
  size = "prize",
}: {
  place: string;
  medal: MedalKind;
  size?: "prize" | "rank";
}) {
  const p = MEDAL_PALETTE[medal];
  const uid = `${size}-${place.replace("+", "p")}`;
  const box = size === "prize" ? "h-[42px] w-[35px]" : "h-[32px] w-[27px]";
  return (
    <svg viewBox="0 0 40 48" className={`${box} shrink-0 drop-shadow-[0_3px_4px_rgba(120,50,10,0.28)]`} aria-hidden="true">
      <defs>
        <linearGradient id={`m-${uid}-face`} x1="0.28" y1="0.12" x2="0.82" y2="1">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.48" stopColor={p.mid} />
          <stop offset="1" stopColor={p.dark} />
        </linearGradient>
        <linearGradient id={`m-${uid}-rib`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.ribbonL} />
          <stop offset="1" stopColor={p.ribbonR} />
        </linearGradient>
      </defs>
      <path d="M11 1h7l3.2 14-8.2 2.4L11 1Z" fill={`url(#m-${uid}-rib)`} />
      <path d="M29 1h-7l-3.2 14 8.2 2.4L29 1Z" fill={p.ribbonR} />
      <path d="M16.4 1h7.2l-1.4 13.6h-4.4L16.4 1Z" fill="#F36A4A" opacity="0.55" />
      <circle cx="20" cy="30" r="16.4" fill={`url(#m-${uid}-face)`} />
      <circle cx="20" cy="30" r="16.4" fill="none" stroke={p.rim} strokeWidth="1.4" />
      <circle cx="20" cy="30" r="13.2" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />
      <ellipse cx="14.5" cy="24.2" rx="6.4" ry="3.6" fill="rgba(255,255,255,0.42)" />
      <text
        x="20"
        y={place.length > 1 ? 34.4 : 35.2}
        textAnchor="middle"
        fill={p.text}
        fontSize={place.length > 1 ? 11 : 13.5}
        fontWeight="800"
        fontFamily="var(--font-lato), system-ui, sans-serif"
      >
        {place}
      </text>
    </svg>
  );
}

/* ---------- Table ---------- */

const GRID = "grid grid-cols-[40px_minmax(0,1fr)_54px_46px] items-center";

function ColumnHeader() {
  const { t } = useI18n();
  return (
    <div className={`${GRID} border-b border-[#EFE3D4] bg-[#FFFDFA] px-[10px] py-[10px] text-[11px] font-semibold text-[#9A8E82]`}>
      <span className="text-center">{t("rank")}</span>
      <span className="border-l border-[#EFE3D4] pl-[12px]">{t("name")}</span>
      <span className="border-l border-[#EFE3D4] text-center">{t("time")}</span>
      <span className="border-l border-[#EFE3D4] text-center">{t("pointsCol")}</span>
    </div>
  );
}

/** "45s", "1m 5s", "2m". An em dash when this player was saved before timing existed. */
function formatDuration(totalSeconds: number | null | undefined) {
  if (totalSeconds == null || !Number.isFinite(totalSeconds)) return "—";
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest}s`;
  if (rest === 0) return `${minutes}m`;
  return `${minutes}m ${rest}s`;
}

function durationLabel(entry: Pick<LeaderboardEntry, "totalDurationSeconds" | "totalDurationText">) {
  if (entry.totalDurationText) return entry.totalDurationText;
  return formatDuration(entry.totalDurationSeconds);
}

const ROW_TINTS: Record<number, string> = {
  1: "bg-[linear-gradient(to_right,#FFF8E6,#FFFCF4)]",
  2: "bg-[linear-gradient(to_right,#F5F7FA,#FBFCFD)]",
  3: "bg-[linear-gradient(to_right,#FFF2E4,#FFFAF4)]",
};

const RANK_MEDAL_KIND: Record<number, MedalKind> = {
  1: "gold",
  2: "silver",
  3: "bronze",
};

/** Leaderboards show masked identities: first name plus last-name initial ("Ansh K."). */
function maskedName(entry: LeaderboardEntry) {
  const full = entry.name?.trim() || [entry.firstName, entry.lastName].filter(Boolean).join(" ").trim();
  const words = full.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "Potato Player";
  if (words.length === 1) return words[0];
  return `${words[0]} ${words[words.length - 1][0].toUpperCase()}.`;
}

function PotatoAvatar({ seed: _seed }: { seed: number }) {
  return (
    <span className="flex h-[42px] w-[42px] shrink-0 overflow-hidden rounded-full shadow-[0_2px_6px_rgba(150,85,30,0.24)]">
      <img
        src="/quiz/potato-avatar.png"
        alt=""
        draggable={false}
        className="h-full w-full object-cover object-center select-none"
      />
    </span>
  );
}

function LeaderboardRow({ entry, isMe = false }: { entry: LeaderboardEntry; isMe?: boolean }) {
  const { rank } = entry;
  const medalKind = RANK_MEDAL_KIND[rank];
  const name = maskedName(entry);
  const place = [entry.district, entry.state].filter(Boolean).join(", ");
  const tint = isMe ? "bg-[linear-gradient(to_right,#FFE9D3,#FFF6EC)]" : (ROW_TINTS[rank] ?? "bg-white");

  return (
    <li className={`${GRID} list-none border-b border-[#F3EADF] px-[10px] py-[10px] last:border-b-0 ${tint}`}>
      <span className="flex justify-center">
        {medalKind ? (
          <PrizeMedal place={String(rank)} medal={medalKind} size="rank" />
        ) : (
          <span className="text-[15px] font-bold text-[#6E6E78]">{rank}</span>
        )}
      </span>

      <span className="flex min-w-0 items-center gap-[10px] pl-[12px]">
        <PotatoAvatar seed={entry.userId} />
        <span className="min-w-0">
          <span className="flex items-center gap-[6px]">
            <span className="truncate text-[14px] leading-[17px] font-bold text-[#1C2447]">{name}</span>
            {isMe && name !== "You" && (
              <span className="shrink-0 rounded-full bg-[#EE6A2A] px-[6px] py-[1px] text-[9px] leading-[12px] font-bold text-white">
                You
              </span>
            )}
          </span>
          <span className="block truncate text-[11px] leading-[14px] text-[#8E8E98]">
            {place ? `${place} · ` : ""}
            {entry.daysPlayed}/{TOTAL_DAYS} days
          </span>
        </span>
      </span>

      <span className="text-center text-[12px] leading-[14px] font-bold tabular-nums text-[#C45A28]">
        {durationLabel(entry)}
      </span>
      <span className="text-center text-[15px] font-bold text-[#2FAE4E]">{entry.totalPoints}</span>
    </li>
  );
}

function SkeletonRow() {
  return (
    <li aria-hidden="true" className={`${GRID} list-none border-b border-[#F3EADF] px-[10px] py-[12px]`}>
      <span className="mx-auto h-[20px] w-[20px] animate-pulse rounded-full bg-[#F3E6D6]" />
      <span className="flex items-center gap-[10px] pl-[12px]">
        <span className="h-[42px] w-[42px] shrink-0 animate-pulse rounded-full bg-[#F3E6D6]" />
        <span className="flex flex-1 flex-col gap-[6px]">
          <span className="h-[12px] w-[60%] animate-pulse rounded-full bg-[#F3E6D6]" />
          <span className="h-[9px] w-[40%] animate-pulse rounded-full bg-[#F6EEE4]" />
        </span>
      </span>
      <span className="mx-auto h-[12px] w-[28px] animate-pulse rounded-full bg-[#F6EEE4]" />
      <span className="mx-auto h-[14px] w-[32px] animate-pulse rounded-full bg-[#F3E6D6]" />
    </li>
  );
}

function BoardMessage({ title, detail, onRetry }: { title: string; detail: string; onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div role={onRetry ? "alert" : "status"} className="flex min-h-0 flex-1 flex-col items-center justify-center px-[24px] text-center">
      <img src="/quiz/potato-avatar.png" alt="" draggable={false} className="h-[64px] w-[64px] opacity-90" />
      <p className="mt-[10px] text-[15px] leading-[19px] font-bold text-[#1C2447]">{title}</p>
      <p className="mt-[4px] text-[12px] leading-[16px] text-[#8E8E98]">{detail}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-[12px] rounded-full bg-gradient-to-r from-[#F2742C] to-[#E2461C] px-[18px] py-[7px] text-[13px] font-bold text-white shadow-[0_6px_14px_rgba(226,80,28,0.30)] active:scale-95"
        >
          {t("tryAgain")}
        </button>
      )}
    </div>
  );
}

/* ---------- Footer ---------- */

function HowRankingWorks() {
  const { t } = useI18n();
  const rules = [t("rankRule1"), t("rankRule2"), t("rankRule3")];
  return (
    <section
      id="how-ranking-works"
      className="mt-[14px] shrink-0 scroll-mt-[12px] rounded-[18px] border border-[#F3E2CC] bg-[#FDF6EC] px-[14px] py-[12px]"
    >
      <p className="flex items-center gap-[7px] text-[13px] leading-[16px] font-bold text-[#2E2A36]">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#EE7A2C] text-[11px] font-black text-white">
          i
        </span>
        {t("howRanking")}
      </p>
      <ol className="mt-[9px] flex flex-col gap-[7px]">
        {rules.map((rule, i) => (
          <li key={rule} className="flex items-start gap-[8px]">
            <span className="mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#FBE0C8] text-[9.5px] font-black text-[#D9701F]">
              {i + 1}
            </span>
            <span className="text-[11.5px] leading-[15px] text-[#5C5560]">{rule}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Artwork ---------- */

function FireworkBurst({ style, tone }: { style: CSSProperties; tone: "red" | "gold" }) {
  const colours = tone === "red" ? ["#E2553A", "#F0913C"] : ["#F0B64A", "#EBC97C"];
  return (
    <svg viewBox="0 0 48 48" className="pointer-events-none absolute opacity-55" style={style} fill="none" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * Math.PI) / 8;
        const inner = i % 2 ? 7 : 5;
        const outer = i % 2 ? 15 : 21;
        return (
          <line
            key={i}
            x1={(24 + Math.cos(angle) * inner).toFixed(2)}
            y1={(24 + Math.sin(angle) * inner).toFixed(2)}
            x2={(24 + Math.cos(angle) * outer).toFixed(2)}
            y2={(24 + Math.sin(angle) * outer).toFixed(2)}
            stroke={colours[i % 2]}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function StringLights({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 390 54" className={`pointer-events-none ${className}`} aria-hidden="true" fill="none" preserveAspectRatio="none">
      <path d="M8 6C70 28 130 4 195 18S320 36 382 8" stroke="#E7B56A" strokeWidth="1.2" />
      {[
        [48, 16],
        [92, 22],
        [138, 12],
        [184, 18],
        [230, 24],
        [276, 20],
        [322, 14],
        [360, 10],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="3.2" fill="#FFE08A" />
          <circle cx={x} cy={y} r="6" fill="#FFD56A" opacity="0.28" />
        </g>
      ))}
    </svg>
  );
}

function HangingDiya({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 98" className={`pointer-events-none ${className}`} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="lb-lamp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F7D184" />
          <stop offset="0.45" stopColor="#E9A93F" />
          <stop offset="1" stopColor="#C98320" />
        </linearGradient>
      </defs>
      <path d="M15 0v46" stroke="#E2C089" strokeWidth="1.2" />
      <circle cx="15" cy="47" r="2.6" fill="url(#lb-lamp)" />
      <path d="M3 56h24c0 7.2-5.4 12-12 12S3 63.2 3 56Z" fill="url(#lb-lamp)" />
      <ellipse cx="15" cy="56" rx="12" ry="2.6" fill="#F9DCA0" />
      <path d="M15 50c1.6 2 2.4 3.4 2.4 4.6a2.4 2.4 0 0 1-4.8 0c0-1.2.8-2.6 2.4-4.6Z" fill="#FBC24A" />
      <path d="M11 68h8l-4 10-4-10Z" fill="url(#lb-lamp)" />
      <circle cx="15" cy="80" r="2" fill="#E9A93F" />
    </svg>
  );
}
