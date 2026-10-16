"use client";

import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { OPTION_LETTERS, type OptionLetter, type QuizDay } from "@/data/question-bank";
import {
  CONTEST_END,
  CONTEST_START,
  ENDED,
  NOT_LIVE,
  attemptAnswers,
  getQuizDay,
  loadAttempt,
  saveAttempt,
  scoreAnswers,
  type SubmittedAttempt,
} from "@/lib/contest";
import { QuizApiError, submitAttempt, type ServerAttempt } from "@/lib/diwali-quiz-api";
import { postToNative } from "@/lib/native-bridge";
import { unlockAudio } from "@/lib/sound";
import { useContestDay, type ContestState } from "@/lib/use-contest-day";
import { Fireworks } from "@/components/fireworks";

const PETALS: { key: string; style: CSSProperties }[] = [
  { key: "card-left", style: { top: "35%", left: "1.5%", transform: "rotate(-30deg) scale(0.8)" } },
  { key: "options-left", style: { top: "48%", left: "0.5%", transform: "rotate(25deg) scale(0.7)" } },
  { key: "options-right", style: { top: "40%", right: "0.5%", transform: "rotate(40deg) scale(0.75)" } },
];

const SPARKLES: { key: string; style: CSSProperties }[] = [
  { key: "title", style: { top: "3.5%", left: "73%", width: 28, height: 28 } },
  { key: "progress-left", style: { top: "15%", left: "1%", width: 30, height: 30 } },
  { key: "options-left", style: { top: "37%", left: "2%", width: 18, height: 18 } },
  { key: "options-right", style: { top: "51%", right: "0%", width: 18, height: 18 } },
];

const FOOTER_PETALS: { key: string; style: CSSProperties }[] = [
  { key: "right-edge", style: { bottom: "calc(var(--base) + 14px)", right: "1%", transform: "rotate(60deg) scale(0.75)" } },
  { key: "left-edge", style: { bottom: "calc(var(--base) + 10px)", left: "1%", transform: "rotate(-50deg) scale(0.75)" } },
];

const MARIGOLDS: { key: string; style: CSSProperties }[] = [
  { key: "left-outer", style: { bottom: "calc(var(--base) - 12px)", left: "-3px", width: 26, height: 22, transform: "rotate(-10deg)" } },
  { key: "left-inner", style: { bottom: "calc(var(--base) - 24px)", left: "calc(var(--mascot) * 0.62)", width: 19, height: 16, transform: "rotate(14deg)" } },
  { key: "right-outer", style: { bottom: "calc(var(--base) - 10px)", right: "-3px", width: 26, height: 22, transform: "rotate(10deg)" } },
  { key: "right-inner", style: { bottom: "calc(var(--base) - 22px)", right: "calc(var(--mascot) * 0.64)", width: 19, height: 16, transform: "rotate(-14deg)" } },
];

const FLOOR_DOTS: { key: string; style: CSSProperties }[] = [
  { key: "l1", style: { bottom: "calc(var(--base) - 2px)", left: "calc(var(--mascot) * 0.5)" } },
  { key: "l3", style: { bottom: "calc(var(--base) - 16px)", left: "22px" } },
  { key: "r1", style: { bottom: "calc(var(--base) - 4px)", right: "calc(var(--mascot) * 0.48)" } },
  { key: "r3", style: { bottom: "calc(var(--base) - 14px)", right: "24px" } },
];

const ADVANCE_DELAY_MS = 2000;
const QUESTION_TIME_S = 15;

const TIMED_OUT = "timeout";
/** `null` while unanswered, `TIMED_OUT` when the question timer ran out. */
type Given = OptionLetter | typeof TIMED_OUT | null;

/** Whether the submitted day has reached the backend (and so the leaderboard). */
type SyncState =
  | { status: "saving" }
  | { status: "saved"; totalPoints: number | null }
  | { status: "error"; message: string };

export function QuizPlayScreen() {
  const contestState = useContestDay();

  // Browsers allow sound only after a user gesture; the first tap anywhere unlocks it.
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    return () => window.removeEventListener("pointerdown", unlockAudio);
  }, []);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[linear-gradient(to_bottom,#FDF1E3_0%,#FDF3E6_45%,#FCEEDD_70%,#FBE3CA_100%)] text-[#141B36]">
      <PlayBackdrop />
      {contestState === null ? null : contestState.day >= 1 ? (
        <DayQuiz
          key={contestState.day}
          quiz={getQuizDay(contestState.day)}
          alreadyPlayed={contestState.playedToday}
        />
      ) : (
        <ContestClosed state={contestState} />
      )}
    </div>
  );
}

function useExit() {
  const router = useRouter();
  return () => {
    postToNative({ type: "QUIZ_EXIT" });
    router.push("/");
  };
}

