// A stylized, hand-built sphere (not a real photo) — avoids any image
// licensing questions and keeps everything in the same terminal/vector
// aesthetic as the rest of the UI. Evokes the moon/globe imagery from the
// mockup's left rail without reproducing an actual photograph.
export default function GlobeGraphic() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="sphereShade" cx="35%" cy="35%" r="75%">
          <stop offset="0%" stopColor="var(--aeon-text-dim)" />
          <stop offset="55%" stopColor="rgba(242,236,221,0.08)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.93  0 0 0 0 0.87  0 0 0 0.4 0" />
        </filter>
      </defs>
      <circle cx="90" cy="90" r="88" fill="url(#sphereShade)" />
      <circle cx="90" cy="90" r="88" stroke="var(--aeon-border)" strokeWidth="1" fill="none" />
      <circle cx="90" cy="90" r="88" fill="url(#sphereShade)" opacity="0.6" filter="url(#grain)" />
      {/* Faint crater-like marks for texture */}
      <circle cx="60" cy="70" r="10" stroke="var(--aeon-border)" strokeWidth="0.75" fill="none" opacity="0.5" />
      <circle cx="110" cy="55" r="6" stroke="var(--aeon-border)" strokeWidth="0.75" fill="none" opacity="0.4" />
      <circle cx="100" cy="120" r="14" stroke="var(--aeon-border)" strokeWidth="0.75" fill="none" opacity="0.35" />
      <circle cx="55" cy="120" r="5" stroke="var(--aeon-border)" strokeWidth="0.75" fill="none" opacity="0.4" />
    </svg>
  );
}
