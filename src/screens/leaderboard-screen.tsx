"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import { useI18n } from "@/components/language-provider";
import { postToNative } from "@/lib/native-bridge";

const CARD_GAP = 10;

type FinalWinner = {
  rank: number;
  name: string;
  title: string;
  prize: string;
};

/** Final prize list — order and ranks match the announced winners sheet. */
const FINAL_WINNERS: FinalWinner[] = [
  { rank: 1, name: "Nikunj Chourasiya", title: "First Winner", prize: "₹11,000" },
  { rank: 2, name: "Harshal Saraf", title: "Second Winner", prize: "₹6,000" },
  { rank: 3, name: "Abhishek Sisodiya", title: "Third Winner", prize: "₹2,000" },
  { rank: 4, name: "Shivee Kourav", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 5, name: "Neeraj Thakur", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 6, name: "Priyanka Nagre", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 7, name: "Mohd Irfan", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 8, name: "Sudhanshu Sharma", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 9, name: "Rachit Sohni", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 10, name: "Harishankar Birla", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 11, name: "Amit Tiwari", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 12, name: "Abhishek Kumar", title: "Daily Wise Winner", prize: "₹1,000" },
  { rank: 14, name: "Ashu Chaudhary", title: "Consolidated Winner", prize: "₹500" },
  { rank: 15, name: "Ramit Kumar", title: "Consolidated Winner", prize: "₹500" },
  { rank: 16, name: "Anshu Dixit", title: "Consolidated Winner", prize: "₹500" },
  { rank: 17, name: "Pankaj Malik", title: "Consolidated Winner", prize: "₹500" },
  { rank: 18, name: "Azhar Azhar", title: "Consolidated Winner", prize: "₹500" },
];

const BURSTS: { key: string; tone: "red" | "gold"; style: CSSProperties }[] = [
  { key: "a", tone: "red", style: { top: 10, left: 46, width: 28, height: 28 } },
  { key: "b", tone: "gold", style: { top: 8, right: 108, width: 24, height: 24 } },
];

const CONFETTI: { key: string; style: CSSProperties }[] = [
  { key: "c1", style: { top: 18, left: 88, background: "#E8913C", transform: "rotate(28deg)" } },
  { key: "c3", style: { top: 14, right: 92, background: "#E8B23C", transform: "rotate(16deg)" } },
];

export function LeaderboardScreen() {
  const { t } = useI18n();
  const listRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const parent = list?.parentElement;
    if (!list || !parent) return;

    const fitFullCards = () => {
      list.style.flex = "1 1 auto";
      list.style.maxHeight = "none";
      list.style.height = "auto";
      const available = list.clientHeight;
      const first = list.querySelector("li");
      const cardH = first instanceof HTMLElement ? first.offsetHeight : 86;
      const slot = cardH + CARD_GAP;
      const count = Math.max(1, Math.floor((available + CARD_GAP) / slot));
      const used = count * cardH + (count - 1) * CARD_GAP;
      list.style.flex = `0 0 ${used}px`;
      list.style.maxHeight = `${used}px`;
      list.style.height = `${used}px`;
    };

    fitFullCards();
    const ro = new ResizeObserver(fitFullCards);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="question-in relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#FDF1E3] text-[#141B36]">
      {BURSTS.map((b) => (
        <FireworkBurst key={b.key} tone={b.tone} style={b.style} />
      ))}
      {CONFETTI.map((c) => (
        <span
          key={c.key}
          aria-hidden="true"
          className="pointer-events-none absolute h-[5px] w-[9px] rounded-[1px] opacity-75"
          style={c.style}
        />
      ))}
      <HangingDiya className="absolute top-[-18px] left-[6px] h-[52px] w-[24px]" />
      <HangingDiya className="absolute top-[-16px] right-[8px] h-[56px] w-[26px]" />
      <StringLights className="absolute top-0 left-0 h-[28px] w-full" />

      <nav className="relative z-10 grid shrink-0 grid-cols-[40px_1fr_40px] items-center px-[12px] pt-[max(clamp(22px,calc(8dvh-32px),42px),calc(env(safe-area-inset-top)+8px))] pb-[8px]">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => postToNative({ type: "QUIZ_CLOSE" })}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-gradient-to-b from-[#F9B97F] to-[#F29A58] text-[#1C2447] shadow-[0_4px_12px_rgba(230,120,50,0.30)] active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="min-w-0 text-center">
          <h1 className="font-display text-[20px] leading-[24px] font-extrabold tracking-[-0.01em]">{t("title").replace("!", "")}</h1>
        </div>
        <span />
      </nav>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-[14px] pt-[2px]">
          <div className="shrink-0 px-[8px] pt-[12px] pb-[22px] text-center">
            <p className="flex items-center justify-center gap-[8px] text-[20px] leading-[24px] font-black text-[#C45A12]">
              <img src="/quiz/trophy-gold.png" alt="" className="h-[24px] w-[24px] object-contain" />
              Final Winners
              <Sparkles />
            </p>
            <p className="mt-[8px] text-[14px] leading-[18px] font-semibold text-[#6B5344]">Prize distribution as announced</p>
          </div>

          <ul
            ref={listRef}
            className="mt-[14px] flex min-h-0 flex-1 snap-y snap-mandatory flex-col gap-[10px] overflow-y-auto overscroll-contain px-px pt-[10px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {FINAL_WINNERS.map((winner) => (
              <FinalWinnerCard key={winner.rank} winner={winner} />
            ))}
          </ul>
        </div>
        <div className="relative mt-auto w-full shrink-0 bg-[#FDF1E3] pb-[calc(clamp(12px,2.6dvh,26px)+env(safe-area-inset-bottom))]">
          <WinnersFooter />
        </div>
      </div>
    </div>
  );
}

