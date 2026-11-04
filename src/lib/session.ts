/**
 * Login session handed over by the Potato Bazaar app.
 *
 * Token can arrive as `?token=`, a hash query, `window.__PB_ZONE_SESSION__`,
 * `pbZoneSession` storage, or a late `pbzone-session-ready` / postMessage inject.
 * Some WebViews also wipe sessionStorage — keep a memory + localStorage copy.
 */

export type QuizSession = {
  token: string;
  userId: string;
  userName: string;
  /** App language from the profile, the token, or the quiz URL. */
  language: string;
};

const SESSION_KEY = "pb-diwali-quiz:session";
const PB_ZONE_KEY = "pbZoneSession";
const EMPTY: QuizSession = { token: "", userId: "", userName: "", language: "" };

let memory: QuizSession = { ...EMPTY };

type Loose = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function decodeJwt(token: string): Loose | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (part.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Loose;
  } catch {
    return null;
  }
}

function tokenFrom(obj: Loose | null | undefined): string {
  if (!obj) return "";
  for (const key of ["token", "accessToken", "authToken", "jwt", "access_token", "bearerToken"]) {
    const value = asString(obj[key]);
    if (value) return value;
  }
  const nested = obj.user;
  if (nested && typeof nested === "object") return tokenFrom(nested as Loose);
  return "";
}

function userIdFrom(obj: Loose | null | undefined): string {
  if (!obj) return "";
  for (const key of ["userId", "id", "uid", "sub"]) {
    const raw = obj[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return String(raw);
    const value = asString(raw);
    if (value) return value;
  }
  const nested = obj.user;
  if (nested && typeof nested === "object") return userIdFrom(nested as Loose);
  return "";
}

function userNameFrom(obj: Loose | null | undefined): string {
  if (!obj) return "";
  for (const key of ["userName", "name", "fullName", "displayName"]) {
    const value = asString(obj[key]);
    if (value) return value;
  }
  const first = asString(obj.firstName ?? obj.first_name);
  const last = asString(obj.lastName ?? obj.last_name);
  const combined = [first, last].filter(Boolean).join(" ").trim();
  if (combined) return combined;
  const nested = obj.user;
  if (nested && typeof nested === "object") return userNameFrom(nested as Loose);
  return "";
}

function languageFrom(obj: Loose | null | undefined): string {
  if (!obj) return "";
  for (const key of ["language", "lang", "preferredLanguage", "appLanguage"]) {
    const value = asString(obj[key]);
    if (value) return value;
  }
  const nested = obj.user;
  if (nested && typeof nested === "object") return languageFrom(nested as Loose);
  return "";
}

function fromJwt(token: string): Partial<QuizSession> {
  const payload = decodeJwt(token);
  if (!payload) return { token };
  return {
    token,
    userId: userIdFrom(payload),
    userName: userNameFrom(payload),
    language: languageFrom(payload),
  };
}

function merge(...parts: Array<Partial<QuizSession> | null | undefined>): QuizSession {
  const out: QuizSession = { ...EMPTY };
  for (const part of parts) {
    if (!part) continue;
    if (part.token) out.token = part.token;
    if (part.userId) out.userId = part.userId;
    if (part.userName) out.userName = part.userName;
    if (part.language) out.language = part.language;
  }
  return out;
}

function readStore(store: Storage): QuizSession | null {
  try {
    const raw = store.getItem(SESSION_KEY);
    if (!raw) return null;
    return merge(EMPTY, JSON.parse(raw) as Partial<QuizSession>);
  } catch {
    return null;
  }
}

function readStored(): QuizSession {
  if (typeof window === "undefined") return { ...EMPTY };
  return merge(memory, readStore(window.sessionStorage), readStore(window.localStorage));
}

function persist(session: QuizSession) {
  memory = session;
  if (!session.token || typeof window === "undefined") return;
  const json = JSON.stringify(session);
  try {
    window.sessionStorage.setItem(SESSION_KEY, json);
  } catch {
    /* some WebViews block sessionStorage */
  }
  try {
    window.localStorage.setItem(SESSION_KEY, json);
  } catch {
    /* private mode / blocked storage */
  }
}

function queryParams(): URLSearchParams {
  const merged = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, "");
  const query = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : hash;
  if (query.includes("=")) {
    const extra = new URLSearchParams(query);
    extra.forEach((value, key) => {
      if (!merged.get(key)) merged.set(key, value);
    });
  }
  return merged;
}

