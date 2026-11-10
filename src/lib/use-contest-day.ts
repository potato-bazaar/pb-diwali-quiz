"use client";

import { useEffect, useState } from "react";
import { QUESTION_BANK } from "@/data/question-bank";
import {
  ENDED,
  NOT_LIVE,
  clearAttempt,
  isSubmittedToday,
  resolveContestDay,
  type ContestDayNumber,
} from "@/lib/contest";
import { fetchQuizStatus, type QuizContest, type QuizPlayerStatus } from "@/lib/diwali-quiz-api";
import { isNativeQuizHost } from "@/lib/session";

export type ContestState = {
  /** 1–10 to play that day, otherwise `UPCOMING`, `ENDED` or `NOT_LIVE`. */
  day: ContestDayNumber;
  /** The backend's view of the contest; `null` when it couldn't be reached and the device clock was used. */
  contest: QuizContest | null;
  /** The server already has this player's attempt for `day`. */
  playedToday: boolean;
};

function playedOnServer(day: ContestDayNumber, contest: QuizContest, player: QuizPlayerStatus | null | undefined) {
  if (day < 1 || contest.playableDay !== day || !player) return false;
  // Backend says this person can still take today's quiz (never saved, or save failed).
  if (player.canPlayToday) return false;
  if (!player.hasAttemptedToday) return false;
  // Only an attempt finished today hides Start Quiz. A previous day must show Start again.
  if (player.attemptedAt) return isSubmittedToday(player.attemptedAt);
  return true;
}

/** Browser/localhost: Day 5+ so shuffle is visible. App WebView keeps the live calendar day. `?day=` overrides. */
function applyWebTestDay(day: ContestDayNumber): ContestDayNumber {
  if (typeof window === "undefined") return day;
  const query = Number(new URLSearchParams(window.location.search).get("day"));
  if (Number.isInteger(query) && query >= 1 && query <= QUESTION_BANK.length) return query;
  if (Number.isInteger(query) && (query === ENDED || query > QUESTION_BANK.length)) return ENDED;
  if (day < 1) return day;
  if (!isNativeQuizHost() && day < 5) return 5;
  return day;
}

function dayFromServer(contest: QuizContest): ContestDayNumber {
  // The 1–10 November line is only copy on the waiting screen. Once the admin
  // starts the quiz, it opens even if today's date is outside that window.
  if (!contest.isLive) {
    if (contest.status === "ended") return ENDED;
    return NOT_LIVE;
  }
  if (contest.playableDay !== null) {
    return contest.playableDay <= QUESTION_BANK.length ? contest.playableDay : ENDED;
  }
  if (contest.status === "ended") return ENDED;
  return 1;
}

/** Today's contest day, following the admin panel's live switch. `null` until it is known. */
export function useContestDay(): ContestState | null {
  const [state, setState] = useState<ContestState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load: Promise<ContestState> = fetchQuizStatus()
      .then(({ contest, player }) => {
        const day = applyWebTestDay(dayFromServer(contest));
        const playedToday = playedOnServer(day, contest, player);
        if (day >= 1 && !playedToday) clearAttempt(day);
        return { day, contest, playedToday };
      })
      .catch(() => ({ day: applyWebTestDay(resolveContestDay()), contest: null, playedToday: false }));
    void load.then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
