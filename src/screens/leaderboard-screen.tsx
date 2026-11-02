"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type UIEvent } from "react";
import { QUESTION_BANK } from "@/data/question-bank";
import {
  assignUniqueDailyWinners,
  completedWinnerDays,
  indiaToday,
  msUntilIndiaMidnight,
  startedQuizDays,
} from "@/lib/contest";
import {
  QuizApiError,
  fetchDayLeaderboard,
  fetchLeaderboard,
  fetchQuizStatus,
  type LeaderboardEntry,
  type LeaderboardPage,
} from "@/lib/diwali-quiz-api";
import { useI18n } from "@/components/language-provider";
import { postToNative } from "@/lib/native-bridge";
import { getSession } from "@/lib/session";

const TOTAL_DAYS = QUESTION_BANK.length;
const PER_PAGE = 50;
/** Quiet background poll so ranks stay live while the screen is open. */
const POLL_MS = 8_000;

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

async function loadStandings(page: number, day: number | null): Promise<LeaderboardPage> {
  try {
    return await fetchLeaderboard(page, PER_PAGE, day ?? undefined);
  } catch (error) {
    if (day == null || page > 1) throw error;
    const rows = await fetchDayLeaderboard(day);
    return {
      page: 1,
      perPage: rows.length || PER_PAGE,
      totalPlayers: rows.length,
      totalPages: 1,
      leaderboard: rows,
      me: null,
    };
  }
}