function FinalWinnerCard({ winner }: { winner: FinalWinner }) {
  const medal: MedalKind = winner.rank === 1 ? "gold" : winner.rank === 2 ? "silver" : winner.rank === 3 ? "bronze" : "rest";
  const featured = winner.rank <= 3;
  return (
    <li
      className={`relative flex h-[86px] shrink-0 snap-start list-none items-center gap-[8px] overflow-hidden rounded-[18px] border px-[10px] py-[10px] ${
        featured
          ? "border-[#F0D48A] bg-[linear-gradient(180deg,#FFF8DC_0%,#FFF3C8_100%)] shadow-[0_6px_16px_rgba(200,140,40,0.12)]"
          : "border-[#F0E4D2] bg-white shadow-[0_4px_12px_rgba(175,95,35,0.08)]"
      }`}
    >
      {featured ? <span className="absolute top-[12px] bottom-[12px] left-0 w-[3px] rounded-full bg-[#E8B83A]" /> : null}
      <PrizeMedal place={String(winner.rank)} medal={medal} size="rank" />
      <PotatoAvatar />
      <span className="min-w-0 flex-1 pr-[2px]">
        <WinnerName name={winner.name} />
        <span className="mt-[2px] block text-[12px] leading-[15px] text-[#8E8E98]">{winner.title}</span>
      </span>
      <WinnerWreath prize={winner.prize} />
    </li>
  );
}

const MEDAL_PALETTE = {
  gold: {
    light: "#FFF7CF",
    mid: "#F3C44A",
    dark: "#C07A12",
    rim: "#E8B83A",
    text: "#6B4308",
    ribbonL: "#EE4E3C",
    ribbonR: "#C42C22",
  },
  silver: {
    light: "#FFFFFF",
    mid: "#D5DCE4",
    dark: "#8A96A4",
    rim: "#C5CDD6",
    text: "#3A4450",
    ribbonL: "#EE4E3C",
    ribbonR: "#C42C22",
  },
  bronze: {
    light: "#F8D4AA",
    mid: "#D89048",
    dark: "#A45A1E",
    rim: "#C97A38",
    text: "#5A2C0A",
    ribbonL: "#EE4E3C",
    ribbonR: "#C42C22",
  },
  rest: {
    light: "#FFE0B0",
    mid: "#F08A32",
    dark: "#C25410",
    rim: "#E07828",
    text: "#5C2808",
    ribbonL: "#EE4E3C",
    ribbonR: "#C42C22",
  },
} as const;

type MedalKind = keyof typeof MEDAL_PALETTE;