function fromUrl(): Partial<QuizSession> {
  const params = queryParams();
  const token = (
    params.get("token") ||
    params.get("accessToken") ||
    params.get("authToken") ||
    params.get("jwt") ||
    ""
  ).trim();
  if (!token) return {};
  return merge(fromJwt(token), {
    userId: (params.get("userId") ?? params.get("id") ?? "").trim(),
    userName: (params.get("userName") ?? params.get("name") ?? "").trim(),
    language: (params.get("language") ?? params.get("lang") ?? "").trim(),
  });
}

function parseMaybeJson(raw: string): Loose | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Loose) : null;
  } catch {
    return null;
  }
}

function fromInjected(): Partial<QuizSession> {
  const host = window as Window & {
    __PB_ZONE_SESSION__?: Loose;
    __PB_SESSION__?: Loose;
    PB_ZONE_SESSION?: Loose;
  };
  const blobs: Loose[] = [];
  for (const blob of [host.__PB_ZONE_SESSION__, host.__PB_SESSION__, host.PB_ZONE_SESSION]) {
    if (blob && typeof blob === "object") blobs.push(blob);
  }
  for (const store of [window.sessionStorage, window.localStorage]) {
    try {
      const raw = store.getItem(PB_ZONE_KEY);
      const parsed = raw ? parseMaybeJson(raw) : null;
      if (parsed) blobs.push(parsed);
    } catch {
      /* ignore */
    }
  }
  let next: Partial<QuizSession> = {};
  for (const blob of blobs) {
    const token = tokenFrom(blob);
    next = merge(next, token ? fromJwt(token) : {}, {
      token,
      userId: userIdFrom(blob),
      userName: userNameFrom(blob),
      language: languageFrom(blob),
    });
  }
  return next;
}

function fromMessage(data: unknown): Partial<QuizSession> {
  if (typeof data === "string") {
    const parsed = parseMaybeJson(data);
    return parsed ? fromMessage(parsed) : {};
  }
  if (!data || typeof data !== "object") return {};
  const obj = data as Loose;
  const payload = obj.payload && typeof obj.payload === "object" ? (obj.payload as Loose) : obj;
  const token = tokenFrom(payload) || tokenFrom(obj);
  if (!token) return {};
  return merge(fromJwt(token), {
    token,
    userId: userIdFrom(payload) || userIdFrom(obj),
    userName: userNameFrom(payload) || userNameFrom(obj),
    language: languageFrom(payload) || languageFrom(obj),
  });
}

/** Stores any session passed in the URL, injected JS, or native message. Safe to call more than once. */
export function captureSessionFromUrl() {
  if (typeof window === "undefined") return;
  const next = merge(readStored(), fromInjected(), fromUrl());
  if (next.token) persist(next);
}

export function applyMessageSession(data: unknown) {
  const incoming = fromMessage(data);
  if (!incoming.token) return;
  persist(merge(readStored(), incoming));
}

export function applyProfileToSession(profile: Loose | null | undefined) {
  if (!profile) return;
  const current = getSession();
  const next = merge(current, {
    userId: userIdFrom(profile),
    userName: userNameFrom(profile),
    language: languageFrom(profile),
  });
  if (next.token) persist(next);
}

export function getSession(): QuizSession {
  if (typeof window === "undefined") return { ...EMPTY };
  captureSessionFromUrl();
  return merge(readStored(), memory);
}

export function isNativeQuizHost() {
  if (typeof window === "undefined") return false;
  const host = window as Window & {
    ReactNativeWebView?: unknown;
    Android?: unknown;
    webkit?: { messageHandlers?: unknown };
    __PB_ZONE_SESSION__?: unknown;
  };
  return Boolean(host.ReactNativeWebView || host.Android || host.webkit?.messageHandlers || host.__PB_ZONE_SESSION__);
}

function hostLooksNative() {
  return isNativeQuizHost();
}

/** Native WebViews often inject the token a beat after first paint. */
export async function waitForSessionToken(timeoutMs?: number): Promise<string> {
  if (typeof window === "undefined") return "";
  const existing = getSession().token;
  if (existing) return existing;
  const wait = timeoutMs ?? (hostLooksNative() ? 3500 : 400);
  const started = Date.now();
  while (Date.now() - started < wait) {
    const token = getSession().token;
    if (token) return token;
    await new Promise((resolve) => window.setTimeout(resolve, 80));
  }
  return getSession().token;
}