function DayQuiz({ quiz, alreadyPlayed }: { quiz: QuizDay; alreadyPlayed: boolean }) {
  const router = useRouter();
  const exit = useExit();
  /** After the result screen: the home page variant that points to the leaderboard. */
  const finish = () => {
    postToNative({ type: "QUIZ_EXIT" });
    router.push("/completed");
  };
  const total = quiz.questions.length;
  // An attempt already stored when this screen opens means this day is finished.
  // Coming back into the quiz must not deal the questions again.
  const openedDone = useRef(loadAttempt(quiz.day) !== null || alreadyPlayed);
  useEffect(() => {
    if (openedDone.current) router.replace("/");
  }, [router]);
  const [submitted, setSubmitted] = useState<SubmittedAttempt | null>(() =>
    openedDone.current ? loadAttempt(quiz.day) : null,
  );
  const [sync, setSync] = useState<SyncState | null>(() =>
    submitted && !submitted.synced ? { status: "saving" } : null,
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Given[]>(() => quiz.questions.map(() => null));
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_S);

  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sending = useRef(false);
  const startedAt = useRef(Date.now());

  // Leaving mid-quiz must not let a pending advance submit the attempt.
  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  const question = quiz.questions[index];
  const picked = answers[index];
  const isLast = index === total - 1;

  /** Stores the day on the backend, which adds its points to the player's overall total. */
  function sendAttempt(attempt: SubmittedAttempt) {
    if (sending.current) return;
    sending.current = true;

    const markSynced = (server: ServerAttempt | null, totalPoints: number | null) => {
      const saved: SubmittedAttempt = {
        ...attempt,
        synced: true,
        ...(server && { points: server.points, correct: server.correctAnswers, maxPoints: server.maxPoints }),
      };
      saveAttempt(saved);
      setSubmitted(saved);
      setSync({ status: "saved", totalPoints });
    };

    submitAttempt({
      day: attempt.day,
      answers: attemptAnswers(quiz, attempt.answers),
      submittedAt: attempt.submittedAt,
      ...(typeof attempt.durationSeconds === "number" ? { durationSeconds: attempt.durationSeconds } : {}),
    })
      .then(({ attempt: server, player }) => markSynced(server, player.totalPoints))
      .catch((error: unknown) => {
        // The backend already has this day (e.g. played on another device): its record wins.
        if (error instanceof QuizApiError && error.code === "ALREADY_ATTEMPTED") {
          markSynced((error.data as { attempt?: ServerAttempt } | undefined)?.attempt ?? null, null);
          return;
        }
        setSync({
          status: "error",
          message: error instanceof QuizApiError ? error.message : "Could not save your points.",
        });
      })
      .finally(() => {
        sending.current = false;
      });
  }

  // A day finished earlier but never stored (offline, no token) is sent again on the next visit.
  const sendPending = useEffectEvent(() => {
    if (submitted && !submitted.synced) sendAttempt(submitted);
  });
  useEffect(() => {
    sendPending();
  }, []);

  function submit(given: Given[]) {
    if (submitted || given.some((a) => a === null)) return;
    const final = given.map((a) => (a === TIMED_OUT ? null : a));
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const attempt: SubmittedAttempt = {
      day: quiz.day,
      answers: final,
      ...scoreAnswers(quiz, final),
      submittedAt: new Date().toISOString(),
      durationSeconds,
      synced: false,
    };
    saveAttempt(attempt);
    setSubmitted(attempt);
    setSync({ status: "saving" });
    sendAttempt(attempt);
    postToNative({
      type: "QUIZ_COMPLETE",
      payload: {
        day: quiz.day,
        date: quiz.date,
        answers: attemptAnswers(quiz, final),
        correct: attempt.correct,
        points: attempt.points,
        maxPoints: attempt.maxPoints,
        submittedAt: attempt.submittedAt,
        durationSeconds: attempt.durationSeconds,
      },
    });
  }

  function retrySync() {
    if (!submitted) return;
    setSync({ status: "saving" });
    sendAttempt(submitted);
  }

  function advance(given: Given[]) {
    if (isLast) {
      submit(given);
    } else {
      setIndex(index + 1);
      setTimeLeft(QUESTION_TIME_S);
    }
  }

  function resolveQuestion(given: OptionLetter | typeof TIMED_OUT) {
    if (submitted || picked !== null) return;
    const nextAnswers = answers.map((a, i) => (i === index ? given : a));
    setAnswers(nextAnswers);
    unlockAudio();
    postToNative({
      type: "QUIZ_ANSWER",
      payload: {
        day: quiz.day,
        questionId: question.id,
        option: given === TIMED_OUT ? null : given,
        correct: given === question.answer,
        timedOut: given === TIMED_OUT,
      },
    });
    // Right or wrong, the score stays local until the last question submits the whole day.
    advanceTimer.current = setTimeout(() => {
      advanceTimer.current = null;
      advance(nextAnswers);
    }, ADVANCE_DELAY_MS);
  }

  const onTimeUp = useEffectEvent(() => resolveQuestion(TIMED_OUT));

  useEffect(() => {
    if (submitted || picked !== null) return;
    let left = QUESTION_TIME_S;
    const tick = setInterval(() => {
      left -= 1;
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(tick);
        onTimeUp();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [index, picked, submitted]);

  if (openedDone.current) return null;

  if (submitted) {
    return <ResultCard attempt={submitted} quiz={quiz} sync={sync} onRetrySync={retrySync} onExit={finish} />;
  }

  return (
    <>
      <PlayNav
        onClose={exit}
        subtitle={`Day ${quiz.day}`}
        counter={`${index + 1}/${total}`}
      />

      {/* Progress */}
      <div className="relative z-10 mx-[30px] mt-[clamp(8px,1.6dvh,14px)] shrink-0">
        <ol className="flex items-center rounded-full bg-[rgba(246,226,206,0.75)] px-[16px] py-[12px] shadow-[inset_0_1px_2px_rgba(190,120,60,0.10)]">
          {quiz.questions.map((q, i) => {
            const given = answers[i];
            const done = given !== null;
            const right = given === q.answer;
            const current = i === index && !done;
            return (
              <li key={q.id} className="flex flex-1 items-center last:flex-none">
                <span
                  className={`block shrink-0 rounded-full ${
                    current
                      ? "h-[18px] w-[18px] bg-[radial-gradient(circle_at_35%_30%,#FF9A52,#EE5A1E_60%,#D2400F)] shadow-[0_2px_5px_rgba(220,80,20,0.45)]"
                      : done
                        ? right
                          ? "h-[14px] w-[14px] bg-[radial-gradient(circle_at_35%_30%,#7DDB8A,#2FAE4E)]"
                          : "h-[14px] w-[14px] bg-[radial-gradient(circle_at_35%_30%,#FF8F7A,#E5533D)]"
                        : "h-[14px] w-[14px] bg-[radial-gradient(circle_at_35%_30%,#EAE6E3,#CFCAC6)]"
                  }`}
                />
                {i < total - 1 && (
                  <span
                    className={`h-[2px] flex-1 ${answers[i + 1] !== null ? "bg-[#F29A58]" : "bg-[#CFCAC6]"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <main
        key={index}
        className="question-in relative z-10 flex min-h-0 flex-auto flex-col overflow-y-auto px-[18px] pb-[4px] [scrollbar-width:none]"
      >
        {/* Question card */}
        <section className="relative mt-[clamp(8px,1.8dvh,24px)] shrink-0 overflow-hidden rounded-[22px] border-[1.5px] border-[rgba(255,255,255,0.85)] bg-[linear-gradient(160deg,rgba(254,244,232,0.95)_0%,rgba(252,236,218,0.92)_100%)] px-[22px] pt-[clamp(12px,2.2dvh,24px)] pb-[clamp(10px,2dvh,20px)] shadow-[0_10px_26px_rgba(200,120,60,0.14)]">
          <CardMandala className="pointer-events-none absolute top-[-16px] right-[-36px] h-[100px] w-[100px]" />
          <Sparkle style={{ right: 14, bottom: 12, width: 36, height: 36 }} />
          <Sparkle style={{ top: 4, left: "56%", width: 28, height: 28 }} />
          <div className="relative flex items-center gap-[12px]">
            <p className="text-[18px] leading-[22px] font-bold text-[#D9431B]">Q{index + 1}.</p>
            <QuestionTimer seconds={timeLeft} />
          </div>
          <h2 className="relative mt-[clamp(6px,1.2dvh,10px)] pr-[28px] font-display text-[clamp(19px,2.8dvh,23px)] leading-[1.25] font-extrabold tracking-[-0.01em]">
            {question.text}
          </h2>
          <Ornament className="relative mx-auto mt-[clamp(8px,1.6dvh,14px)] h-[21px] w-[150px]" />
        </section>

        {/* Options */}
        <ul className="mt-[clamp(8px,1.6dvh,18px)] flex flex-col gap-[clamp(6px,1.2dvh,12px)]">
          {question.options.map((option, i) => {
            const letter = OPTION_LETTERS[i];
            const state =
              picked === null
                ? "idle"
                : letter === question.answer
                  ? "correct"
                  : letter === picked
                    ? "wrong"
                    : "idle";
            const styles = OPTION_STYLES[state];
            return (
              <li key={letter}>
                <button
                  type="button"
                  onClick={() => resolveQuestion(letter)}
                  disabled={picked !== null}
                  aria-pressed={picked === letter}
                  className={`flex min-h-[clamp(46px,7.2dvh,64px)] w-full items-center gap-[14px] rounded-[18px] border-[1.5px] px-[14px] py-[8px] text-left transition-colors duration-200 enabled:active:scale-[0.99] ${styles.card}`}
                >
                  <span
                    className={`flex h-[clamp(34px,5dvh,40px)] w-[clamp(34px,5dvh,40px)] shrink-0 items-center justify-center rounded-full text-[18px] font-bold transition-colors duration-200 ${styles.badge}`}
                  >
                    {letter}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] leading-[19px] font-medium text-[#232A40]">
                    {option}
                  </span>
                  {state === "correct" && <CheckCircle className="h-[24px] w-[24px] shrink-0" />}
                  {state === "wrong" && <CrossCircle className="h-[24px] w-[24px] shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      </main>

      <PlayFooter>
        <div role="status" aria-live="polite" className="relative z-10 mb-[calc(var(--mascot)*0.24)] flex h-[60px] w-full max-w-[310px] items-center">
          {picked !== null && (
            <AnswerVerdict
              key={index}
              verdict={picked === TIMED_OUT ? "timeout" : picked === question.answer ? "correct" : "wrong"}
            />
          )}
        </div>
      </PlayFooter>
    </>
  );
}

/** "2026-11-01" → "1 November 2026". */
const longDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

function ContestClosed({ state }: { state: ContestState }) {
  const exit = useExit();
  const start = longDate(state.contest?.startDate ?? CONTEST_START);
  const end = longDate(state.contest?.endDate ?? CONTEST_END);
  const [title, message] =
    state.day === ENDED
      ? ["Quiz khatam ho gaya", `Diwali Quiz ${end} ko khatam ho gaya. Hissa lene ke liye dhanyavaad!`]
      : state.day === NOT_LIVE
        ? ["Quiz abhi live nahi hai", "Diwali Quiz jaldi live hoga. Har din 10 naye sawaal! Thodi der baad dobara dekhiye."]
        : ["Quiz jald shuru hoga", `Diwali Quiz ${start} se ${end} tak roz chalega. Har din 10 naye sawaal!`];
  return (
    <>
      <PlayNav onClose={exit} subtitle={`${start} – ${end}`} />
      <main className="question-in relative z-10 flex flex-1 flex-col items-center justify-center px-[30px] py-[16px] text-center">
        <img
          src="/quiz/gift-top.png"
          alt=""
          draggable={false}
          className="h-[84px] w-[84px] object-contain drop-shadow-[0_6px_10px_rgba(150,60,20,0.25)]"
        />
        <p className="mt-[12px] font-display text-[28px] leading-[32px] font-black text-[#E2551F]">{title}</p>
        <p className="mt-[10px] max-w-[290px] text-[15.5px] leading-[22px] text-[#555555]">{message}</p>
        <button
          type="button"
          onClick={exit}
          className="mt-[24px] flex h-[52px] w-full max-w-[240px] items-center justify-center rounded-full bg-gradient-to-r from-[#F2742C] via-[#EC5F24] to-[#E2461C] text-[17px] font-bold text-white shadow-[0_10px_22px_rgba(226,80,28,0.36)] active:scale-[0.98]"
        >
          Home par jaaiye
        </button>
      </main>
      <PlayFooter />
    </>
  );
}

function PlayBackdrop() {
  return (
    <>
      {/* Warm dusk shade at the top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[190px]"
        style={{
          background:
            "radial-gradient(ellipse 70% 90% at 80% 0%, rgba(240,170,110,0.30), rgba(240,170,110,0) 70%), linear-gradient(to bottom, #E2C1B1 0%, #EDD2C0 22%, #F7E2CF 50%, rgba(252,238,222,0) 100%)",
        }}
      />
      {/* Orange glow behind the mascots and button */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 88%, rgba(244,150,80,0.42), rgba(244,150,80,0) 100%), radial-gradient(ellipse 40% 30% at 12% 92%, rgba(255,190,110,0.35), rgba(255,190,110,0) 100%), radial-gradient(ellipse 40% 30% at 88% 92%, rgba(255,190,110,0.35), rgba(255,190,110,0) 100%), linear-gradient(to bottom, rgba(250,220,190,0) 0%, rgba(248,206,168,0.55) 70%, rgba(246,196,150,0.75) 100%)",
        }}
      />
      {SPARKLES.map((sparkle) => (
        <Sparkle key={sparkle.key} style={sparkle.style} />
      ))}
      {PETALS.map((petal) => (
        <Petal key={petal.key} style={petal.style} />
      ))}
    </>
  );
}

function PlayNav({ onClose, subtitle, counter }: { onClose: () => void; subtitle: string; counter?: string }) {
  return (
    <nav className="relative z-10 grid shrink-0 grid-cols-[40px_1fr_40px] items-center px-[18px] pt-[max(clamp(22px,calc(10dvh-44px),46px),calc(env(safe-area-inset-top)+8px))]">
      <button
        type="button"
        aria-label="Close quiz"
        onClick={onClose}
        className="flex h-[40px] w-[40px] items-center justify-center rounded-full text-[#1C2447] active:scale-95 active:bg-[#F8DCC0]"
      >
        <CloseIcon className="h-[22px] w-[22px]" />
      </button>
      <div className="min-w-0 text-center">
        <h1 className="font-display text-[20px] leading-[24px] font-bold tracking-[-0.01em]">Diwali Quiz</h1>
        <p className="mt-[2px] truncate text-[12.5px] leading-[16px] font-semibold text-[#C2521F]">{subtitle}</p>
      </div>
      <p className="text-right text-[16px] font-semibold">{counter}</p>
    </nav>
  );
}

/** Sized from the footer's own height, so the artwork shrinks with it when a long question needs the room. */
const FOOTER_VARS = {
  "--base": "34cqh",
  "--mascot": "60cqh",
} as CSSProperties;

function PlayFooter({ children }: { children?: ReactNode }) {
  return (
    <footer
      style={FOOTER_VARS}
      className="relative z-10 mt-auto flex h-[clamp(140px,calc(36dvh-92px),216px)] min-h-[112px] shrink-[100] items-end justify-center px-[38px] [container-type:size]"
    >
      {/* Floor the mascots stand on */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[calc(var(--base)+26px)]"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 50% 30%, rgba(255,186,120,0.18), rgba(255,186,120,0) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-190px] left-1/2 w-[290px] -translate-x-1/2 [filter:brightness(0.8)_saturate(1.3)]"
      >
        <img src="/quiz/mandala.png" alt="" draggable={false} className="chakra-spin block w-full select-none" />
      </div>
      {FOOTER_PETALS.map((petal) => (
        <Petal key={petal.key} style={petal.style} />
      ))}
      {FLOOR_DOTS.map((dot) => (
        <span
          key={dot.key}
          aria-hidden="true"
          className="pointer-events-none absolute h-[3px] w-[3px] rounded-full bg-[#E9A23B]"
          style={dot.style}
        />
      ))}
      {MARIGOLDS.map((flower) => (
        <Marigold key={flower.key} style={flower.style} />
      ))}
      <Leaves className="pointer-events-none absolute bottom-[calc(var(--base)+var(--mascot)*0.22)] left-[-8px] h-[56px] w-[32px]" />
      <Leaves className="pointer-events-none absolute right-[-8px] bottom-[calc(var(--base)+var(--mascot)*0.22)] h-[56px] w-[32px] -scale-x-100" />
      {/* Mascots: each one bobs, then jumps with a backflip; the right one runs 3.5s behind */}
      <MascotActor side="left" />
      <MascotActor side="right" />
      <BurningDiya className="left-[8px] h-[clamp(40px,5.8dvh,50px)]" />
      <BurningDiya className="right-[12px] h-[clamp(44px,6.4dvh,56px)] -scale-x-100" flicker="1.35s" glow="2.1s" delay="-0.7s" />
      <div className="relative z-10 flex w-full justify-center pb-[var(--base)]">{children}</div>
    </footer>
  );
}

/** One potato: stands at its side, bobs, and does a backflip (the right one runs 3.5s behind). */
function MascotActor({ side }: { side: "left" | "right" }) {
  const mirrored = side === "right";
  const timing = mirrored ? { animationDelay: "-3.5s" } : undefined;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-[calc(var(--base)+4px)] h-[calc(var(--mascot)+4px)] w-[calc(var(--mascot)*0.803)] ${
        mirrored ? "right-[-6px] -scale-x-100" : "left-[-6px]"
      }`}
    >
      <span
        style={timing}
        className="mascot-shadow absolute bottom-0 left-[13%] h-[10px] w-[38%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(140,70,25,0.32),rgba(140,70,25,0))]"
      />
      <div style={timing} className="mascot-jump absolute inset-x-0 bottom-[4px] h-[var(--mascot)]">
        <img
          src="/quiz/potato-mascot.png"
          alt=""
          draggable={false}
          style={timing}
          className="mascot-body block h-full w-auto select-none drop-shadow-[0_4px_5px_rgba(120,60,20,0.18)]"
        />
      </div>
    </div>
  );
}

/** Diya image with a live flame drawn over the painted one, plus a pulsing glow. */
function BurningDiya({
  className,
  flicker = "1.1s",
  glow = "1.7s",
  delay = "0s",
}: {
  className: string;
  flicker?: string;
  glow?: string;
  delay?: string;
}) {
  const id = useId();
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-[clamp(4px,1dvh,10px)] z-20 w-auto ${className}`}
    >
      <span
        style={{ animationDuration: glow, animationDelay: delay }}
        className="flame-glow absolute top-[-21%] left-1/2 aspect-square w-[115%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,205,95,0.6)_0%,rgba(255,160,60,0.28)_35%,rgba(255,150,50,0)_65%)]"
      />
      <img
        src="/quiz/diya-round.png"
        alt=""
        draggable={false}
        className="relative block h-full w-auto select-none drop-shadow-[0_5px_6px_rgba(120,40,10,0.28)]"
      />
      <svg
        viewBox="0 0 40 72"
        style={{ animationDuration: flicker, animationDelay: delay }}
        className="flame-flicker absolute top-[1%] left-1/2 h-[60%] w-auto -translate-x-1/2 drop-shadow-[0_0_5px_rgba(255,180,70,0.9)]"
      >
        <defs>
          <linearGradient id={`${id}-outer`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFC13A" />
            <stop offset="0.55" stopColor="#FF9A26" />
            <stop offset="1" stopColor="#F2641C" />
          </linearGradient>
          <linearGradient id={`${id}-mid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE98A" />
            <stop offset="1" stopColor="#FFB83C" />
          </linearGradient>
        </defs>
        <path d="M20 1C30 14 36 26 36 42c0 15-7 26-16 26S4 57 4 42C4 26 10 14 20 1Z" fill={`url(#${id}-outer)`} opacity="0.95" />
        <path d="M20 16c6 9 9.5 17 9.5 27 0 10-4.5 17-9.5 17S10.5 53 10.5 43c0-10 3.5-18 9.5-27Z" fill={`url(#${id}-mid)`} />
        <path d="M20 32c3 5 4.8 9.5 4.8 14.5 0 5.5-2.2 9.5-4.8 9.5s-4.8-4-4.8-9.5c0-5 1.8-9.5 4.8-14.5Z" fill="#FFF8D6" />
      </svg>
    </div>
  );
}

const OPTION_STYLES = {
  idle: {
    card: "border-[rgba(255,255,255,0.9)] bg-[linear-gradient(to_right,rgba(255,255,255,0.88),rgba(250,248,246,0.82))] shadow-[0_6px_16px_rgba(190,120,60,0.10)]",
    badge: "bg-[#DCE8FA] text-[#1F56C2]",
  },
  correct: {
    card: "border-[#5CC063] bg-[linear-gradient(to_right,#E4F7DD,#EEF9E8)] shadow-[0_6px_16px_rgba(60,160,70,0.18)]",
    badge: "bg-[#2FAE4E] text-white",
  },
  wrong: {
    card: "border-[#E5533D] bg-[linear-gradient(to_right,#FDE7E3,#FEF0ED)] shadow-[0_6px_16px_rgba(220,80,60,0.16)]",
    badge: "bg-[#E5533D] text-white",
  },
};

function ResultCard({
  attempt,
  quiz,
  sync,
  onRetrySync,
  onExit,
}: {
  attempt: SubmittedAttempt;
  quiz: QuizDay;
  sync: SyncState | null;
  onRetrySync: () => void;
  onExit: () => void;
}) {
  const router = useRouter();

  return (
    <div className="question-in absolute inset-0 z-20 overflow-hidden text-center">
      <img
        src="/quiz/result-bg.jpg"
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top select-none"
      />
      <Fireworks className="pointer-events-none absolute inset-x-0 top-0 h-[52%] w-full" />
      <button
        type="button"
        aria-label="Close"
        onClick={onExit}
        className="absolute top-[max(clamp(18px,calc(8dvh-36px),40px),calc(env(safe-area-inset-top)+6px))] right-[14px] z-10 flex h-[40px] w-[40px] items-center justify-center rounded-full text-white active:bg-[rgba(255,255,255,0.15)]"
      >
        <CloseIcon className="h-[24px] w-[24px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
      </button>

      <div className="relative z-[1] px-[22px] pt-[clamp(112px,19dvh,156px)]">
      {/* Score card sits in the sky; the gift and diya are drawn over its left and right edges */}
      <section className="relative mx-auto w-full max-w-[330px] shrink-0 overflow-visible rounded-[28px] bg-[#FFF9F1] px-[14px] pt-[44px] pb-[14px] shadow-[0_16px_36px_rgba(160,80,30,0.22)]">
        <div className="absolute top-[-32px] left-1/2 flex h-[72px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full bg-[#FFF9F1] shadow-[0_8px_16px_rgba(160,80,30,0.08)]">
          <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_28%,#5ED67A,#2EAE4A)] shadow-[0_6px_14px_rgba(36,150,60,0.38)]">
            <svg viewBox="0 0 24 24" className="h-[30px] w-[30px]" fill="none" aria-hidden="true">
              <path d="M5.2 12.4l4.3 4.3L18.8 7.4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
        {CONFETTI.map((piece) => (
          <span
            key={piece.key}
            aria-hidden="true"
            className="pointer-events-none absolute h-[11px] w-[6px] rounded-[2px]"
            style={piece.style}
          />
        ))}
        <p className="relative font-display text-[26px] leading-[1.1] font-extrabold text-[#24963F]">
          Total Score
        </p>
        <p className="relative mt-[8px] font-display text-[18px] leading-[1.2] font-extrabold text-[#1A2142]">
          You Scored
        </p>
        <p className="relative mt-[2px] font-display text-[52px] leading-[1.02] font-black tracking-[-0.03em] whitespace-nowrap text-[#E24A1C]">
          {attempt.points} Points
        </p>
        <p className="relative mt-[6px] text-[14px] font-semibold text-[#8A6244]">
          {attempt.correct}/{quiz.questions.length} सही जवाब
        </p>

        <div className="relative mt-[16px] grid grid-cols-2 gap-[10px]">
          <div className="rounded-[16px] bg-[#FFF1E6] px-[8px] py-[12px] text-center">
            <ScoreTrophy className="mx-auto h-[32px] w-[32px]" />
            <p className="mt-[6px] text-[12.5px] leading-[16px] font-bold text-[#D2652E]">आज का स्कोर</p>
            <p className="mt-[2px] font-display text-[30px] leading-none font-black text-[#E24A1C]">{attempt.points}</p>
          </div>
          <div className="rounded-[16px] bg-[#F1F7EE] px-[8px] py-[12px] text-center">
            <ScoreStar className="mx-auto h-[32px] w-[32px]" />
            <p className="mt-[6px] text-[12.5px] leading-[16px] font-bold text-[#2E8A45]">अब तक का कुल स्कोर</p>
            <p className="mt-[2px] font-display text-[30px] leading-none font-black text-[#24963F]">{overallPoints(sync, attempt.points)}</p>
          </div>
        </div>
      </section>
      </div>

      <img
        src="/quiz/result-fg.webp"
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-cover object-top select-none"
      />

      <div className="absolute inset-x-0 bottom-[clamp(16px,3.2dvh,32px)] z-[3] mx-auto flex w-[calc(100%-44px)] max-w-[330px] flex-col gap-[12px]">
      <section className="relative w-full shrink-0 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#FFF8EE_0%,#FFF3E4_100%)] px-[8px] py-[12px] text-left shadow-[0_8px_18px_rgba(190,110,50,0.12)]">
        <CalendarDiya className="pointer-events-none absolute top-1/2 left-[2px] h-[58px] w-[58px] -translate-y-1/2" />
        <FireworkBurst className="pointer-events-none absolute top-[2px] right-[2px] h-[48px] w-[48px]" />
        <div className="pl-[50px] pr-[40px]">
          <p className="text-[14.5px] leading-[19px] font-extrabold text-[#E1262A]">आज का क्विज़ पूरा हुआ!</p>
          <p className="text-[14.5px] leading-[19px] font-extrabold text-[#1A2142]">कल फिर आइए, नए सवालों के साथ!</p>
          <p className="mt-[4px] text-[12px] leading-[16px] font-semibold text-[#7A7168]">
            10 दिनों तक खेलें और अपना कुल स्कोर बढ़ाएँ।
          </p>
        </div>
      </section>

      <SyncNote sync={sync} onRetry={onRetrySync} />

      <div className="flex w-full flex-col gap-[12px]">
        <button
          type="button"
          onClick={() => {
            postToNative({ type: "QUIZ_LEADERBOARD", payload: { day: quiz.day } });
            router.push("/leaderboard");
          }}
          className="relative flex h-[58px] shrink-0 items-center justify-center gap-[12px] rounded-full bg-gradient-to-r from-[#F2742C] via-[#EC5F24] to-[#E2461C] text-[21px] font-bold text-white shadow-[0_12px_26px_rgba(226,80,28,0.38)] active:scale-[0.98]"
        >
          <span className="pointer-events-none absolute top-1/2 left-[8px] flex h-[62px] w-[62px] -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,226,160,0.55)_0%,rgba(255,200,120,0.18)_45%,rgba(255,200,120,0)_70%)]">
            <img
              src="/quiz/sparkler.png"
              alt=""
              draggable={false}
              className="h-[60px] w-[60px] object-contain select-none [filter:brightness(1.5)_saturate(1.2)_drop-shadow(0_0_4px_rgba(255,236,170,0.95))]"
            />
          </span>
          <span>Leaderboard</span>
          <ArrowIcon className="h-[22px] w-[22px]" />
          <img
            src="/quiz/diya-round.png"
            alt=""
            draggable={false}
            className="pointer-events-none absolute top-1/2 right-[16px] h-[42px] w-auto -translate-y-1/2 select-none drop-shadow-[0_3px_5px_rgba(120,40,10,0.35)]"
          />
        </button>
        <button
          type="button"
          onClick={onExit}
          className="flex h-[clamp(50px,6.6dvh,56px)] items-center justify-center rounded-full border-[1.5px] border-[#CFC3B6] bg-[rgba(255,252,246,0.75)] text-[17px] font-semibold text-[#4A4652] active:scale-[0.98] active:bg-[#F8EBDD]"
        >
          Back to Home
        </button>
      </div>
      </div>
    </div>
  );
}

function overallPoints(sync: SyncState | null, today: number) {
  if (sync?.status === "saved" && sync.totalPoints !== null) return sync.totalPoints;
  return today;
}

function ScoreTrophy({ className }: IconProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-cup`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE98A" />
          <stop offset="48%" stopColor="#F6C431" />
          <stop offset="100%" stopColor="#E39B12" />
        </linearGradient>
        <linearGradient id={`${id}-base`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0B033" />
          <stop offset="100%" stopColor="#D4890C" />
        </linearGradient>
      </defs>
      <path
        d="M15.2 12.2H12.6c-2.5 0-4.2 1.8-4.2 4 0 2.5 2 4.3 4.6 4.6"
        fill="none"
        stroke={`url(#${id}-cup)`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M32.8 12.2h2.6c2.5 0 4.2 1.8 4.2 4 0 2.5-2 4.3-4.6 4.6"
        fill="none"
        stroke={`url(#${id}-cup)`}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        fill={`url(#${id}-cup)`}
        d="M16.4 7.4h15.2c.9 0 1.6.7 1.6 1.6v7.2c0 4.8-4 8.4-9.2 8.4s-9.2-3.6-9.2-8.4V9c0-.9.7-1.6 1.6-1.6Z"
      />
      <path d="M20 10.2c.5 2.8.6 5.4.1 8" fill="none" stroke="#FFF6C8" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="22.3" y="24.4" width="3.4" height="4.6" rx="0.7" fill={`url(#${id}-base)`} />
      <rect x="16.4" y="28.8" width="15.2" height="4" rx="1.3" fill={`url(#${id}-base)`} />
    </svg>
  );
}

function ScoreStar({ className }: IconProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-star`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE56A" />
          <stop offset="100%" stopColor="#F0B429" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id}-star)`}
        stroke={`url(#${id}-star)`}
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
        d="M24 8.2 28.4 18.2 39.2 19 31 26.4 33.6 37 24 31.4 14.4 37 17 26.4 8.8 19 19.6 18.2Z"
      />
    </svg>
  );
}

function CalendarDiya({ className }: IconProps) {
  const cells = [0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => ({ row, col })));
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      <rect x="8" y="18" width="9" height="5" rx="2" fill="#F6C14A" transform="rotate(-28 12 20)" />
      <rect x="4" y="40" width="8" height="4.5" rx="1.6" fill="#F08A2A" transform="rotate(18 8 42)" />
      <rect x="10" y="64" width="7" height="4" rx="1.4" fill="#E5533D" transform="rotate(-18 13 66)" />
      <rect x="72" y="14" width="8" height="4.5" rx="1.6" fill="#F6C14A" transform="rotate(24 76 16)" />
      <rect x="78" y="34" width="7" height="4" rx="1.4" fill="#F08A2A" transform="rotate(-12 81 36)" />
      <rect x="30" y="8" width="6.5" height="14" rx="3.2" fill="#E7C48A" />
      <rect x="50" y="8" width="6.5" height="14" rx="3.2" fill="#E7C48A" />
      <rect x="31.4" y="9.5" width="2.2" height="9" rx="1.1" fill="#F8E6C2" />
      <rect x="51.4" y="9.5" width="2.2" height="9" rx="1.1" fill="#F8E6C2" />
      <rect x="18" y="18" width="50" height="52" rx="8" fill="#FFFFFF" />
      <path d="M18 28v-4a8 8 0 0 1 8-8h34a8 8 0 0 1 8 8v4H18Z" fill="#E1262A" />
      {cells.map(({ row, col }) => (
        <rect
          key={`${row}-${col}`}
          x={26 + col * 12}
          y={34 + row * 11}
          width="8"
          height="7"
          rx="1.6"
          fill="#F3E4D8"
        />
      ))}
      <path d="M62 52c2.6 4.2 4 6.8 4 9.4a4 4 0 0 1-8 0c0-2.6 1.4-5.2 4-9.4Z" fill="#FFD15A" />
      <path d="M62 58c1.1 1.8 1.7 3 1.7 4.2a1.7 1.7 0 0 1-3.4 0c0-1.2.6-2.4 1.7-4.2Z" fill="#FFF6C8" />
      <path d="M50 66c1.4 6.2 5.6 9.6 12 9.6s10.6-3.4 12-9.6c-2.6 2.2-6.8 3.4-12 3.4s-9.4-1.2-12-3.4Z" fill="#E07A32" />
      <path d="M53 66.4c1 3.6 3.6 5.6 9 5.6s8-2 9-5.6c-1.8 1.4-5 2.2-9 2.2s-7.2-.8-9-2.2Z" fill="#C45A22" />
      <circle cx="56" cy="65.2" r="0.7" fill="#FFF6E8" />
      <circle cx="59.2" cy="64.4" r="0.7" fill="#FFF6E8" />
      <circle cx="62.4" cy="64.2" r="0.7" fill="#FFF6E8" />
      <circle cx="65.6" cy="64.6" r="0.7" fill="#FFF6E8" />
      <circle cx="68.4" cy="65.6" r="0.7" fill="#FFF6E8" />
    </svg>
  );
}

function FireworkBurst({ className }: IconProps) {
  const id = useId().replace(/:/g, "");
  const rays = [
    { angle: -90, len: 27, width: 7.2 },
    { angle: -60, len: 20, width: 5.2 },
    { angle: -30, len: 26, width: 6.4 },
    { angle: 0, len: 18, width: 4.8 },
    { angle: 30, len: 25, width: 6.2 },
    { angle: 60, len: 19, width: 5 },
    { angle: 90, len: 26, width: 6.6 },
    { angle: 120, len: 18, width: 4.8 },
    { angle: 150, len: 24, width: 6 },
    { angle: 180, len: 19, width: 5 },
    { angle: 210, len: 27, width: 6.8 },
    { angle: 240, len: 18, width: 4.6 },
  ];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-ray`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#FFF3C4" />
          <stop offset="38%" stopColor="#F6C04A" />
          <stop offset="100%" stopColor="#E25A1C" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="11" fill="#FFE7A8" opacity="0.55" />
      {rays.map((ray) => {
        const rad = (ray.angle * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const px = -sin;
        const py = cos;
        const inner = 4;
        const half = ray.width / 2;
        const tipX = 32 + cos * ray.len;
        const tipY = 32 + sin * ray.len;
        const left = `${(32 + cos * inner + px * half).toFixed(2)} ${(32 + sin * inner + py * half).toFixed(2)}`;
        const right = `${(32 + cos * inner - px * half).toFixed(2)} ${(32 + sin * inner - py * half).toFixed(2)}`;
        const c1 = `${(32 + cos * (ray.len - 4) + px * half * 0.28).toFixed(2)} ${(32 + sin * (ray.len - 4) + py * half * 0.28).toFixed(2)}`;
        const c2 = `${(32 + cos * (ray.len - 4) - px * half * 0.28).toFixed(2)} ${(32 + sin * (ray.len - 4) - py * half * 0.28).toFixed(2)}`;
        return (
          <path
            key={ray.angle}
            fill={`url(#${id}-ray)`}
            d={`M ${left} Q ${c1} ${tipX.toFixed(2)} ${tipY.toFixed(2)} Q ${c2} ${right} Z`}
          />
        );
      })}
      <circle cx="32" cy="32" r="5.5" fill="#FFE9A6" />
      <circle cx="32" cy="32" r="2.6" fill="#FFF8E4" />
    </svg>
  );
}

