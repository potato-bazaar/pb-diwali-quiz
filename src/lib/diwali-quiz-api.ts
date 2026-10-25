import { getSession } from "@/lib/session";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.potatobazaar.com/api/").replace(/\/?$/, "/");
const QUIZ_API = `${API_BASE_URL}diwali-quiz`;

export class QuizApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { token } = getSession();
  if (!token) throw new QuizApiError("Open the quiz from the Potato Bazaar app.", 401, "NO_TOKEN");

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
    );
  }
  return body.data as T;
}

export type InterestStatus = {
  isInterested: boolean;
  interestCount: number;
};

export function fetchInterestStatus() {
  return request<{ player: InterestStatus }>("/status").then((data) => data.player);
}

export function registerInterest(source = "home") {
  return request<{ created: boolean; interestCount: number }>("/interest", {
    method: "POST",
    body: JSON.stringify({ source }),
  });
}

function languageFromRecord(record: unknown): string | null {
  if (!record || typeof record !== "object") return null;
  const value = record as Record<string, unknown>;
  const raw = value.language ?? value.preferredLanguage ?? value.appLanguage ?? value.lang;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

/** GET /users/language — language saved on the logged-in JWT. */
export async function fetchProfileLanguage(): Promise<string | null> {
  const { token } = getSession();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}users/language`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok || !body || body.success === false) return null;
    const data = body.data;
    return (
      languageFromRecord(data) ||
      languageFromRecord(body) ||
      (data && typeof data === "object" ? languageFromRecord((data as Record<string, unknown>).user) : null) ||
      (typeof data === "string" ? data.trim() : null)
    );
  } catch {
    return null;
  }
}
