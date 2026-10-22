/**
 * Login session handed over by the Potato Bazaar app.
 * The app opens this page as `…/?token=&userId=&userName=` and also writes
 * `pbZoneToken` into sessionStorage before the page script runs.
 */

export type QuizSession = {
  token: string;
  userId: string;
  userName: string;
  /** App language from the quiz URL, the injected session, or the token. */
  language: string;
};

const EMPTY: QuizSession = { token: "", userId: "", userName: "", language: "" };
const SESSION_KEY = "pb-diwali-quiz:session";

function injectedLanguage(): string {
  try {
    const injected = (window as Window & { __PB_ZONE_SESSION__?: { language?: string } }).__PB_ZONE_SESSION__;
    if (injected?.language) return injected.language.trim();
    const raw = window.sessionStorage.getItem("pbZoneSession");
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { language?: string };
    return parsed.language?.trim() ?? "";
  } catch {
    return "";
  }
}

function readInjected(): QuizSession {
  try {
    const token = window.sessionStorage.getItem("pbZoneToken")?.trim() ?? "";
    if (!token) return EMPTY;
    return {
      token,
      userId: window.sessionStorage.getItem("pbZoneUserId")?.trim() ?? "",
      userName: window.sessionStorage.getItem("pbZoneUserName")?.trim() ?? "",
      language: injectedLanguage(),
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
    const previous = readStored();
    const fromUrl = (params.get("language") ?? params.get("lang") ?? "").trim();
    const session: QuizSession = {
      token,
      userId: params.get("userId")?.trim() ?? "",
      userName: (params.get("userName") ?? params.get("name"))?.trim() ?? "",
      language: fromUrl || injectedLanguage() || previous.language,
    };
    remember(session);
    return session;
  }

  const injected = readInjected();
  if (injected.token) return injected;
  return readStored();
}
