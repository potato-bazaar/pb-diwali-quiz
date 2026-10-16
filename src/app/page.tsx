"use client";

import { HomeScreen } from "@/screens/home-screen";
import { QuizHomeScreen } from "@/screens/quiz-home-screen";
import { useContestDay } from "@/lib/use-contest-day";

export default function Home() {
  const state = useContestDay();
  if (!state) return null;
  // Admin "Start Quiz" is the switch. The November date on the waiting screen is not.
  const live = state.contest?.isLive === true && state.day >= 1;
  if (live) return <QuizHomeScreen />;
  if (state.contest && !state.contest.isLive) return <HomeScreen />;
  if (state.day >= 1) return <QuizHomeScreen />;
  return <HomeScreen />;
}
