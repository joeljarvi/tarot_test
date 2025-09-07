import clsx from "clsx";

interface PatternProps {
  className?: string;
  color1?: string; // e.g., "bg-green-800"
  color2?: string; // e.g., "bg-red-800"
  borderColor1?: string; // e.g., "border-green-800"
  borderColor2?: string; // e.g., "border-red-800"
  bgColor?: string; // e.g., "bg-red-800"
}

export default function Pattern({
  className,
  color1 = "bg-red-600",
  color2 = "bg-purple-500",
  borderColor1 = "border-red-800",
  borderColor2 = "border-yellow-200",
  bgColor = "bg-neutral-800",
}: PatternProps) {
  const cols = 8;
  const rows = 16;
  const totalSquares = cols * rows;
  const squares = Array.from({ length: totalSquares });

  return (
    <div
      className={clsx(
        "relative w-full h-full rounded-md overflow-hidden",
        bgColor,
        className
      )}
    >
      {/* Bottom Grid */}
      <div
        className="absolute inset-0 grid gap-1 lg:gap-2 z-0"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
      >
        {squares.map((_, index) => (
          <div
            key={index}
            className={clsx("aspect-square", index % 3 === 0 ? color1 : color2)}
          />
        ))}
      </div>

      {/* Top Grid */}
      <div
        className="absolute inset-0 grid gap-1 lg:gap-2 z-10 mix-blend-multiply"
        style={{
          gridTemplateColumns: `repeat(16, 1fr)`,
          gridTemplateRows: `repeat(32, 1fr)`,
        }}
      >
        {Array.from({ length: 16 * 32 }).map((_, index) => (
          <div
            key={index}
            className={clsx("aspect-square", index % 2 === 0 ? color1 : color2)}
          />
        ))}
      </div>

      {/* Border Grid X */}
      <div
        className="absolute inset-0 grid gap-1 lg:gap-2 z-20 mix-blend-multiply"
        style={{
          gridTemplateColumns: `repeat(8, 1fr)`,
          gridTemplateRows: `repeat(8, 1fr)`,
        }}
      >
        {Array.from({ length: 16 * 32 }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              "aspect-square border-x-8 lg:border-x-16", // Tailwind border width
              index % 2 === 0 ? borderColor1 : borderColor2
            )}
          />
        ))}
      </div>

      {/* Border Grid Y */}
      <div
        className="absolute inset-0 grid gap-1 lg:gap-2 z-30 mix-blend-multiply"
        style={{
          gridTemplateColumns: `repeat(8, 1fr)`,
          gridTemplateRows: `repeat(8, 1fr)`,
        }}
      >
        {Array.from({ length: 16 * 24 }).map((_, index) => (
          <div
            key={index}
            className={clsx(
              "aspect-square bg-transparent border-y-8 lg:border-y-16 ",
              index % 3 === 0 ? borderColor2 : borderColor1
            )}
          />
        ))}
      </div>
      <div className="absolute inset-0 z-40 backdrop-blur-sm"></div>
    </div>
  );
}
