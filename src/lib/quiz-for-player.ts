import type { QuizDay } from "@/data/question-bank";
import { STATIC_QUIZ_USERS } from "@/data/static-quiz-users";
import type { QuizSession } from "@/lib/session";

const VISITOR_KEY = "pb-diwali-quiz:visitor-id";

let memoryVisitor = "";

function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function digits(value: string | number | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export function usesStaticQuestions(session: QuizSession) {
  const name = normalizeName(session.userName);
  const ids = [digits(session.userId), digits(session.userName)].filter((id) => id.length >= 8);
  return STATIC_QUIZ_USERS.some((listed) => {
    const listedId = digits(listed.userId);
    if (listedId && ids.includes(listedId)) return true;
    if (listed.name && name && normalizeName(listed.name) === name) return true;
    return false;
  });
}

function hashSeed(text: string) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const next = [...items];
  const rand = mulberry32(seed);
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}

function visitorId() {
  if (memoryVisitor) return memoryVisitor;
  try {
    let id = window.localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
      window.localStorage.setItem(VISITOR_KEY, id);
    }
    memoryVisitor = id;
    return id;
  } catch {
    memoryVisitor = `${Date.now()}-${Math.random()}`;
    return memoryVisitor;
  }
}

function seedFor(session: QuizSession, day: number) {
  const id = session.userId.trim() || session.userName.trim() || session.token.trim() || visitorId();
  return hashSeed(`d${day}:${id}`);
}

/**
 * The 7 listed users always get the original bank order.
 * Every other user (app, web, guest, no number) gets a unique question order.
 */
export function quizForPlayer(quiz: QuizDay, session: QuizSession): QuizDay {
  if (usesStaticQuestions(session)) return quiz;
  return { ...quiz, questions: shuffle(quiz.questions, seedFor(session, quiz.day)) };
}
