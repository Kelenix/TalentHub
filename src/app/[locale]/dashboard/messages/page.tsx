import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/user";
import { getConversationsForUser } from "@/lib/messages/queries";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MessagesInboxPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();

  const conversations = await getConversationsForUser(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Messages</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Vos échanges avec les autres membres de la communauté.
      </p>

      {conversations.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Aucune conversation pour le moment.
          </p>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-hairline overflow-hidden rounded-2xl border border-border bg-card">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link
                href={`/dashboard/messages/${c.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-secondary"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {c.other.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold text-ink">
                      {c.other.name}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(c.updatedAt, locale)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {c.lastMessage?.body ?? "—"}
                  </p>
                  {c.listing && (
                    <p className="truncate text-xs text-muted-foreground/80">
                      À propos de « {c.listing.title} »
                    </p>
                  )}
                </div>
                {c.unread > 0 && (
                  <span className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
                    {c.unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
