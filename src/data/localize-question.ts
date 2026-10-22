import type { QuizQuestion } from "@/data/question-bank";
import type { AppLanguage } from "@/lib/language";
import { bnQuestions } from "@/data/i18n/bn";
import { guQuestions } from "@/data/i18n/gu";
import { hiQuestions } from "@/data/i18n/hi";
import { knQuestions } from "@/data/i18n/kn";
import { mrQuestions } from "@/data/i18n/mr";
import { paQuestions } from "@/data/i18n/pa";
import { taQuestions } from "@/data/i18n/ta";
import { teQuestions } from "@/data/i18n/te";

export type QuestionCopy = { text: string; options: [string, string, string, string] };

const PACKS: Partial<Record<AppLanguage, Record<string, QuestionCopy>>> = {
  hi: hiQuestions,
  gu: guQuestions,
  pa: paQuestions,
  mr: mrQuestions,
  bn: bnQuestions,
  te: teQuestions,
  ta: taQuestions,
  kn: knQuestions,
};

/** Same option order and answer letter. Only the words change. */
export function localizeQuestion(question: QuizQuestion, lang: AppLanguage): QuizQuestion {
  const copy = PACKS[lang]?.[question.id];
  if (!copy) return question;
  return { ...question, text: copy.text, options: copy.options };
}
