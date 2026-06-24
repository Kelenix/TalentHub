"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { reportListingAction } from "@/lib/reports/actions";
import { Button } from "@/components/ui/button";

export function ReportButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const r = await reportListingAction({
      listingId,
      reason,
      reporterEmail: email,
    });
    setPending(false);
    if (r.error) setError(r.error);
    else setDone(true);
  }

  if (done) {
    return (
      <p className="text-center text-xs text-muted-foreground">
        Merci, votre signalement a été transmis à la modération.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-auto flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-destructive"
      >
        <Flag className="size-3.5" /> Signaler cette annonce
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-2 rounded-xl border border-border bg-card p-4"
    >
      <p className="text-sm font-semibold text-ink">Signaler cette annonce</p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        required
        minLength={5}
        rows={3}
        placeholder="Motif du signalement…"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre email (optionnel)"
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="ink" disabled={pending}>
          Envoyer
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