function SyncNote({ sync, onRetry }: { sync: SyncState | null; onRetry: () => void }) {
  if (!sync) return null;
  if (sync.status === "error") {
    return (
      <div role="alert" className="relative mt-[8px] text-[12px] leading-[16px] text-[#C2412A]">
        <p>{sync.message}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-[4px] rounded-full border border-[#E8B9A8] px-[12px] py-[3px] text-[12px] font-bold text-[#D9431B] active:bg-[#FBE6DD]"
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <p role="status" className="relative mt-[6px] text-[12px] leading-[16px] font-semibold text-[#8A7A6C]">
      {sync.status === "saving"
        ? "Saving your points…"
        : sync.totalPoints !== null
          ? `Overall total: ${sync.totalPoints} points`
          : "Points saved to the leaderboard"}
    </p>
  );
}

const CONFETTI: { key: string; style: CSSProperties }[] = [
  { key: "a", style: { top: 28, left: 16, background: "#F2C14A", transform: "rotate(-30deg)" } },
  { key: "b", style: { top: 72, left: 12, background: "#E5533D", transform: "rotate(26deg)" } },
  { key: "c", style: { top: 128, left: 22, background: "#3CB85A", transform: "rotate(52deg)" } },
  { key: "d", style: { top: 34, right: 16, background: "#E5533D", transform: "rotate(36deg)" } },
  { key: "e", style: { top: 86, right: 12, background: "#F2C14A", transform: "rotate(-18deg)" } },
  { key: "f", style: { top: 140, right: 20, background: "#3CB85A", transform: "rotate(-48deg)" } },
];

/* ---------- Icons ---------- */

type IconProps = { className?: string };

function CloseIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Sparkle({ style }: { style: CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className="pointer-events-none absolute" style={style} fill="none">
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * Math.PI) / 6;
        const inner = 6;
        const outer = i % 2 ? 13 : 18;
        return (
          <g key={i}>
            <line
              x1={(20 + Math.cos(angle) * inner).toFixed(2)}
              y1={(20 + Math.sin(angle) * inner).toFixed(2)}
              x2={(20 + Math.cos(angle) * outer).toFixed(2)}
              y2={(20 + Math.sin(angle) * outer).toFixed(2)}
              stroke={i % 2 ? "#E9A232" : "#D9801C"}
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle
              cx={(20 + Math.cos(angle) * (outer + 2)).toFixed(2)}
              cy={(20 + Math.sin(angle) * (outer + 2)).toFixed(2)}
              r="0.8"
              fill="#E39424"
            />
          </g>
        );
      })}
      <circle cx="20" cy="20" r="1.8" fill="#E9A232" />
    </svg>
  );
}

