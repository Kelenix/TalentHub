"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { sendMessage } from "@/lib/messages/actions";

export function ContactMemberButton({
  recipientId,
  recipientName,
  listingId,
  isLoggedIn = true,
}: {
  recipientId: string;
  recipientName: string;
  listingId?: string;
  isLoggedIn?: boolean;
}) {
  const t = useTranslations("messaging");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text || pending) return;
    setError(null);
    start(async () => {
      const res = await sendMessage({ recipientId, listingId, body: text });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.conversationId)
        router.push(`/dashboard/messages/${res.conversationId}`);
    });
  }

  // Visiteur non connecté : le bouton invite à se connecter.
  if (!isLoggedIn) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => router.push("/connexion")}
      >
        💬 {t("contact")}
      </Button>
    );
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        💬 {t("contact")}
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder={t("writeTo", { name: recipientName })}
        className="w-full resize-none rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          size="sm"
          className="flex-1"
          disabled={pending || !body.trim()}
        >
          {pending ? t("sending") : t("send")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setOpen(false)}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
