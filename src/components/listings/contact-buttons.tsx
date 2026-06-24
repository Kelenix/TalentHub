"use client";

import { whatsappLink, mailtoLink } from "@/lib/contact";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function logEvent(listingId: string, type: "WHATSAPP" | "EMAIL") {
  try {
    const body = JSON.stringify({ listingId, type });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/events",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      void fetch("/api/events", {
        method: "POST",
        body,
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch {
    // best-effort : ne bloque jamais le contact
  }
}

export function ContactButtons({
  listingId,
  whatsappNumber,
  email,
  message,
  whatsappLabel,
  emailLabel,
}: {
  listingId: string;
  whatsappNumber: string;
  email: string;
  message?: string;
  whatsappLabel: string;
  emailLabel: string;
}) {
  return (
    <div className="space-y-2">
      <a
        href={whatsappLink(whatsappNumber, message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => logEvent(listingId, "WHATSAPP")}
        className={cn(buttonVariants({ variant: "whatsapp" }), "w-full")}
      >
        {whatsappLabel}
      </a>
      <a
        href={mailtoLink(email, message)}
        onClick={() => logEvent(listingId, "EMAIL")}
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        {emailLabel}
      </a>
    </div>
  );
}
