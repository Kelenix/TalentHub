import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/connexion");

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1 bg-cream">{children}</div>
    </div>
  );
}
