"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { sendMessage, markConversationRead } from "@/lib/messages/actions";

export function MessageComposer({
  conversationId,
  recipientId,
  hasUnread,
}: {
  conversationId: string;
  recipientId: string;
  hasUnread: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const didInit = useRef(false);

  // À l'ouverture : marquer les messages reçus comme lus + rafraîchir le badge.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    window.scrollTo(0, document.body.scrollHeight);
    if (hasUnread) {
      markConversationRead(conversationId).then(() => router.refresh());
    }
  }, [conversationId, hasUnread, router]);

  function submit(e: React.SyntheticEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || pending) return;
    setError(null);
    start(async () => {
      const res = await sendMessage({ recipientId, body: text });
      if (res.error) {
        setError(res.error);
        return;
      }
      setBody("");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={submit}
      className="border-t border-hairline pt-3"
    >
      {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(e);
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder="Écrire un message…"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" disabled={pending || !body.trim()}>
          {pending ? "…" : "Envoyer"}
        </Button>
      </div>
    </form>
  );
}
