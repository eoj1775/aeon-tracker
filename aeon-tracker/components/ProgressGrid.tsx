interface ProgressGridProps {
  percent: number; // 0-100
  columns?: number;
  rows?: number;
}

// Renders a dense grid of small square dots. Dots up to the current
// percentage are filled in the accent color; the rest stay dim outlines —
// matching the reference mockup's dotted progress field rather than a bar.
export default function ProgressGrid({ percent, columns = 48, rows = 8 }: ProgressGridProps) {
  const total = columns * rows;
  const filled = Math.round((percent / 100) * total);

  const dots = Array.from({ length: total }, (_, i) => i < filled);

  return (
    <div
      className="aeon-progress-grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "3px",
        width: "100%",
      }}
      role="img"
      aria-label={`${percent.toFixed(2)}% complete`}
    >
      {dots.map((isFilled, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "1 / 1",
            borderRadius: "1px",
            background: isFilled ? "var(--aeon-accent)" : "transparent",
            border: isFilled
              ? "1px solid var(--aeon-accent)"
              : "1px solid var(--aeon-border-faint)",
          }}
        />
      ))}
    </div>
  );
}
