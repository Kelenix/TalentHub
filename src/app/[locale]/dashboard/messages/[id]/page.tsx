import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/user";
import { getConversation } from "@/lib/messages/queries";
import { cn } from "@/lib/utils";
import { MessageComposer } from "@/components/messages/message-composer";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await requireUser();

  const conv = await getConversation(id, user.id);
  if (!conv) notFound();

  const time = new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const hasUnread = conv.messages.some((m) => !m.mine);

  return (
    <div className="mx-auto flex h-[calc(100vh-1px)] max-w-3xl flex-col px-4 py-6 sm:px-8 lg:h-screen">
      {/* En-tête du fil */}
      <div className="flex items-center gap-3 border-b border-hairline pb-4">
        <Link
          href="/dashboard/messages"
          className="text-sm text-muted-foreground hover:text-ink"
          aria-label="Retour aux messages"
        >
          ←
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {conv.other.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{conv.other.name}</p>
          {conv.listing && (
            <Link
              href={`/annonce/${conv.listing.id}`}
              className="truncate text-xs text-muted-foreground hover:text-primary"
            >
              À propos de « {conv.listing.title} »
            </Link>
          )}
        </div>
      </div>

      {/* Fil de messages */}
      <div className="flex-1 space-y-3 overflow-y-auto py-6">
        {conv.messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Démarrez la conversation ci-dessous.
          </p>
        ) : (
          conv.messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.mine ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  m.mine
                    ? "rounded-br-sm bg-primary text-white"
                    : "rounded-bl-sm bg-secondary text-ink",
                )}
              >
                <p className="whitespace-pre-line break-words">{m.body}</p>
                <p
                  className={cn(
                    "mt-1 text-[10px]",
                    m.mine ? "text-white/70" : "text-muted-foreground",
                  )}
                >
                  {time.format(m.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Saisie */}
      <MessageComposer
        conversationId={conv.id}
        recipientId={conv.other.id}
        hasUnread={hasUnread}
      />
    </div>
  );
}
