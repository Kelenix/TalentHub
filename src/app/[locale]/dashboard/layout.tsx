import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { getUserUnreadCount } from "@/lib/notifications/queries";
import { getUnreadMessageCount } from "@/lib/messages/queries";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  if (user.role === "ADMIN") redirect("/admin");

  const userName =
    [user.profile?.firstName, user.profile?.lastName]
      .filter(Boolean)
      .join(" ") || user.email;
  const [notifCount, msgCount] = await Promise.all([
    getUserUnreadCount(user.id),
    getUnreadMessageCount(user.id),
  ]);

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <DashboardSidebar
        userName={userName}
        notifCount={notifCount}
        msgCount={msgCount}
      />
      <div className="min-w-0 flex-1 bg-cream">{children}</div>
    </div>
  );
}
