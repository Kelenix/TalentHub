import { setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/auth/user";
import { getUserNotifications } from "@/lib/notifications/queries";
import { formatDate } from "@/lib/format";
import { NotificationsList } from "@/components/notifications/notifications-list";

export const dynamic = "force-dynamic";

export default async function DashboardNotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireUser();

  const notifs = await getUserNotifications(user.id);
  const items = notifs.map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.read,
    date: formatDate(n.createdAt, locale),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Notifications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Suivi de vos annonces et de votre compte.
      </p>
      <div className="mt-8">
        <NotificationsList items={items} />
      </div>
    </div>
  );
}
