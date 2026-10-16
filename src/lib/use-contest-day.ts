"use client";

import { useEffect, useState } from "react";
import { QUESTION_BANK } from "@/data/question-bank";
import {
  ENDED,
  NOT_LIVE,
  resolveContestDay,
  type ContestDayNumber,
} from "@/lib/contest";
import { fetchQuizStatus, type QuizContest, type QuizPlayerStatus } from "@/lib/diwali-quiz-api";

export type ContestState = {
  /** 1–10 to play that day, otherwise `UPCOMING`, `ENDED` or `NOT_LIVE`. */
  day: ContestDayNumber;
  /** The backend's view of the contest; `null` when it couldn't be reached and the device clock was used. */
  contest: QuizContest | null;
  /** The server already has this player's attempt for `day`. */
  playedToday: boolean;
};

function playedOnServer(day: ContestDayNumber, contest: QuizContest, player: QuizPlayerStatus | undefined) {
  if (day < 1 || !player) return false;
  if (player.attemptedDays?.includes(day)) return true;
  return player.hasAttemptedToday && contest.playableDay === day;
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
        const day = dayFromServer(contest);
        return { day, contest, playedToday: playedOnServer(day, contest, player) };
      })
      .catch(() => ({ day: resolveContestDay(), contest: null, playedToday: false }));
    void load.then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
