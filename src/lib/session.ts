/**
 * Login session handed over by the Potato Bazaar app.
 *
 * The app opens the quiz as `…/?token=<jwt>&userId=<id>&userName=<name>`. Client-side
 * navigation drops the query string, so it is copied into sessionStorage on first load.
 */

export type QuizSession = {
  token: string;
  userId: string;
  userName: string;
  /** App language from the profile, the token, or the quiz URL. */
  language: string;
};

const SESSION_KEY = "pb-diwali-quiz:session";
const EMPTY: QuizSession = { token: "", userId: "", userName: "", language: "" };

function readStored(): QuizSession {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<QuizSession>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/** Stores any session passed in the URL. Safe to call more than once. */
export function captureSessionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token")?.trim();
  if (!token) return;
  const previous = readStored();
  const session: QuizSession = {
    token,
    userId: params.get("userId")?.trim() ?? "",
    userName: (params.get("userName") ?? params.get("name"))?.trim() ?? "",
    language: (params.get("language") ?? params.get("lang") ?? previous.language ?? "").trim(),
  };
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage blocked: the token is still read from the URL while it is there.
  }
}

export function getSession(): QuizSession {
  captureSessionFromUrl();
  return readStored();
}
