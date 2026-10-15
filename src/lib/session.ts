/**
 * Login session handed over by the Potato Bazaar app.
 * The app opens this page as `…/?token=&userId=&userName=` and also writes
 * `pbZoneToken` into sessionStorage before the page script runs.
 */

export type QuizSession = {
  token: string;
  userId: string;
  userName: string;
};

const EMPTY: QuizSession = { token: "", userId: "", userName: "" };
const SESSION_KEY = "pb-diwali-quiz:session";

function readInjected(): QuizSession {
  try {
    const token = window.sessionStorage.getItem("pbZoneToken")?.trim() ?? "";
    if (!token) return EMPTY;
    return {
      token,
      userId: window.sessionStorage.getItem("pbZoneUserId")?.trim() ?? "",
      userName: window.sessionStorage.getItem("pbZoneUserName")?.trim() ?? "",
    };
  } catch {
    return EMPTY;
  }
}

function readStored(): QuizSession {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<QuizSession>) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function remember(session: QuizSession) {
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // The token is still on the URL for this load.
  }
}

export function getSession(): QuizSession {
  if (typeof window === "undefined") return EMPTY;

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token")?.trim();
  if (token) {
    const session: QuizSession = {
      token,
      userId: params.get("userId")?.trim() ?? "",
      userName: (params.get("userName") ?? params.get("name"))?.trim() ?? "",
    };
    remember(session);
    return session;
  }

  const injected = readInjected();
  if (injected.token) return injected;
  return readStored();
}