function PrizeMedal({
  place,
  medal,
  size = "prize",
}: {
  place: string;
  medal: MedalKind;
  size?: "prize" | "rank";
}) {
  const p = MEDAL_PALETTE[medal];
  const uid = `${size}-${place.replace("+", "p")}`;
  const box = size === "prize" ? "h-[42px] w-[35px]" : "h-[40px] w-[34px]";
  return (
    <svg viewBox="0 0 40 48" className={`${box} shrink-0 drop-shadow-[0_3px_4px_rgba(120,50,10,0.28)]`} aria-hidden="true">
      <defs>
        <linearGradient id={`m-${uid}-face`} x1="0.28" y1="0.12" x2="0.82" y2="1">
          <stop offset="0" stopColor={p.light} />
          <stop offset="0.48" stopColor={p.mid} />
          <stop offset="1" stopColor={p.dark} />
        </linearGradient>
        <linearGradient id={`m-${uid}-rib`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.ribbonL} />
          <stop offset="1" stopColor={p.ribbonR} />
        </linearGradient>
      </defs>
      <path d="M11 1h7l3.2 14-8.2 2.4L11 1Z" fill={`url(#m-${uid}-rib)`} />
      <path d="M29 1h-7l-3.2 14 8.2 2.4L29 1Z" fill={p.ribbonR} />
      <path d="M16.4 1h7.2l-1.4 13.6h-4.4L16.4 1Z" fill="#F36A4A" opacity="0.55" />
      <circle cx="20" cy="30" r="16.4" fill={`url(#m-${uid}-face)`} />
      <circle cx="20" cy="30" r="16.4" fill="none" stroke={p.rim} strokeWidth="1.4" />
      <circle cx="20" cy="30" r="13.2" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />
      <ellipse cx="14.5" cy="24.2" rx="6.4" ry="3.6" fill="rgba(255,255,255,0.42)" />
      <text
        x="20"
        y={place.length > 1 ? 34.4 : 35.2}
        textAnchor="middle"
        fill={p.text}
        fontSize={place.length > 1 ? 11 : 13.5}
        fontWeight="800"
        fontFamily="var(--font-lato), system-ui, sans-serif"
      >
        {place}
      </text>
    </svg>
  );
}

function WinnerName({ name }: { name: string }) {
  const aliasStart = name.indexOf(" (");
  if (aliasStart > 0) {
    return (
      <span className="block text-[14px] leading-[17px] font-extrabold text-[#1C2447]">
        <span className="block">{name.slice(0, aliasStart)}</span>
        <span className="block text-[12px] leading-[15px] font-bold">{name.slice(aliasStart + 1)}</span>
      </span>
    );
  }
  return <span className="block text-[15px] leading-[18px] font-extrabold text-[#1C2447]">{name}</span>;
}

function WinnerWreath({ prize }: { prize: string }) {
  const compact = prize.length > 6;
  return (
    <span className="relative h-[64px] w-[64px] shrink-0">
      <img
        src="/quiz/winner-wreath.png?v=5"
        alt=""
        width={64}
        height={64}
        className="h-[64px] w-[64px] object-contain"
        aria-hidden="true"
      />
      <span className="pointer-events-none absolute top-[30%] right-[12px] left-[12px] flex flex-col items-center">
        <span
          className={`leading-none font-black tracking-[-0.05em] text-[#6B1E12] ${
            compact ? "text-[10px]" : "text-[12px]"
          }`}
        >
          {prize}
        </span>
        <span className="mt-[4px] text-[9px] leading-none font-extrabold tracking-[0.01em] text-[#8A3A14]">
          Winner
        </span>
      </span>
    </span>
  );
}

function PotatoAvatar() {
  return (
    <span className="flex h-[42px] w-[42px] shrink-0 overflow-hidden rounded-full shadow-[0_2px_6px_rgba(150,85,30,0.24)]">
      <img
        src="/quiz/potato-avatar.png"
        alt=""
        draggable={false}
        className="h-full w-full object-cover object-center select-none"
      />
    </span>
  );
}

function Sparkles() {
  return (
    <svg viewBox="0 0 18 16" className="h-[16px] w-[18px]" aria-hidden="true">
      <path d="M6.2 1.2l.9 2.4 2.4.9-2.4.9-.9 2.4-.9-2.4-2.4-.9 2.4-.9Z" fill="#F0C24A" />
      <path d="M13.4 6.2l.7 1.7 1.7.6-1.7.6-.7 1.7-.6-1.7-1.7-.6 1.7-.6Z" fill="#E8A83A" />
    </svg>
  );
}

const PLAQUE_PATH =
  "M92 50H140C154 50 156 38 172 38H218C234 38 236 50 250 50H298C310 50 316 54 320 62C323 68 328 70 334 71C344 72 350 80 350 92V132C350 150 340 160 322 160H68C50 160 40 150 40 132V92C40 80 46 72 56 71C62 70 67 68 70 62C74 54 80 50 92 50Z";

