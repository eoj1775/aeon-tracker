// Placeholder orbital mark until the real SPX6900 logo asset is available.
// Deliberately simple — a thin ring + wordmark — so it's easy to tell apart
// from the final logo and easy to swap out (just replace this component's
// contents with an <img src="/spx-logo.svg" /> once we have the real file).
export default function AeonMark() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <ellipse
          cx="36"
          cy="36"
          rx="34"
          ry="14"
          stroke="var(--aeon-accent)"
          strokeWidth="1.5"
          transform="rotate(-20 36 36)"
        />
        <circle cx="36" cy="36" r="20" stroke="var(--aeon-text-dim)" strokeWidth="1" />
      </svg>
      <div
        style={{
          fontWeight: 800,
          fontSize: "0.95rem",
          letterSpacing: "0.05em",
          color: "var(--aeon-text)",
          marginTop: "-6px",
        }}
      >
        SPX
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          color: "var(--aeon-accent)",
        }}
      >
        6900
      </div>
    </div>
  );
}