/** Overall standings, or one day's ranking when `day` is set. */
function useLeaderboard(day: number | null) {
  const [board, setBoard] = useState<Board>({ status: "loading" });
  const [loadingMore, setLoadingMore] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const busy = useRef(false);
  const boardRef = useRef(board);
  const dayRef = useRef(day);
  boardRef.current = board;
  dayRef.current = day;

  useEffect(() => {
    let cancelled = false;
    setBoard({ status: "loading" });
    loadStandings(1, day)
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
  }, [attempt, day]);

  useEffect(() => {
    let cancelled = false;

    async function refreshQuietly() {
      const current = boardRef.current;
      const filterDay = dayRef.current ?? undefined;
      if (cancelled || busy.current) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (current.status !== "ready") return;
      busy.current = true;
      try {
        const pages = await Promise.all(
          Array.from({ length: current.page }, (_, i) => loadStandings(i + 1, filterDay ?? null)),
        );
        if (cancelled) return;
        const seen = new Set<number>();
        const rows: LeaderboardEntry[] = [];
        for (const data of pages) {
          for (const row of data.leaderboard) {
            if (seen.has(row.userId)) continue;
            seen.add(row.userId);
            rows.push(row);
          }
        }
        const last = pages[pages.length - 1];
        setBoard({
          status: "ready",
          rows,
          page: last.page,
          totalPages: last.totalPages,
          totalPlayers: last.totalPlayers,
          me: last.me,
        });
      } catch {
        // Keep the last good board; the next tick tries again.
      } finally {
        busy.current = false;
      }
    }

    const id = window.setInterval(() => {
      void refreshQuietly();
    }, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void refreshQuietly();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [attempt, day]);

  function retry() {
    setBoard({ status: "loading" });
    setAttempt((n) => n + 1);
  }

  function loadMore() {
    if (board.status !== "ready" || board.page >= board.totalPages || busy.current) return;
    busy.current = true;
    setLoadingMore(true);
    loadStandings(board.page + 1, dayRef.current)
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

type DailyRow = { day: number; date: string; winner: LeaderboardEntry | null };

type DailyBoard =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: DailyRow[]; lockedDays: number };

function useDailyWinners() {
  const [board, setBoard] = useState<DailyBoard>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let playableDay: number | null = null;
      try {
        const status = await fetchQuizStatus();
        playableDay = status.contest.playableDay ?? status.contest.contestDay;
      } catch {
        playableDay = null;
      }
      const days = completedWinnerDays(new Date(), playableDay);
      if (days.length === 0) {
        if (!cancelled) setBoard({ status: "ready", rows: [], lockedDays: 0 });
        return;
      }
      try {
        const rankedByDay = await Promise.all(days.map((quiz) => fetchDayLeaderboard(quiz.day)));
        if (cancelled) return;
        const rows = assignUniqueDailyWinners(days, rankedByDay)
          .slice()
          .reverse()
          .flatMap((group) => group.winners.map((winner) => ({ day: group.day, date: group.date, winner })));
        setBoard({ status: "ready", rows, lockedDays: days.length });
      } catch (error: unknown) {
        if (!cancelled) setBoard({ status: "error", message: errorMessage(error) });
      }
    }

    void load();
    const poll = window.setInterval(() => {
      void load();
    }, POLL_MS);
    const midnight = window.setTimeout(() => {
      void load();
    }, msUntilIndiaMidnight());
    const onVis = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearTimeout(midnight);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [attempt]);

  return {
    board,
    retry: () => {
      setBoard({ status: "loading" });
      setAttempt((n) => n + 1);
    },
  };
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
  const { t, lang } = useI18n();
  const router = useRouter();
  const [tab, setTab] = useState<"board" | "winners">("board");
  const [boardMode, setBoardMode] = useState<"overall" | "day">("overall");
  const [startedDays, setStartedDays] = useState(() => startedQuizDays());
  const [selectedDay, setSelectedDay] = useState(() => startedQuizDays().at(-1)?.day ?? 1);
  const dayFilter = tab === "board" && boardMode === "day" ? selectedDay : null;
  const { board, loadingMore, retry, loadMore } = useLeaderboard(dayFilter);
  const daily = useDailyWinners();

  useEffect(() => {
    let cancelled = false;
    fetchQuizStatus()
      .then(({ contest }) => {
        if (cancelled) return;
        const days = startedQuizDays(new Date(), contest.playableDay ?? contest.contestDay);
        setStartedDays(days);
        setSelectedDay((current) => (days.some((quiz) => quiz.day === current) ? current : (days.at(-1)?.day ?? 1)));
      })
      .catch(() => {
        if (cancelled) return;
        const days = startedQuizDays();
        setStartedDays(days);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function onListScroll(event: UIEvent<HTMLOListElement>) {
    const list = event.currentTarget;
    if (list.scrollHeight - list.scrollTop - list.clientHeight < 240) loadMore();
  }

  const selectedQuiz = startedDays.find((quiz) => quiz.day === selectedDay) ?? startedDays.at(-1);
  const till = formatShortDate(indiaToday(), lang);
  const dayBannerDate = selectedQuiz ? formatShortDate(selectedQuiz.date, lang) : till;

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
        {tab === "board" ? (
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
        ) : (
          <span />
        )}
      </nav>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-[14px] pt-[4px] pb-[calc(16px+env(safe-area-inset-bottom))]">
        <div className="mb-[10px] flex shrink-0 rounded-full bg-white p-[4px] shadow-[0_4px_12px_rgba(170,110,60,0.10)]">
          <TabButton active={tab === "board"} onClick={() => setTab("board")} icon="trophy">
            {t("leaderboard")}
          </TabButton>
          <TabButton active={tab === "winners"} onClick={() => setTab("winners")} icon="calendar">
            {t("dailyWinnersTab")}
          </TabButton>
        </div>

        {tab === "board" ? (
          <>
            <div className="mb-[8px] flex shrink-0 rounded-full bg-[#F4E6D4] p-[3px]">
              <ModeButton active={boardMode === "overall"} onClick={() => setBoardMode("overall")}>
                {t("overallTab")}
              </ModeButton>
              <ModeButton active={boardMode === "day"} onClick={() => setBoardMode("day")}>
                {t("dayWiseTab")}
              </ModeButton>
            </div>
            {boardMode === "day" ? (
              <div className="mb-[8px] flex shrink-0 gap-[6px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {startedDays.map((quiz) => (
                  <button
                    key={quiz.day}
                    type="button"
                    onClick={() => setSelectedDay(quiz.day)}
                    className={`h-[32px] shrink-0 rounded-full px-[12px] text-[12px] font-bold active:scale-[0.98] ${
                      selectedDay === quiz.day ? "bg-[#EE6A2A] text-white" : "bg-[#F4E6D4] text-[#6B5344]"
                    }`}
                  >
                    {t("dayLabel", { day: String(quiz.day) })}
                  </button>
                ))}
              </div>
            ) : null}
            <p className="mb-[8px] flex shrink-0 items-start gap-[6px] rounded-[12px] bg-[#FFF4E4] px-[10px] py-[8px] text-[11.5px] leading-[15px] font-semibold text-[#8A5A28]">
              <span className="mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#EE7A2C] text-[10px] font-black text-white">
                i
              </span>
              {boardMode === "day"
                ? t("dayWiseBanner", { day: String(selectedDay), date: dayBannerDate })
                : t("overallBanner", { date: till })}
            </p>
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
                      <LeaderboardRow
                        key={entry.userId}
                        entry={entry}
                        isMe={entry.userId === board.me?.userId}
                        showDaysPlayed={boardMode === "overall"}
                      />
                    ))}
                    {loadingMore && <SkeletonRow />}
                  </ol>
                  {board.me && !board.rows.some((r) => r.userId === board.me?.userId) && (
                    <ul aria-label="Your rank" className="shrink-0 border-t border-[#F2D9BC] shadow-[0_-6px_14px_rgba(170,110,60,0.10)]">
                      <LeaderboardRow
                        entry={{ ...board.me, name: t("you") }}
                        isMe
                        showDaysPlayed={boardMode === "overall"}
                      />
                    </ul>
                  )}
                </>
              )}
            </section>
            <HowRankingWorks />
          </>
        ) : (
          <DailyWinnersPanel board={daily.board} onRetry={daily.retry} />
        )}
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

