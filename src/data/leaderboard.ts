/**
 * Leaderboard data and ranking rules.
 *
 * Ranking: more correct answers first; on a tie, the faster time (in ms) wins.
 * The delta shown beside each player is derived here, never hardcoded in the UI,
 * so swapping in real entries keeps every badge correct.
 */

export type Participant = {
  id: string;
  name: string;
  city: string;
  state: string;
  correct: number;
  total: number;
  /** Total answering time in milliseconds. */
  timeMs: number;
  avatar: string;
};

/** Only three head-shots exist, so each entry names the one that suits it. */
const TURBAN = "/quiz/avatar-1.jpg";
const WOMAN = "/quiz/avatar-2.jpg";
const MAN = "/quiz/avatar-3.jpg";

const SEED: Omit<Participant, "id" | "total">[] = [
  { name: "Ramesh Yadav", city: "Kanpur", state: "UP", correct: 10, timeMs: 12384, avatar: TURBAN },
  { name: "Pooja Sharma", city: "Indore", state: "MP", correct: 10, timeMs: 12521, avatar: WOMAN },
  { name: "Suresh Patil", city: "Nashik", state: "MH", correct: 10, timeMs: 12782, avatar: MAN },
  { name: "Imran Khan", city: "Agra", state: "UP", correct: 9, timeMs: 10231, avatar: TURBAN },
  { name: "Neeraj Singh", city: "Patna", state: "BR", correct: 9, timeMs: 11045, avatar: MAN },
  { name: "Kamal Verma", city: "Jaipur", state: "RJ", correct: 9, timeMs: 11230, avatar: MAN },
  { name: "Vikram Choudhary", city: "Bikaner", state: "RJ", correct: 8, timeMs: 9873, avatar: TURBAN },
  { name: "Anjali Mehta", city: "Lucknow", state: "UP", correct: 8, timeMs: 10552, avatar: WOMAN },
];

export const PARTICIPANTS: Participant[] = SEED.map((p, i) => ({
  ...p,
  id: `p${i + 1}`,
  total: 10,
}));

/** More correct first, then faster time. */
export function compareParticipants(a: Participant, b: Participant) {
  if (a.correct !== b.correct) return b.correct - a.correct;
  return a.timeMs - b.timeMs;
}

/** "12.384 s" — always three decimals, with a space before the unit. */
export function formatTime(timeMs: number) {
  return `${(timeMs / 1000).toFixed(3)} s`;
}

export type DeltaTone = "top" | "behind";

export type RankedEntry = {
  rank: number;
  participant: Participant;
  /** Short text inside the pill, e.g. "–", "+0.137 s", "-1 correct". */
  badge: string;
  /** Caption under the pill, e.g. "Top Score", "Slower than Rank 1". */
  caption: string;
  tone: DeltaTone;
};

/**
 * Ranks the list and derives each row's delta.
 *
 * - Rank 1 shows an en-dash and "Top Score".
 * - The fastest player of each lower correct-count group is compared on answers:
 *   "-1 correct" / "1 less correct".
 * - Everyone else is compared on time against the fastest player holding their own
 *   correct count: "+0.137 s" / "Slower than Rank 1".
 */
export function rankParticipants(list: Participant[] = PARTICIPANTS): RankedEntry[] {
  const sorted = [...list].sort(compareParticipants);
  if (sorted.length === 0) return [];

  const best = sorted[0];
  // Rank of the fastest player holding each correct count, so captions can cite it.
  const groupLeadRank = new Map<number, number>();
  sorted.forEach((p, i) => {
    if (!groupLeadRank.has(p.correct)) groupLeadRank.set(p.correct, i + 1);
  });

  return sorted.map((participant, i) => {
    const rank = i + 1;

    if (rank === 1) {
      return { rank, participant, badge: "–", caption: "Top Score", tone: "top" as const };
    }

    const leadRank = groupLeadRank.get(participant.correct) ?? 1;
    const missing = best.correct - participant.correct;

    // The fastest player of a lower group is measured in answers, not seconds.
    if (missing > 0 && rank === leadRank) {
      return {
        rank,
        participant,
        badge: `-${missing} correct`,
        caption: `${missing} less correct`,
        tone: "behind" as const,
      };
    }

    const leadTime = sorted[leadRank - 1].timeMs;
    const gap = (participant.timeMs - leadTime) / 1000;
    return {
      rank,
      participant,
      badge: `+${gap.toFixed(3)} s`,
      caption: `Slower than Rank ${leadRank}`,
      tone: "behind" as const,
    };
  });
}

export type PrizeTier = {
  key: string;
  /** Shown inside the medal badge. */
  place: string;
  amount: string;
  note: string | null;
  medal: "gold" | "silver" | "bronze" | "rest";
};

export const PRIZE_POOL: { total: string; tiers: PrizeTier[] } = {
  total: "₹12,500",
  tiers: [
    { key: "first", place: "1", amount: "₹5,000", note: null, medal: "gold" },
    { key: "second", place: "2", amount: "₹3,000", note: null, medal: "silver" },
    { key: "third", place: "3", amount: "₹2,000", note: null, medal: "bronze" },
    {
      key: "rest",
      place: "4+",
      amount: "₹2,500",
      note: "to remaining top performers",
      medal: "rest",
    },
  ],
};
