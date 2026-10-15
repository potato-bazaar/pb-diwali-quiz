"use client";

import { useEffect, useState } from "react";
import { QUESTION_BANK } from "@/data/question-bank";
import {
  ENDED,
  NOT_LIVE,
  UPCOMING,
  resolveContestDay,
  type ContestDayNumber,
} from "@/lib/contest";
import { fetchQuizStatus, type QuizContest } from "@/lib/diwali-quiz-api";

export type ContestState = {
  /** 1–10 to play that day, otherwise `UPCOMING`, `ENDED` or `NOT_LIVE`. */
  day: ContestDayNumber;
  /** The backend's view of the contest; `null` when it couldn't be reached and the device clock was used. */
  contest: QuizContest | null;
};

function dayFromServer(contest: QuizContest): ContestDayNumber {
  if (contest.playableDay !== null) {
    return contest.playableDay <= QUESTION_BANK.length ? contest.playableDay : ENDED;
  }
  if (contest.status === "ended") return ENDED;
  return contest.isLive ? UPCOMING : NOT_LIVE;
}

/** Today's contest day, following the admin panel's live switch. `null` until it is known. */
export function useContestDay(): ContestState | null {
  const [state, setState] = useState<ContestState | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load: Promise<ContestState> = fetchQuizStatus()
      .then(({ contest }) => ({ day: dayFromServer(contest), contest }))
      .catch(() => ({ day: resolveContestDay(), contest: null }));
    void load.then((next) => {
      if (!cancelled) setState(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