function formatShortDate(iso: string, lang: string) {
  const date = new Date(`${iso}T00:00:00+05:30`);
  return date.toLocaleDateString(lang === "en" ? "en-IN" : lang, {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: "trophy" | "calendar";
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[40px] flex-1 items-center justify-center gap-[6px] rounded-full text-[13px] font-bold active:scale-[0.99] ${
        active ? "bg-[#EE6A2A] text-white shadow-[0_4px_10px_rgba(226,80,28,0.28)]" : "bg-transparent text-[#6B5344]"
      }`}
    >
      {icon === "trophy" ? (
        <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" aria-hidden="true">
          <path d="M8 5h8v4.2a4 4 0 0 1-8 0Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 5.5H5.6c0 2.4 1.1 3.7 3 4.1M16 5.5h2.4c0 2.4-1.1 3.7-3 4.1" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.2 13.2h3.6L14.2 18H9.8z" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" aria-hidden="true">
          <rect x="3.5" y="5" width="17" height="15" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 9.4h17M8 3.6v3.2M16 3.6v3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[36px] flex-1 items-center justify-center rounded-full text-[13px] font-bold active:scale-[0.99] ${
        active ? "bg-[#EE6A2A] text-white" : "bg-transparent text-[#6B5344]"
      }`}
    >
      {children}
    </button>
  );
}

function DailyWinnersPanel({ board, onRetry }: { board: DailyBoard; onRetry: () => void }) {
  const { t, lang } = useI18n();
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 px-[8px] pt-[2px] pb-[10px] text-center">
        <p className="flex items-center justify-center gap-[6px] text-[18px] leading-[22px] font-black text-[#C45A12]">
          <img src="/quiz/trophy-gold.png" alt="" className="h-[22px] w-[22px] object-contain" />
          {t("dailyWinnersTab")}
          <Sparkles />
        </p>
        <p className="mt-[6px] flex flex-wrap items-center justify-center gap-x-[6px] gap-y-[4px] text-[13px] leading-[17px] font-semibold text-[#6B5344]">
          <span>{t("dailyWinnersHeadline")}</span>
          <span className="inline-flex items-center rounded-full bg-[#E31B70] px-[10px] py-[3px] text-[13px] leading-[16px] font-black tracking-[-0.02em] text-white shadow-[0_2px_6px_rgba(200,20,90,0.28)]">
            ₹1,000
          </span>
        </p>
      </div>
      {board.status === "loading" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-hidden pb-[72px]">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-[84px] animate-pulse rounded-[18px] bg-white/80" />
          ))}
        </div>
      ) : board.status === "error" ? (
        <BoardMessage title={t("loadFailed")} detail={board.message} onRetry={onRetry} />
      ) : board.rows.length === 0 ? (
        <BoardMessage title={t("dailyWinnersEmpty")} detail={t("dailyWinnersEmptyDetail")} />
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-[10px] overflow-y-auto pb-[72px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {board.rows.map((row, i) => (
            <DailyWinnerCard
              key={`${row.day}-${row.winner?.userId ?? i}`}
              row={row}
              lang={lang}
              featured={row.day === board.rows[0]?.day}
            />
          ))}
        </ul>
      )}
      <DailyWinnersFooter />
    </div>
  );
}

function Sparkles() {
  return (
    <svg viewBox="0 0 18 16" className="h-[16px] w-[18px]" aria-hidden="true">
      <path d="M6.2 1.2l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9Z" fill="#F0C24A" />
      <path d="M13.4 6.2l.7 1.7 1.7.6-1.7.6-.7 1.7-.6-1.7-1.7-.6 1.7-.6Z" fill="#E8A83A" />
    </svg>
  );
}

