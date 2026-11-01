import {
  OPTION_LETTERS,
  POINTS_PER_CORRECT,
  QUESTION_BANK,
  type OptionLetter,
  type QuizDay,
} from "@/data/question-bank";

export const CONTEST_TIME_ZONE = "Asia/Kolkata";
export const CONTEST_START = QUESTION_BANK[0].date;
export const CONTEST_END = QUESTION_BANK[QUESTION_BANK.length - 1].date;

/** 1–10 while the contest is live, `UPCOMING` before it, `ENDED` after it, `NOT_LIVE` while the admin has it off. */
export type ContestDayNumber = number;
export const UPCOMING = 0;
export const ENDED = -1;
export const NOT_LIVE = -2;

function indiaDate(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CONTEST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (year && month && day) return `${year}-${month}-${day}`;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CONTEST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Today's calendar date in India (`YYYY-MM-DD`). */
export function indiaToday(now = new Date()) {
  return indiaDate(now);
}

/**
 * Contest days whose winner is locked: after 12:00 AM IST the next morning.
 * Day 1's #1 appears on the Daily Winners list starting Day 2 at midnight.
 */
export function completedWinnerDays(now = new Date(), playableDay?: number | null): QuizDay[] {
  const today = indiaDate(now);
  return QUESTION_BANK.filter((quiz) => {
    if (quiz.date < today) return true;
    if (typeof playableDay === "number" && playableDay >= 1 && quiz.day < playableDay) return true;
    return false;
  });
}

/**
 * Oldest day first: the day's top player wins, then they are skipped on later days
 * so one user cannot take more than one daily prize.
 */
export function assignUniqueDailyWinners<T extends { userId: number }>(
  days: { day: number; date: string }[],
  rankedByDay: T[][],
): { day: number; date: string; winner: T | null }[] {
  const won = new Set<number>();
  return days.map((quiz, i) => {
    const winner = (rankedByDay[i] ?? []).find((row) => Number.isFinite(row.userId) && !won.has(row.userId)) ?? null;
    if (winner) won.add(winner.userId);
    return { day: quiz.day, date: quiz.date, winner };
  });
}

/** Milliseconds until the next 12:00 AM in India. */
export function msUntilIndiaMidnight(now = new Date()) {
  const today = indiaDate(now);
  const [year, month, day] = today.split("-").map(Number);
  const nextMidnightUtc = Date.UTC(year, month - 1, day, 18, 30, 0);
  let wait = nextMidnightUtc - now.getTime();
  if (wait < 1_000) wait += 24 * 60 * 60 * 1000;
  return wait;
}

export function contestDayFor(now: Date): ContestDayNumber {
  const today = indiaDate(now);
  if (today < CONTEST_START) return UPCOMING;
  if (today > CONTEST_END) return ENDED;
  return QUESTION_BANK.find((d) => d.date === today)?.day ?? ENDED;
}

/** Today's contest day from the device clock; used only when the backend can't be reached. */
export function resolveContestDay(): ContestDayNumber {
  const day = contestDayFor(new Date());
  // Local testing only. Production stays locked to 1–10 November.
  if (process.env.NODE_ENV !== "production" && day === UPCOMING) return 1;
  return day;
}

export function getQuizDay(day: number): QuizDay {
  return QUESTION_BANK[day - 1];
}

export function scoreAnswers(quiz: QuizDay, answers: (OptionLetter | null)[]) {
  const correct = quiz.questions.filter((q, i) => answers[i] === q.answer).length;
  return {
    correct,
    points: correct * POINTS_PER_CORRECT,
    maxPoints: quiz.questions.length * POINTS_PER_CORRECT,
  };
}

/** Per-question result in the shape POST /api/diwali-quiz/attempts expects. */
export function attemptAnswers(quiz: QuizDay, answers: (OptionLetter | null)[]) {
  return quiz.questions.map((q, i) => ({
    questionId: q.id,
    option: answers[i] ?? null,
    correct: answers[i] === q.answer,
  }));
}

export type SubmittedAttempt = {
  day: number;
  /** `null` where the question timer ran out before an answer was picked. */
  answers: (OptionLetter | null)[];
  correct: number;
  points: number;
  maxPoints: number;
  submittedAt: string;
  /** Whole seconds from the first question appearing to the day being submitted. */
  durationSeconds?: number;
  /** True once the backend has stored this attempt (201, or 409 because it already had it). */
  synced?: boolean;
};

/** True when this finish time falls on today's date in India. */
export function isSubmittedToday(submittedAt?: string | null): boolean {
  if (!submittedAt) return false;
  const played = new Date(submittedAt);
  if (Number.isNaN(played.getTime())) return false;
  return indiaDate(played) === indiaDate(new Date());
}

/**
 * Blocks Start Quiz only when today's attempt actually reached the backend
 * (and so the leaderboard). A local draft from a failed/partial play must not lock the day.
 */
export function playedTodayLocally(day: number): boolean {
  const attempt = loadAttempt(day);
  return attempt !== null && attempt.synced === true && isSubmittedToday(attempt.submittedAt);
}

const attemptKey = (day: number) => `pb-diwali-quiz:day-${day}`;

export function loadAttempt(day: number): SubmittedAttempt | null {
  try {
    const raw = window.localStorage.getItem(attemptKey(day));
    if (!raw) return null;
    const attempt = JSON.parse(raw) as SubmittedAttempt;
    const valid =
      attempt.day === day && Array.isArray(attempt.answers) && attempt.answers.every((a) => a === null || OPTION_LETTERS.includes(a));
    return valid ? attempt : null;
  } catch {
    return null;
  }
}

export function saveAttempt(attempt: SubmittedAttempt) {
  try {
    window.localStorage.setItem(attemptKey(attempt.day), JSON.stringify(attempt));
  } catch {
    // Storage can be unavailable in some WebViews; the host app still receives QUIZ_COMPLETE.
  }
}

/** Drop a local attempt that never made it to the leaderboard so Start Quiz can run again. */
export function clearAttempt(day: number) {
  try {
    window.localStorage.removeItem(attemptKey(day));
  } catch {
    /* ignore */
  }
}