function WinnersFooter() {
  return (
    <svg viewBox="0 0 390 180" className="block h-auto w-full" role="img" aria-label="Winners Announced! Congratulations to all our Diwali Quiz winners!">
      <defs>
        <radialGradient id="wf-plaque" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#7C2A3E" />
          <stop offset="0.55" stopColor="#651D31" />
          <stop offset="1" stopColor="#4A1323" />
        </radialGradient>
        <linearGradient id="wf-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F9DF9A" />
          <stop offset="0.45" stopColor="#E2A93B" />
          <stop offset="1" stopColor="#F3CF7A" />
        </linearGradient>
        <radialGradient id="wf-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
        <clipPath id="wf-clip">
          <path d={PLAQUE_PATH} />
        </clipPath>
      </defs>

      <FooterBurst cx={46} cy={36} r={24} colours={["#E8A63A", "#F0C668"]} />
      <FooterBurst cx={328} cy={26} r={22} colours={["#E2553A", "#F0913C"]} />
      <FooterBurst cx={358} cy={60} r={12} colours={["#F0913C", "#F0C668"]} />

      {/* soft ground shadow */}
      <ellipse cx="195" cy="165" rx="165" ry="7" fill="#C98A4A" opacity="0.18" />

      {/* plaque */}
      <path d={PLAQUE_PATH} fill="url(#wf-plaque)" />
      <g clipPath="url(#wf-clip)" fill="none" strokeLinejoin="round">
        <path d={PLAQUE_PATH} stroke="url(#wf-gold)" strokeWidth="6.4" />
      </g>

      {/* top diya with glow rays */}
      <circle cx="195" cy="20" r="26" fill="url(#wf-glow)" />
      {Array.from({ length: 9 }, (_, i) => {
        const angle = Math.PI + (i * Math.PI) / 8;
        return (
          <line
            key={i}
            x1={(195 + Math.cos(angle) * 17).toFixed(2)}
            y1={(22 + Math.sin(angle) * 17).toFixed(2)}
            x2={(195 + Math.cos(angle) * (i % 2 ? 23 : 27)).toFixed(2)}
            y2={(22 + Math.sin(angle) * (i % 2 ? 23 : 27)).toFixed(2)}
            stroke="#F2C766"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.8"
          />
        );
      })}
      <image href="/quiz/diya-copper.png" x="170" y="2" width="50" height="56" />

      {/* heading */}
      <Laurel x={80} y={74} />
      <Laurel x={310} y={74} flip />
      <text
        x="195"
        y="89"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="17"
        fontWeight="900"
        fontFamily="var(--font-lato), system-ui, sans-serif"
      >
        <tspan fontSize="13">🎉</tspan>
        <tspan dx="2">Winners Announced!</tspan>
      </text>
      <text
        textAnchor="middle"
        fill="#FBEBD8"
        fontSize="13.5"
        fontWeight="600"
        fontFamily="var(--font-lato), system-ui, sans-serif"
      >
        <tspan x="195" y="111">Congratulations to all our</tspan>
        <tspan x="195" y="128">Diwali Quiz winners!</tspan>
      </text>

      {/* divider */}
      <path d="M140 143H184M206 143H250" stroke="#E9B649" strokeWidth="1" strokeLinecap="round" />
      <path d="M195 139.5l3.5 3.5-3.5 3.5-3.5-3.5Z" fill="#E9B649" />
      <circle cx="187.5" cy="143" r="1.2" fill="#E9B649" />
      <circle cx="202.5" cy="143" r="1.2" fill="#E9B649" />

      {/* diyas */}
      <ellipse cx="52" cy="168" rx="38" ry="4.5" fill="#B9773A" opacity="0.22" />
      <circle cx="38" cy="126" r="13" fill="url(#wf-glow)" opacity="0.8" />
      <circle cx="66" cy="132" r="14" fill="url(#wf-glow)" opacity="0.8" />
      <image href="/quiz/diya-round.png" x="18" y="120" width="40" height="43" />
      <image href="/quiz/diya-round.png" x="44" y="124" width="44" height="47" />

      {/* gifts */}
      <ellipse cx="332" cy="169" rx="40" ry="4.5" fill="#B9773A" opacity="0.22" />
      <image href="/quiz/prize-gift.png" x="334" y="118" width="34" height="40" />
      <image href="/quiz/prize-gift.png" x="294" y="114" width="48" height="56" />
    </svg>
  );
}