function Ornament({ className }: IconProps) {
  return (
    <svg viewBox="0 0 150 21" className={className} fill="none" aria-hidden="true">
      <path d="M4 14h50M96 14h50" stroke="#E0662A" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M54 14l3.2-2.4 3.2 2.4-3.2 2.4ZM89.6 14l3.2-2.4 3.2 2.4-3.2 2.4Z" fill="#E0662A" />
      <g
        transform="translate(75 10.5) scale(1.35) translate(-62 -8.2)"
        stroke="#E0662A"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M62 1.5c2.2 1.9 2.2 5.4 0 7.5-2.2-2.1-2.2-5.6 0-7.5Z" />
        <path d="M62 11.5c-1.8-2.6-5.4-4.2-7.9-2.6-2 1.3-1.6 4.4.7 4.8 1.6.3 2.7-1.2 1.9-2.4-.6-.8-1.7-.6-1.8.3" />
        <path d="M62 11.5c1.8-2.6 5.4-4.2 7.9-2.6 2 1.3 1.6 4.4-.7 4.8-1.6.3-2.7-1.2-1.9-2.4.6-.8 1.7-.6 1.8.3" />      </g>
    </svg>
  );
}

function CardMandala({ className }: IconProps) {
  const petal = (inner: number, outer: number, width: number) =>
    `M60 ${60 - inner}C${60 + width} ${60 - inner - (outer - inner) * 0.35} ${60 + width * 0.5} ${60 - outer * 0.9} 60 ${60 - outer}C${60 - width * 0.5} ${60 - outer * 0.9} ${60 - width} ${60 - inner - (outer - inner) * 0.35} 60 ${60 - inner}Z`;
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" aria-hidden="true">
      <g stroke="#DD8A30" strokeWidth="1.1" strokeLinejoin="round">
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`o${i}`} d={petal(30, 54, 11)} transform={`rotate(${i * 30 + 15} 60 60)`} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`m${i}`} d={petal(17, 40, 9)} transform={`rotate(${i * 30} 60 60)`} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={`l${i}`} d={petal(21, 34, 3.5)} transform={`rotate(${i * 30} 60 60)`} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`i${i}`} d={petal(7, 17, 5.5)} transform={`rotate(${i * 45} 60 60)`} />
        ))}
        <circle cx="60" cy="60" r="20" />
        <circle cx="60" cy="60" r="6" />
      </g>
      <g fill="#DD8A30">
        <circle cx="60" cy="60" r="2.4" />
        {Array.from({ length: 12 }, (_, i) => {
          const angle = ((i * 30 + 15) * Math.PI) / 180;
          return (
            <circle
              key={`d${i}`}
              cx={(60 + Math.sin(angle) * 57.5).toFixed(2)}
              cy={(60 - Math.cos(angle) * 57.5).toFixed(2)}
              r="1.3"
            />
          );
        })}
      </g>
    </svg>
  );
}

