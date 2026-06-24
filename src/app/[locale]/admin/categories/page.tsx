import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/user";
import { getCategories } from "@/lib/reference";
import { CategoriesManager } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Catégories</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gérez les catégories et sous-catégories de l&apos;annuaire.
      </p>
      <div className="mt-8">
        <CategoriesManager
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            subcategories: c.subcategories.map((s) => ({
              id: s.id,
              name: s.name,
            })),
          }))}
        />
      </div>
    </div>
  );
}
