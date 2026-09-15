import { NextResponse } from "next/server";
import { getSubscriberCount } from "@/lib/reddit";
import { TARGET_SUBSCRIBERS, DEADLINE_ISO, daysRemaining } from "@/lib/config";
import { computePace } from "@/lib/pace";

export async function GET() {
  try {
    const reading = await getSubscriberCount();
    const subscribers = reading.subscribers;

    // Pace is a nice-to-have on top of the core count — if it fails or there's
    // not enough history yet, computePace returns null and we just omit it
    // rather than failing the whole request.
    const pace = await computePace(subscribers, TARGET_SUBSCRIBERS);

    return NextResponse.json({
      subscribers,
      target: TARGET_SUBSCRIBERS,
      remaining: Math.max(0, TARGET_SUBSCRIBERS - subscribers),
      percentComplete: Math.min(100, (subscribers / TARGET_SUBSCRIBERS) * 100),
      deadline: DEADLINE_ISO,
      daysRemaining: daysRemaining(),
      fetchedAt: reading.fetchedAt,
      stale: reading.stale,
      pace,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "Unable to reach Reddit and no cached reading is available yet.",
      },
      { status: 502 }
    );
  }
}
