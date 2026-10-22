import { getSession } from "@/lib/session";

/** Same codes as the Potato Bazaar app language setting. */
export const APP_LANGUAGES = ["en", "hi", "gu", "pa", "mr", "bn", "te", "ta", "kn"] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];

const LANGUAGE_NAMES: Record<string, AppLanguage> = {
  english: "en",
  hindi: "hi",
  हिन्दी: "hi",
  हिंदी: "hi",
  gujarati: "gu",
  ગુજરાતી: "gu",
  punjabi: "pa",
  ਪੰਜਾਬੀ: "pa",
  marathi: "mr",
  मराठी: "mr",
  bengali: "bn",
  bangla: "bn",
  বাংলা: "bn",
  telugu: "te",
  తెలుగు: "te",
  tamil: "ta",
  தமிழ்: "ta",
  kannada: "kn",
  ಕನ್ನಡ: "kn",
};

export function normalizeLanguage(value?: string | null): AppLanguage | null {
  if (!value) return null;
  const raw = value.trim().toLowerCase();
  const named = LANGUAGE_NAMES[raw];
  if (named) return named;
  const code = raw.replace("_", "-").split("-")[0];
  return (APP_LANGUAGES as readonly string[]).includes(code) ? (code as AppLanguage) : null;
}

function languageFromInjectedSession(): AppLanguage | null {
  if (typeof window === "undefined") return null;
  try {
    const injected = (window as Window & { __PB_ZONE_SESSION__?: { language?: string } }).__PB_ZONE_SESSION__;
    const fromWindow = normalizeLanguage(injected?.language);
    if (fromWindow) return fromWindow;
    const raw = window.sessionStorage.getItem("pbZoneSession");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { language?: string };
    return normalizeLanguage(parsed.language);
  } catch {
    return null;
  }
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (part.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function languageFromToken(token: string): AppLanguage | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  const raw = payload.language ?? payload.preferredLanguage ?? payload.appLanguage;
  return normalizeLanguage(typeof raw === "string" ? raw : null);
}

/** URL language wins, then the saved session, then a language claim on the token. */
export function languageFromSession(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const params = new URLSearchParams(window.location.search);
  const fromUrl = normalizeLanguage(params.get("language") ?? params.get("lang"));
  if (fromUrl) return fromUrl;
  const fromInjected = languageFromInjectedSession();
  if (fromInjected) return fromInjected;
  const session = getSession();
  const fromSession = normalizeLanguage(session.language);
  if (fromSession) return fromSession;
  return languageFromToken(session.token) ?? "en";
}
