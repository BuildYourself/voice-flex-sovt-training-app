import { cn } from "@/lib/utils";

type VisualProps = {
  className?: string;
};

export function VoiceFlexWavePattern({ className }: VisualProps) {
  return (
    <svg className={cn("pointer-events-none", className)} viewBox="0 0 620 300" fill="none" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
        <path
          d={`M${12 + index * 9} ${36 + index * 23} C 210 ${-12 + index * 27}, 374 ${78 + index * 11}, 620 ${24 + index * 23}`}
          key={index}
          stroke="url(#vf-wave-stroke)"
          strokeOpacity={0.44 - index * 0.025}
          strokeWidth="1.4"
        />
      ))}
      <defs>
        <linearGradient id="vf-wave-stroke" x1="12" x2="620" y1="36" y2="246" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C7DDFF" />
          <stop offset="0.55" stopColor="#BFD0FF" />
          <stop offset="1" stopColor="#E9D5FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function VoiceFlexRocket({ className }: VisualProps) {
  return (
    <svg className={cn("drop-shadow-[0_26px_28px_rgba(79,70,229,0.26)]", className)} viewBox="0 0 180 180" fill="none" aria-hidden="true">
      <ellipse cx="94" cy="151" rx="45" ry="10" fill="#1E40AF" opacity="0.1" />
      <path d="M105 20 C132 25 153 46 158 73 C137 81 118 98 99 126 L66 93 C79 66 91 42 105 20Z" fill="url(#vf-rocket-body)" />
      <path d="M69 91 L36 101 L56 120" fill="url(#vf-rocket-wing-left)" />
      <path d="M98 123 L88 158 L70 138" fill="url(#vf-rocket-wing-right)" />
      <circle cx="119" cy="63" r="17" fill="#DDE7FF" />
      <circle cx="119" cy="63" r="9" fill="#6D5DFB" />
      <path d="M63 126 C49 131 36 143 29 160 C46 153 60 142 69 130" fill="#F59E0B" />
      <path d="M55 120 C39 122 25 129 14 143 C34 141 50 134 61 125" fill="#8B5CF6" opacity="0.78" />
      <path d="M142 32 C149 37 154 44 157 53" stroke="#F8FBFF" strokeLinecap="round" strokeWidth="8" />
      <circle cx="36" cy="45" r="3" fill="#38BDF8" />
      <circle cx="150" cy="112" r="3" fill="#8B5CF6" />
      <path d="M28 76 H38 M33 71 V81" stroke="#F59E0B" strokeLinecap="round" strokeWidth="3" />
      <path d="M146 128 H158 M152 122 V134" stroke="#145FF2" strokeLinecap="round" strokeWidth="3" />
      <defs>
        <linearGradient id="vf-rocket-body" x1="66" x2="160" y1="126" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#145FF2" />
          <stop offset="0.55" stopColor="#5B6CFF" />
          <stop offset="1" stopColor="#B794F6" />
        </linearGradient>
        <linearGradient id="vf-rocket-wing-left" x1="36" x2="69" y1="120" y2="91" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <linearGradient id="vf-rocket-wing-right" x1="70" x2="98" y1="158" y2="123" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function VoiceFlexTrophy({ className }: VisualProps) {
  return (
    <svg className={cn("drop-shadow-[0_16px_20px_rgba(79,70,229,0.18)]", className)} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <circle cx="60" cy="60" r="48" fill="url(#vf-trophy-glow)" />
      <path d="M39 30 H81 V55 C81 68 72 77 60 77 C48 77 39 68 39 55 V30Z" fill="url(#vf-trophy-cup)" />
      <path d="M40 38 H27 C28 56 35 64 45 65" stroke="#60A5FA" strokeWidth="8" strokeLinecap="round" />
      <path d="M80 38 H93 C92 56 85 64 75 65" stroke="#8B5CF6" strokeWidth="8" strokeLinecap="round" />
      <path d="M53 77 H67 V91 H53V77Z" fill="#2563EB" />
      <path d="M42 94 H78 V101 H42V94Z" fill="#1D4ED8" />
      <path d="M60 41 L65 51 L76 53 L68 61 L70 72 L60 67 L50 72 L52 61 L44 53 L55 51 L60 41Z" fill="#FFFFFF" opacity="0.92" />
      <defs>
        <linearGradient id="vf-trophy-cup" x1="39" x2="82" y1="77" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#145FF2" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
        <radialGradient id="vf-trophy-glow" cx="0" cy="0" r="1" gradientTransform="translate(60 60) rotate(90) scale(48)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EAF2FF" />
          <stop offset="1" stopColor="#EEF2FF" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function VoiceFlexBadge({ className }: VisualProps) {
  return (
    <svg className={cn("drop-shadow-[0_14px_18px_rgba(24,191,133,0.22)]", className)} viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <circle cx="48" cy="48" r="32" fill="#DDFBEF" />
      <circle cx="48" cy="48" r="24" fill="url(#vf-badge-fill)" />
      <path d="M36 48 L44 56 L61 39" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
      <path d="M36 70 L31 86 L48 78 L65 86 L60 70" fill="#18BF85" opacity="0.78" />
      <circle cx="22" cy="28" r="2" fill="#F59E0B" />
      <circle cx="76" cy="24" r="2" fill="#145FF2" />
      <circle cx="77" cy="66" r="2" fill="#8B5CF6" />
      <defs>
        <linearGradient id="vf-badge-fill" x1="28" x2="70" y1="68" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#18BF85" />
          <stop offset="1" stopColor="#4ADE80" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function VoiceFlexStarPanelIcon({ className }: VisualProps) {
  return (
    <svg className={cn("drop-shadow-[0_14px_22px_rgba(20,95,242,0.24)]", className)} viewBox="0 0 88 88" fill="none" aria-hidden="true">
      <circle cx="44" cy="44" r="35" fill="url(#vf-star-bg)" />
      <path d="M44 24 L50 37 L64 39 L54 49 L56 64 L44 57 L32 64 L34 49 L24 39 L38 37 L44 24Z" fill="white" />
      <circle cx="25" cy="25" r="2" fill="#BFDBFE" />
      <circle cx="66" cy="29" r="2" fill="#DDD6FE" />
      <defs>
        <linearGradient id="vf-star-bg" x1="13" x2="75" y1="75" y2="13" gradientUnits="userSpaceOnUse">
          <stop stopColor="#145FF2" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function VoiceFlexSparkline({ className, tone = "blue" }: VisualProps & { tone?: "blue" | "green" | "purple" | "orange" }) {
  const stroke = {
    blue: "#145ff2",
    green: "#18bf85",
    purple: "#8b5cf6",
    orange: "#f59e0b"
  }[tone];

  return (
    <svg className={cn("pointer-events-none", className)} viewBox="0 0 118 54" fill="none" aria-hidden="true">
      <path d="M4 44 C18 31 29 31 43 35 C59 40 66 23 82 22 C96 21 103 12 114 5" stroke={stroke} strokeLinecap="round" strokeWidth="2.5" />
      <path d="M4 44 C18 31 29 31 43 35 C59 40 66 23 82 22 C96 21 103 12 114 5" stroke={stroke} strokeLinecap="round" strokeWidth="8" opacity="0.09" />
      <circle cx="114" cy="5" r="3" fill={stroke} />
    </svg>
  );
}
