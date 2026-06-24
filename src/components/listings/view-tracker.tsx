"use client";

import { useEffect, useRef } from "react";

/** Enregistre une vue (une fois par montage) côté /api/events. */
export function ViewTracker({ listingId }: { listingId: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    try {
      const body = JSON.stringify({ listingId, type: "VIEW" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/events",
          new Blob([body], { type: "application/json" }),
        );
      } else {
        void fetch("/api/events", {
          method: "POST",
          body,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch {
      // best-effort
    }
  }, [listingId]);

  return null;
}
