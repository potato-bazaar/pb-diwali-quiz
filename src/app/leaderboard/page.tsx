import { Suspense } from "react";
import { LeaderboardScreen } from "@/screens/leaderboard-screen";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <LeaderboardScreen />
    </Suspense>
  );
}
