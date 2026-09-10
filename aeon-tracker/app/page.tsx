"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface SubscribersResponse {
  subscribers: number;
  target: number;
  remaining: number;
  percentComplete: number;
  deadline: string;
  daysRemaining: number;
  fetchedAt: string;
  stale: boolean;
}

const POLL_INTERVAL_MS = 5 * 60 * 1000;

function ProgressBlock({ percent, columns = 40, rows = 7 }: { percent: number; columns?: number; rows?: number }) {
  const filledColumns = Math.round((percent / 100) * columns);
  const cellPercent = 100 / columns;
  const dots: boolean[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) dots.push(c < filledColumns);
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: "100%" }}>
      {dots.map((isFilled, i) => (
        <div key={i} style={{ width: `${cellPercent}%`, padding: "2px", boxSizing: "border-box" }}>
          <div
            style={{
              width: "100%",
              paddingTop: "100%",
              borderRadius: "50%",
              background: isFilled ? "var(--aeon-accent)" : "rgba(255,255,255,0.14)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

function TextStack({ lines, align = "left" }: { lines: string[]; align?: "left" | "right" }) {
  return (
    <div style={{ fontSize: "clamp(0.6rem, 0.9vw, 0.75rem)", lineHeight: 1.7, fontWeight: 700, textAlign: align }}>
      {lines.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
      <div style={{ marginTop: "0.4rem", fontWeight: 400, color: "var(--aeon-text-dim)" }}>—</div>
    </div>
  );
}

function PhotoCard({ src, alt, rotate = 0 }: { src: string; alt: string; rotate?: number }) {
  return (
    <div
      style={{
        border: "1px solid var(--aeon-border)",
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        overflow: "hidden",
      }}
    >
      <Image src={src} alt={alt} width={400} height={400} style={{ width: "100%", height: "auto", display: "block" }} unoptimized />
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<SubscribersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/subscribers");
        if (!res.ok) throw new Error("failed");
        const json: SubscribersResponse = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Unable to load live data.");
      }
    }
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <main
      style={{
        maxWidth: 1400,
        width: "100%",
        margin: "0 auto",
        padding: "clamp(1rem, 3vw, 2.5rem)",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1.5rem",
          paddingBottom: "clamp(1rem, 3vw, 2rem)",
        }}
      >
        <div style={{ display: "flex", gap: "clamp(1rem, 3vw, 2.5rem)", flexWrap: "wrap" }}>
          <TextStack lines={["PEOPLE", "IDEAS", "CAPITAL", "CULTURE", "CONSCIOUSNESS", "A BRIGHTER", "ALTERNATIVE."]} />
          <TextStack lines={["SPX6900", "PUBLIC OBSERVATION NODE", "v0.1.0", "", "THERE IS NO CHART."]} />
        </div>

        <Image
          src="/collage/spx-logo.png"
          alt="SPX6900"
          width={900}
          height={506}
          style={{ width: "min(46vw, 340px)", height: "auto", filter: "invert(1)" }}
          unoptimized
        />

        <div style={{ display: "flex", gap: "clamp(1rem, 3vw, 2.5rem)", flexWrap: "wrap", alignItems: "flex-start" }}>
          <TextStack lines={["INTERNET", "FOREVER", "MMXXVI"]} align="right" />
          <div
            style={{
              background: "var(--aeon-accent)",
              color: "var(--aeon-on-accent)",
              padding: "0.75rem 1rem",
              fontWeight: 800,
              fontSize: "clamp(0.75rem, 1.3vw, 1rem)",
              lineHeight: 1.3,
              maxWidth: 160,
              transform: "rotate(1deg)",
            }}
          >
            THE SYSTEM WAS NOT DESIGNED FOR US.
          </div>
        </div>
      </header>

      {/* BODY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,2.3fr) minmax(0,1fr)",
          gap: "clamp(1rem, 2.5vw, 2rem)",
        }}
        className="aeon-body-grid"
      >
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <PhotoCard src="/collage/crowd.jpg" alt="Crowd holding SPX6900 signs" />
          <div style={{ fontSize: "clamp(1rem, 1.6vw, 1.3rem)", fontStyle: "italic", fontWeight: 700, transform: "rotate(-2deg)" }}>
            PERSIST
            <br />
            FOREVER.
          </div>
          <PhotoCard src="/collage/globe.jpg" alt="Wireframe globe" />
          <TextStack lines={["CULTURE", "TECHNOLOGY", "CONSCIOUSNESS", "COMMUNITY"]} />
        </div>

        {/* CENTER */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div
            style={{
              background: "var(--aeon-accent)",
              color: "var(--aeon-on-accent)",
              fontWeight: 800,
              fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)",
              padding: "0.3rem 1.1rem",
            }}
          >
            r/SPX6900
          </div>

          <div style={{ marginTop: "1.25rem", fontSize: "clamp(0.85rem, 1.3vw, 1rem)", fontWeight: 700, lineHeight: 1.6 }}>
            THE MISSION:
            <br />
            69,000 PEOPLE IN r/SPX6900
          </div>

          {error && <p style={{ color: "#e88", marginTop: "2rem", fontSize: "0.85rem" }}>{error}</p>}
          {!data && !error && <p style={{ marginTop: "2rem", color: "var(--aeon-text-dim)" }}>Loading live count…</p>}

          {data && (
            <>
              <div
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "clamp(3rem, 8vw, 6rem)",
                  fontWeight: 800,
                  lineHeight: 1,
                  marginTop: "1.25rem",
                  letterSpacing: "-0.02em",
                }}
              >
                {data.subscribers.toLocaleString()}
              </div>
              <div style={{ fontFamily: "var(--font-mono), monospace", fontSize: "clamp(1.1rem, 2vw, 1.4rem)", fontWeight: 700, marginTop: "0.5rem" }}>
                / {data.target.toLocaleString()}
              </div>

              <div style={{ width: "100%", marginTop: "2rem" }}>
                <ProgressBlock percent={data.percentComplete} />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  marginTop: "0.75rem",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "clamp(0.65rem, 1.1vw, 0.85rem)",
                  fontWeight: 700,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--aeon-accent)", display: "inline-block" }} />
                  = 1 PERSON
                </span>
                <span>{data.percentComplete.toFixed(2)}% COMPLETE</span>
              </div>

              {data.stale && (
                <div style={{ fontSize: "0.75rem", color: "var(--aeon-accent)", marginTop: "1rem" }}>
                  (showing last known value — live fetch temporarily unavailable)
                </div>
              )}

              <a
                href="https://www.reddit.com/r/spx6900/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: "2.5rem",
                  padding: "0.75rem 1.75rem",
                  border: "2px solid var(--aeon-accent)",
                  color: "var(--aeon-accent)",
                  fontFamily: "var(--font-mono), monospace",
                  fontSize: "clamp(0.8rem, 1.3vw, 1rem)",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                }}
              >
                [ JOIN THE MOVEMENT &nearr; ]
              </a>

              <div style={{ fontSize: "clamp(0.65rem, 1vw, 0.8rem)", color: "var(--aeon-text-dim)", marginTop: "1rem", letterSpacing: "0.05em" }}>
                REDIRECT // reddit.com/r/spx6900
              </div>

              <div style={{ fontSize: "clamp(0.8rem, 1.3vw, 1rem)", fontWeight: 700, marginTop: "2rem" }}>
                THE PEOPLE ARE THE SIGNAL.
              </div>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <PhotoCard src="/collage/eye.jpg" alt="Collaged eye" />
          <TextStack lines={["ORDINARY", "PEOPLE", "EXTRAORDINARY", "POSSIBILITIES."]} />
          <PhotoCard src="/collage/stairs.jpg" alt="Silhouettes on stairs" />
          <PhotoCard src="/collage/earth.jpg" alt="Earth from orbit" />
          <TextStack lines={["SPX6900", "MMXXVI", "A BRIGHTER", "ALTERNATIVE."]} />
        </div>
      </div>

      <div style={{ borderTop: "1px solid var(--aeon-border)", marginTop: "clamp(2rem, 4vw, 3rem)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--aeon-text-dim)" }}>
        <span>© 2026 AEON.NETWORK</span>
        <span>v0.1 // A MORE POPULOUS TOMORROW.</span>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .aeon-body-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
