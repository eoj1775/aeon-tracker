"use client";

import { useEffect, useState } from "react";

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

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function Home() {
  const [data, setData] = useState<SubscribersResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/subscribers");
        if (!res.ok) throw new Error("Request failed");
        const json = await res.json();
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
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "4rem 1.5rem", fontFamily: "monospace" }}>
      <p style={{ opacity: 0.6 }}>AEON.NETWORK — placeholder build, Stage 2</p>
      <h1 style={{ fontSize: "0.9rem", marginTop: "2rem", opacity: 0.7 }}>r/SPX6900</h1>

      {error && <p style={{ color: "#c66" }}>{error}</p>}

      {!data && !error && <p>Loading live count…</p>}

      {data && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontSize: "4rem", lineHeight: 1 }}>
            {data.subscribers.toLocaleString()}
          </div>
          <p>/ {data.target.toLocaleString()} AEONS</p>
          <p>{data.percentComplete.toFixed(2)}% COMPLETE</p>
          <p>{data.remaining.toLocaleString()} AEONS REMAIN</p>
          <p>{data.daysRemaining} DAYS REMAINING</p>
          {data.stale && (
            <p style={{ opacity: 0.6, marginTop: "1rem" }}>
              (showing last known value — live fetch temporarily unavailable)
            </p>
          )}
          <p style={{ opacity: 0.4, fontSize: "0.75rem", marginTop: "2rem" }}>
            last updated {new Date(data.fetchedAt).toLocaleTimeString()}
          </p>
        </div>
      )}

      <a
        href="https://www.reddit.com/r/spx6900/"
        target="_blank"
        rel="noreferrer"
        style={{ display: "inline-block", marginTop: "2rem", border: "1px solid currentColor", padding: "0.5rem 1rem" }}
      >
        JOIN r/SPX6900
      </a>
    </main>
  );
}