function Laurel({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  // "(" shaped branch drawn in a 16x40 box; flipped horizontally for the right side.
  const leaves = Array.from({ length: 6 }, (_, i) => {
    const angle = ((122 + i * 23) * Math.PI) / 180;
    const px = 24 + Math.cos(angle) * 20;
    const py = 20 - Math.sin(angle) * 20;
    const tangent = 90 - (122 + i * 23);
    return { px, py, tangent };
  });
  return (
    <g transform={flip ? `translate(${x} ${y}) scale(-1 1)` : `translate(${x} ${y})`} fill="#E3B24A">
      <path d="M13.4 3A20 20 0 0 0 13.4 37" fill="none" stroke="#E3B24A" strokeWidth="1.1" strokeLinecap="round" />
      {leaves.map(({ px, py, tangent }, i) => (
        <g key={i} transform={`translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${tangent})`}>
          <ellipse cx="3.6" cy="-2.2" rx="4" ry="1.7" transform="rotate(-32)" />
          <ellipse cx="3.6" cy="2.2" rx="4" ry="1.7" transform="rotate(32)" />
        </g>
      ))}
    </g>
  );
}

function FooterBurst({ cx, cy, r, colours }: { cx: number; cy: number; r: number; colours: [string, string] }) {
  return (
    <g opacity="0.85">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * Math.PI) / 8;
        const inner = r * (i % 2 ? 0.36 : 0.26);
        const outer = r * (i % 2 ? 0.72 : 1);
        return (
          <line
            key={i}
            x1={(cx + Math.cos(angle) * inner).toFixed(2)}
            y1={(cy + Math.sin(angle) * inner).toFixed(2)}
            x2={(cx + Math.cos(angle) * outer).toFixed(2)}
            y2={(cy + Math.sin(angle) * outer).toFixed(2)}
            stroke={colours[i % 2]}
            strokeWidth={Math.max(1, r / 16)}
            strokeLinecap="round"
          />
        );
      })}
    </g>
  );
}

function FireworkBurst({ style, tone }: { style: CSSProperties; tone: "red" | "gold" }) {
  const colours = tone === "red" ? ["#E2553A", "#F0913C"] : ["#F0B64A", "#EBC97C"];
  return (
    <svg viewBox="0 0 48 48" className="pointer-events-none absolute opacity-55" style={style} fill="none" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i * Math.PI) / 8;
        const inner = i % 2 ? 7 : 5;
        const outer = i % 2 ? 15 : 21;
        return (
          <line
            key={i}
            x1={(24 + Math.cos(angle) * inner).toFixed(2)}
            y1={(24 + Math.sin(angle) * inner).toFixed(2)}
            x2={(24 + Math.cos(angle) * outer).toFixed(2)}
            y2={(24 + Math.sin(angle) * outer).toFixed(2)}
            stroke={colours[i % 2]}
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function StringLights({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 390 54" className={`pointer-events-none ${className}`} aria-hidden="true" fill="none" preserveAspectRatio="none">
      <path d="M8 6C70 28 130 4 195 18S320 36 382 8" stroke="#E7B56A" strokeWidth="1.2" />
      {[
        [48, 16],
        [92, 22],
        [138, 12],
        [184, 18],
        [230, 24],
        [276, 20],
        [322, 14],
        [360, 10],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="3.2" fill="#FFE08A" />
          <circle cx={x} cy={y} r="6" fill="#FFD56A" opacity="0.28" />
        </g>
      ))}
    </svg>
  );
}

function HangingDiya({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 98" className={`pointer-events-none ${className}`} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="lb-lamp" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F7D184" />
          <stop offset="0.45" stopColor="#E9A93F" />
          <stop offset="1" stopColor="#C98320" />
        </linearGradient>
      </defs>
      <path d="M15 0v46" stroke="#E2C089" strokeWidth="1.2" />
      <circle cx="15" cy="47" r="2.6" fill="url(#lb-lamp)" />
      <path d="M3 56h24c0 7.2-5.4 12-12 12S3 63.2 3 56Z" fill="url(#lb-lamp)" />
      <ellipse cx="15" cy="56" rx="12" ry="2.6" fill="#F9DCA0" />
      <path d="M15 50c1.6 2 2.4 3.4 2.4 4.6a2.4 2.4 0 0 1-4.8 0c0-1.2.8-2.6 2.4-4.6Z" fill="#FBC24A" />
      <path d="M11 68h8l-4 10-4-10Z" fill="url(#lb-lamp)" />
      <circle cx="15" cy="80" r="2" fill="#E9A93F" />
    </svg>
  );
}
