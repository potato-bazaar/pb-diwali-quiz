import type { OptionLetter } from "@/data/question-bank";
import { getSession } from "@/lib/session";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.potatobazaar.com/api/").replace(/\/?$/, "/");
const QUIZ_API = `${API_BASE_URL}diwali-quiz`;

export class QuizApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Backend error code, e.g. `ALREADY_ATTEMPTED`; `NO_TOKEN` / `NETWORK` for client-side failures. */
    readonly code: string,
    readonly data?: unknown,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { token } = getSession();
  if (!token) throw new QuizApiError("Login token missing. Open the quiz from the Potato Bazaar app.", 401, "NO_TOKEN");

  let response: Response;
  try {
    response = await fetch(`${QUIZ_API}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new QuizApiError("Network error. Check your internet connection.", 0, "NETWORK");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new QuizApiError(
      body?.message || `Request failed (${response.status}).`,
      response.status,
      body?.code || (response.status === 401 ? "UNAUTHORIZED" : "REQUEST_FAILED"),
      body?.data,
    );
  }
  return body.data as T;
}

/* ---------- GET /status ---------- */

export type QuizContest = {
  /** The admin panel's live switch; nothing is playable while it is off. */
  isLive: boolean;
  status: "not_live" | "upcoming" | "live" | "ended";
  /** Day 1 and the last day, `YYYY-MM-DD` in IST. */
  startDate: string;
  endDate: string;
  totalDays: number;
  enforceDates: boolean;
  /** Calendar day (1..totalDays), `null` before Day 1 or after the last day. */
  contestDay: number | null;
  /** The day that can be played right now, `null` when nothing can. */
  playableDay: number | null;
};

export type QuizPlayerStatus = {
  totalPoints: number;
  daysPlayed: number;
  attemptedDays: number[];
  remainingDays: number[];
  /** True when the server already has an attempt for the current playable day. */
  hasAttemptedToday: boolean;
  /** False once today's quiz is done, or when no day can be played. */
  canPlayToday: boolean;
};

/** Language saved on the user's profile. The quiz follows this when the URL did not send one. */
export async function fetchProfileLanguage(): Promise<string | null> {
  const { token } = getSession();
  if (!token) return null;
  try {
    const response = await fetch(`${API_BASE_URL}user-profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const body = await response.json();
    const user = body?.userData ?? body?.data ?? body;
    const code = user?.language ?? user?.preferredLanguage ?? user?.appLanguage;
    return typeof code === "string" ? code : null;
  } catch {
    return null;
  }
}

/** Contest status. A login token adds this player's attempts; without one, only the live switch comes back. */
export async function fetchQuizStatus() {
  const { token } = getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${QUIZ_API}/status`, { headers });
  } catch {
    throw new QuizApiError("Network error. Check your internet connection.", 0, "NETWORK");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new QuizApiError(
      body?.message || `Request failed (${response.status}).`,
      response.status,
      body?.code || (response.status === 401 ? "UNAUTHORIZED" : "REQUEST_FAILED"),
      body?.data,
    );
  }
  return body.data as { contest: QuizContest; player: QuizPlayerStatus | null };
}

/* ---------- POST /attempts ---------- */

export type AttemptAnswer = {
  questionId: string;
  /** `null` when the question timed out. */
  option: OptionLetter | null;
  correct: boolean;
};

export type SubmitAttemptBody = {
  day: number;
  answers: AttemptAnswer[];
  submittedAt?: string;
  /** Whole seconds from opening this day's questions to submitting them. */
  durationSeconds?: number;
};

export type ServerAttempt = {
  day: number;
  points: number;
  correctAnswers: number;
  maxPoints: number;
};

export type PlayerSummary = {
  totalPoints: number;
  daysPlayed: number;
  attemptedDays: number[];
  remainingDays: number[];
};

export function submitAttempt(body: SubmitAttemptBody) {
  return request<{ attempt: ServerAttempt; player: PlayerSummary }>("/attempts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* ---------- GET /leaderboard ---------- */

export type LeaderboardEntry = {
  userId: number;
  name: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
  state?: string | null;
  district?: string | null;
  totalPoints: number;
  daysPlayed: number;
  rank: number;
  /** Total seconds spent across the days in this standing. Null if none were timed. */
  totalDurationSeconds?: number | null;
  /** "45s", "1m 5s", "2m". Null when no time was recorded. */
  totalDurationText?: string | null;
};

export type LeaderboardPage = {
  page: number;
  perPage: number;
  totalPlayers: number;
  totalPages: number;
  leaderboard: LeaderboardEntry[];
  /** The signed-in player's overall standing; `null` until they have played. */
  me: Pick<
    LeaderboardEntry,
    "userId" | "totalPoints" | "daysPlayed" | "rank" | "totalDurationSeconds" | "totalDurationText"
  > | null;
};

/** Overall standings. `day` is deliberately never sent: the app shows cumulative totals only. */
export function fetchLeaderboard(page = 1, perPage = 50) {
  return request<LeaderboardPage>(`/leaderboard?page=${page}&perPage=${perPage}`);
}