function DailyWinnersFooter() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] w-full overflow-hidden">
      <svg viewBox="0 0 390 132" className="absolute inset-0 h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMax meet">
        <defs>
          <radialGradient id="dw-glow" cx="50%" cy="42%" r="38%">
            <stop offset="0" stopColor="#FFE9A3" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#F7D56A" stopOpacity="0.28" />
            <stop offset="1" stopColor="#F7D56A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="195" cy="58" rx="70" ry="48" fill="url(#dw-glow)" />
        <FireworkSpark cx={52} cy={48} r={22} />
        <FireworkSpark cx={88} cy={72} r={11} />
        <FireworkSpark cx={338} cy={46} r={22} />
        <FireworkSpark cx={302} cy={74} r={11} />
        <g transform="translate(78 92)">{marigoldRow("left")}</g>
        <g transform="translate(248 92)">{marigoldRow("right")}</g>
      </svg>
      <img
        src="/quiz/diya-copper.png"
        alt=""
        draggable={false}
        className="absolute bottom-[4px] left-1/2 h-[72px] w-[72px] -translate-x-1/2 object-contain drop-shadow-[0_8px_12px_rgba(160,80,20,0.28)] select-none"
      />
    </div>
  );
}

function FireworkSpark({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const rays = 16;
  return (
    <g>
      {Array.from({ length: rays }, (_, i) => {
        const angle = (i * Math.PI) / (rays / 2);
        const inner = i % 2 ? r * 0.32 : r * 0.22;
        const outer = i % 2 ? r * 0.78 : r;
        return (
          <line
            key={i}
            x1={(cx + Math.cos(angle) * inner).toFixed(2)}
            y1={(cy + Math.sin(angle) * inner).toFixed(2)}
            x2={(cx + Math.cos(angle) * outer).toFixed(2)}
            y2={(cy + Math.sin(angle) * outer).toFixed(2)}
            stroke={i % 2 ? "#E8C15A" : "#D4A017"}
            strokeWidth={i % 2 ? 1.1 : 1.4}
            strokeLinecap="round"
            opacity="0.9"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.12} fill="#F8E7A0" />
    </g>
  );
}

function marigoldRow(side: "left" | "right") {
  const dir = side === "left" ? -1 : 1;
  const flowers = [
    { x: 18, y: 2, s: 1 },
    { x: 38, y: 6, s: 0.82 },
    { x: 54, y: 10, s: 0.62 },
  ];
  const dots = [70, 82, 92, 102, 112];
  return (
    <>
      {flowers.map((f) => (
        <g key={f.x} transform={`translate(${dir * f.x} ${f.y}) scale(${f.s})`}>
          <Marigold />
        </g>
      ))}
      {dots.map((x, i) => (
        <circle
          key={x}
          cx={dir * x}
          cy={14 + i * 0.4}
          r={Math.max(1.1, 3.2 - i * 0.45)}
          fill="#E2A32A"
          opacity={0.85 - i * 0.12}
        />
      ))}
    </>
  );
}

function Marigold() {
  return (
    <g>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i * Math.PI) / 5 - Math.PI / 2;
        return (
          <ellipse
            key={i}
            cx={(Math.cos(a) * 7).toFixed(2)}
            cy={(Math.sin(a) * 6.2).toFixed(2)}
            rx="4.4"
            ry="2.6"
            transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 7} ${Math.sin(a) * 6.2})`}
            fill={i % 2 ? "#F0B430" : "#E89420"}
          />
        );
      })}
      <circle r="3.2" fill="#F6D056" />
      <circle r="1.5" fill="#C86A12" />
    </g>
  );
}

function DailyWinnerCard({ row, lang, featured = false }: { row: DailyRow; lang: string; featured?: boolean }) {
  const stamp = formatCardDate(row.date, lang);
  const winner = row.winner;
  const place = winner ? [winner.district, winner.state].filter(Boolean).join(", ") : "";
  return (
    <li
      className={`relative flex list-none items-center gap-[10px] overflow-visible rounded-[18px] border px-[12px] py-[11px] ${
        featured
          ? "border-[#F0D48A] bg-[linear-gradient(180deg,#FFF8DC_0%,#FFF3C8_100%)] shadow-[0_6px_16px_rgba(200,140,40,0.12)]"
          : "border-[#F0E4D2] bg-white shadow-[0_4px_12px_rgba(175,95,35,0.08)]"
      }`}
    >
      {featured ? <span className="absolute top-[12px] bottom-[12px] left-0 w-[3px] rounded-full bg-[#E8B83A]" /> : null}
      <WinnerCalendar day={stamp.day} month={stamp.month} />
      {winner ? (
        <>
          <PotatoAvatar seed={winner.userId} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] leading-[18px] font-extrabold text-[#1C2447]">{maskedName(winner)}</span>
            {place ? <span className="mt-[2px] block truncate text-[12px] leading-[15px] text-[#8E8E98]">{place}</span> : null}
          </span>
          <span className="flex shrink-0 flex-col items-end justify-center pr-[2px]">
            <span className="text-[17px] leading-[18px] font-black tabular-nums text-[#2FAE4E]">{winner.totalPoints}</span>
            <span className="mt-[1px] text-[9px] leading-[11px] font-bold tracking-[0.06em] text-[#8E8E98] uppercase">pts</span>
            <span className="mt-[6px] flex items-center gap-[3px] text-[12px] leading-[14px] font-bold tabular-nums text-[#C45A28]">
              <svg viewBox="0 0 16 16" className="h-[12px] w-[12px]" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M8 4.6V8l2.4 1.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              {durationLabel(winner)}
            </span>
          </span>
          <WinnerWreath />
        </>
      ) : (
        <span className="min-w-0 flex-1 text-[12px] leading-[16px] font-semibold text-[#8E8E98]">—</span>
      )}
    </li>
  );
}

function WinnerCalendar({ day, month }: { day: string; month: string }) {
  return (
    <span className="relative mt-[2px] h-[56px] w-[48px] shrink-0">
      <span className="absolute inset-x-0 top-[7px] bottom-0 flex flex-col overflow-hidden rounded-[11px] bg-white shadow-[0_3px_8px_rgba(50,30,20,0.16)]">
        <span className="h-[12px] shrink-0 bg-[#E4453A]" />
        <span className="flex min-h-0 flex-1 flex-col items-center justify-center pb-[4px]">
          <span className="text-[17px] leading-[16px] font-black tracking-[-0.04em] text-[#1A1A2E]">{day}</span>
          <span className="mt-[1px] text-[10px] leading-[10px] font-extrabold text-[#1A1A2E]">{month}</span>
        </span>
      </span>
      <CalendarRing className="absolute top-[1px] left-[10px] z-10 h-[14px] w-[9px]" />
      <CalendarRing className="absolute top-[1px] right-[10px] z-10 h-[14px] w-[9px]" />
    </span>
  );
}

function CalendarRing({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 9 14" className={className} aria-hidden="true">
      <ellipse cx="4.5" cy="7.2" rx="2.75" ry="5.1" fill="none" stroke="#9E9EA4" strokeWidth="2.1" />
      <ellipse cx="4.5" cy="6.8" rx="2.75" ry="5.1" fill="none" stroke="#EDEDEF" strokeWidth="1.35" />
    </svg>
  );
}

function WinnerWreath() {
  return (
    <img
      src="/quiz/winner-wreath.png"
      alt=""
      width={70}
      height={70}
      className="-my-[6px] h-[70px] w-[70px] shrink-0 object-contain"
      aria-hidden="true"
    />
  );
}

function formatCardDate(iso: string, lang: string) {
  const date = new Date(`${iso}T00:00:00+05:30`);
  const locale = lang === "en" ? "en-IN" : lang;
  return {
    day: date.toLocaleDateString(locale, { day: "numeric", timeZone: "Asia/Kolkata" }),
    month: date.toLocaleDateString(locale, { month: "short", timeZone: "Asia/Kolkata" }).replace(".", ""),
  };
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
  const sessionName = String(entry.userId) === getSession().userId ? getSession().userName : "";
  const full =
    entry.name?.trim() ||
    [entry.firstName, entry.lastName].filter(Boolean).join(" ").trim() ||
    sessionName.trim();
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

function LeaderboardRow({
  entry,
  isMe = false,
  showDaysPlayed = true,
}: {
  entry: LeaderboardEntry;
  isMe?: boolean;
  showDaysPlayed?: boolean;
}) {
  const { rank } = entry;
  const medalKind = RANK_MEDAL_KIND[rank];
  const name = maskedName(entry);
  const place = [entry.district, entry.state].filter(Boolean).join(", ");
  const tint = isMe ? "bg-[linear-gradient(to_right,#FFE9D3,#FFF6EC)]" : (ROW_TINTS[rank] ?? "bg-white");
  const sub = showDaysPlayed ? `${place ? `${place} · ` : ""}${entry.daysPlayed}/${TOTAL_DAYS} days` : place;

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
          {sub ? <span className="block truncate text-[11px] leading-[14px] text-[#8E8E98]">{sub}</span> : null}
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
      <p className="mt-[4px] text-[12px] leading-[16px] whitespace-nowrap text-[#8E8E98]">{detail}</p>
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
  const rules = [t("rankRule1"), t("rankRule2"), t("rankRule3"), t("rankRule4")];
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