function Leaves({ className }: IconProps) {
  return (
    <svg viewBox="0 0 34 60" className={className} aria-hidden="true">
      <path d="M8 58C4 40 8 22 26 6c4 18-2 38-18 52Z" fill="#4F8A3A" />
      <path d="M8 58C12 40 18 24 26 6" stroke="#79B055" strokeWidth="1.2" fill="none" />
      <path d="M6 58C-2 46-2 34 4 24c8 10 8 24 2 34Z" fill="#3E7A30" />
    </svg>
  );
}

function CrossCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#E5533D" />
      <path d="M8.2 8.2l7.6 7.6M15.8 8.2l-7.6 7.6" stroke="white" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircle({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#2FAE4E" />
      <path d="M7 12.4l3.2 3.1L17 8.8" fill="none" stroke="white" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Petal({ style }: { style: CSSProperties }) {
  return (
    <svg viewBox="0 0 20 12" aria-hidden="true" className="pointer-events-none absolute h-[12px] w-[20px]" style={style}>
      <path d="M1 6C4 1 12-.5 19 3c-4 6.5-12 8-18 3Z" fill="#F08A2E" />
      <path d="M2.5 6C7 5 12 4.2 17.5 3.4" stroke="#FBB55E" strokeWidth="0.9" fill="none" />
    </svg>
  );
}

const MARIGOLD_RINGS = [
  { radius: 7.4, count: 12, offset: 0, rx: 3.4, ry: 2.8, fill: "#F38E26", stroke: "#D8721A" },
  { radius: 4.6, count: 10, offset: 15, rx: 2.9, ry: 2.4, fill: "#FAB437", stroke: "#E4902A" },
  { radius: 2.2, count: 7, offset: 8, rx: 2.2, ry: 1.9, fill: "#FFD258", stroke: "#F0A836" },
];

function Marigold({ style }: { style: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 20"
      aria-hidden="true"
      className="pointer-events-none absolute drop-shadow-[0_2px_2px_rgba(150,80,20,0.3)]"
      style={style}
    >
      <g transform="translate(12 10.5) scale(1 0.78)">
        {MARIGOLD_RINGS.map((ring) =>
          Array.from({ length: ring.count }, (_, i) => {
            const angle = (i * 360) / ring.count + ring.offset;
            return (
              <ellipse
                key={`${ring.radius}-${i}`}
                cx="0"
                cy={-ring.radius}
                rx={ring.rx}
                ry={ring.ry}
                fill={ring.fill}
                stroke={ring.stroke}
                strokeWidth="0.5"
                transform={`rotate(${angle})`}
              />
            );
          }),
        )}
        <circle r="1.6" fill="#FFDB72" />
      </g>
    </svg>
  );
}

const VERDICTS = {
  correct: {
    label: "Right Answer!",
    color: "#2FAE4E",
    pill: "border-[rgba(190,240,180,0.8)] bg-gradient-to-b from-[#4CC765] via-[#2FAE4E] to-[#23933F] shadow-[0_12px_28px_rgba(40,150,70,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]",
  },
  wrong: {
    label: "Wrong Answer",
    color: "#E5533D",
    pill: "border-[rgba(255,190,175,0.8)] bg-gradient-to-b from-[#F0705A] via-[#E5533D] to-[#C93E2A] shadow-[0_12px_28px_rgba(200,60,40,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]",
  },
  timeout: {
    label: "Time's Up!",
    color: "#D9801C",
    pill: "border-[rgba(255,220,160,0.8)] bg-gradient-to-b from-[#F5AE45] via-[#E8942A] to-[#D07A18] shadow-[0_12px_28px_rgba(200,120,30,0.4),inset_0_1px_0_rgba(255,255,255,0.35)]",
  },
};

function AnswerVerdict({ verdict }: { verdict: keyof typeof VERDICTS }) {
  const { label, color, pill } = VERDICTS[verdict];
  return (
    <p
      className={`verdict-in flex h-[60px] min-w-0 flex-1 items-center justify-center gap-[12px] rounded-full border-[1.5px] text-[20px] font-bold whitespace-nowrap text-white ${pill}`}
    >
      <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-white">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          {verdict === "correct" && (
            <path d="M6 12.5l4 4 8-9" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {verdict === "wrong" && <path d="M7 7l10 10M17 7L7 17" stroke={color} strokeWidth="3" strokeLinecap="round" />}
          {verdict === "timeout" && <ClockGlyph color={color} />}
        </svg>
      </span>
      {label}
    </p>
  );
}

function ArrowIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockGlyph({ color }: { color: string }) {
  return (
    <>
      <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2.4" />
      <path d="M12 7.5V12l3 2" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function QuestionTimer({ seconds }: { seconds: number }) {
  const urgent = seconds <= 5;
  return (
    <p
      aria-label={`${seconds} seconds left`}
      className={`flex h-[26px] items-center gap-[5px] rounded-full border px-[10px] text-[13.5px] leading-none font-bold tabular-nums transition-colors duration-300 ${
        urgent
          ? "border-[#F3B0A4] bg-[#FDE4DF] text-[#D23E28]"
          : "border-[#F2C9A0] bg-[rgba(255,255,255,0.7)] text-[#B5531B]"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" aria-hidden="true">
        <ClockGlyph color="currentColor" />
      </svg>
      0:{String(Math.max(seconds, 0)).padStart(2, "0")}
    </p>
  );
}
