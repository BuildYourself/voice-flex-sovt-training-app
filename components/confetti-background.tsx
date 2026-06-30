const confettiPieces = [
  "left-[3%] top-[7%] h-3 w-3 bg-blue-500",
  "left-[7%] top-[20%] h-5 w-2 bg-blue-600",
  "left-[9%] top-[39%] h-3 w-3 bg-amber-300",
  "left-[12%] top-[62%] h-4 w-2 bg-blue-400",
  "left-[17%] top-[11%] h-2.5 w-2.5 bg-amber-400",
  "left-[22%] top-[28%] h-4 w-2 bg-purple-500",
  "left-[28%] top-[4%] h-3 w-3 bg-orange-300",
  "left-[34%] top-[18%] h-2 w-2 bg-amber-200",
  "left-[42%] top-[8%] h-1.5 w-1.5 bg-amber-300",
  "right-[3%] top-[8%] h-5 w-2 bg-blue-500",
  "right-[7%] top-[27%] h-3 w-3 bg-amber-300",
  "right-[11%] top-[50%] h-4 w-2 bg-blue-500",
  "right-[16%] top-[16%] h-4 w-2 bg-orange-400",
  "right-[21%] top-[36%] h-3 w-3 bg-purple-400",
  "right-[26%] top-[6%] h-4 w-2 bg-blue-600",
  "right-[34%] top-[22%] h-2 w-2 bg-blue-400",
  "right-[41%] top-[11%] h-2 w-2 bg-amber-300",
  "left-[5%] top-[78%] h-3 w-3 bg-blue-500",
  "right-[8%] top-[76%] h-3 w-3 bg-purple-500",
  "left-[16%] top-[52%] h-2 w-2 bg-orange-300",
];

export function ConfettiBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <style>{`
        @keyframes voice-flex-confetti-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-16deg); opacity: 0.95; }
          45% { transform: translate3d(8px, 13px, 0) rotate(28deg); opacity: 0.72; }
          70% { transform: translate3d(-5px, 6px, 0) rotate(12deg); opacity: 1; }
        }
        @keyframes voice-flex-confetti-pop {
          0% { transform: scale(0.8) rotate(0deg); opacity: 0; }
          35% { opacity: 1; }
          100% { transform: scale(1) rotate(18deg); opacity: 0.9; }
        }
      `}</style>
      {confettiPieces.map((className, index) => (
        <span
          key={className}
          className={`absolute rounded-[2px] shadow-sm ${className} ${
            index % 3 === 0 ? "rounded-full" : ""
          }`}
          style={{
            animation: `voice-flex-confetti-pop 600ms ease-out both, voice-flex-confetti-float ${
              3.4 + (index % 5) * 0.45
            }s ease-in-out infinite`,
            animationDelay: `${index * 120}ms`,
          }}
        />
      ))}
    </div>
  );
}
