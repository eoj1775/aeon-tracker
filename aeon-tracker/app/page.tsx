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

// Overlay regions, measured as percentages against the locked 1536x1024
// background artwork. Do not adjust the artwork — only these boxes move.
const NUMBER_BOX = { left: 28.6, right: 71.6, top: 37.6, bottom: 55.2 };
const DOTS_BOX = { left: 27.0, right: 73.9, top: 57.6, bottom: 75.7 };
const BUTTON_BOX = { left: 35.2, right: 65.1, top: 76.2, bottom: 83.0 };

function pct(box: { left: number; right: number; top: number; bottom: number }) {
  return {
    left: `${box.left}%`,
    top: `${box.top}%`,
    width: `${box.right - box.left}%`,
    height: `${box.bottom - box.top}%`,
  };
}

function DotGrid({ percent, columns = 42, rows = 8 }: { percent: number; columns?: number; rows?: number }) {
  const total = columns * rows;
  const filled = Math.round((percent / 100) * total);
  const dots = Array.from({ length: total }, (_, i) => i < filled);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "min(0.6cqw, 4px)",
        width: "100%",
      }}
    >
      {dots.map((isFilled, i) => (
        <div
          key={i}
          style={{
            aspectRatio: "1 / 1",
            borderRadius: "50%",
            background: isFilled ? "#f0ec42" : "rgba(255,255,255,0.14)",
          }}
        />
      ))}
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

  const overlayBg = "#08080a";

  return (
    <main style={{ width: "100%", maxWidth: 1536, margin: "0 auto" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1536 / 1024",
          containerType: "inline-size",
        }}
      >
        <Image
          src="/collage/background.jpg"
          alt="AEON.NETWORK — r/SPX6900 public observation node"
          fill
          priority
          style={{ objectFit: "cover" }}
          unoptimized
        />

        {/* Subscriber number overlay */}
        <div
          style={{
            position: "absolute",
            ...pct(NUMBER_BOX),
            background: overlayBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {data ? (
            <span
              style={{
                fontFamily: "var(--font-mono), monospace",
                fontWeight: 800,
                fontSize: "10cqw",
                color: "#f2f0e6",
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              {data.subscribers.toLocaleString()}
            </span>
          ) : (
            <span style={{ fontFamily: "var(--font-mono), monospace", color: "#f2f0e6", fontSize: "2.2cqw" }}>
              {error ? "—" : "loading…"}
            </span>
          )}
        </div>

        {/* Dot grid + percent overlay */}
        <div
          style={{
            position: "absolute",
            ...pct(DOTS_BOX),
            background: overlayBg,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "1.2cqw",
          }}
        >
          <DotGrid percent={data?.percentComplete ?? 0} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono), monospace",
              fontWeight: 700,
              fontSize: "1.5cqw",
              color: "#f2f0e6",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5cqw" }}>
              <span style={{ width: "1cqw", height: "1cqw", borderRadius: "50%", background: "#f0ec42", display: "inline-block" }} />
              = 1 PERSON
            </span>
            <span>{data ? `${data.percentComplete.toFixed(2)}% COMPLETE` : "—"}</span>
          </div>
        </div>

        {/* Join button — invisible clickable hotspot over the existing artwork button */}
        <a
          href="https://www.reddit.com/r/spx6900/"
          target="_blank"
          rel="noreferrer"
          aria-label="Join r/SPX6900"
          style={{
            position: "absolute",
            ...pct(BUTTON_BOX),
            cursor: "pointer",
          }}
        />
      </div>

      {data?.stale && (
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#f0ec42", padding: "0.5rem" }}>
          Showing last known value — live fetch temporarily unavailable.
        </p>
      )}
      {error && (
        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#e88", padding: "0.5rem" }}>{error}</p>
      )}
    </main>
  );
}
