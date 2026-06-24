"use client";

import { useState, useTransition } from "react";
import { X, Plus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  createCategory,
  deleteCategory,
  createSubcategory,
  deleteSubcategory,
} from "@/lib/admin/actions";

type Cat = {
  id: string;
  name: string;
  subcategories: { id: string; name: string }[];
};

export function CategoriesManager({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ error?: string }>) {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r?.error) setError(r.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {/* Ajouter une catégorie */}
      <div className="flex gap-2">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Nouvelle catégorie…"
          className="h-11 flex-1 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          type="button"
          disabled={pending || newCat.trim().length < 2}
          onClick={() =>
            run(async () => {
              const r = await createCategory({ name: newCat.trim() });
              if (!r.error) setNewCat("");
              return r;
            })
          }
        >
          <Plus className="size-4" /> Ajouter
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {categories.map((c) => (
        <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink">{c.name}</h3>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => deleteCategory(c.id))}
              className="text-xs font-medium text-destructive hover:underline"
            >
              Supprimer
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {c.subcategories.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-ink"
              >
                {s.name}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => deleteSubcategory(s.id))}
                  aria-label="Supprimer"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={newSub[c.id] ?? ""}
              onChange={(e) =>
                setNewSub((p) => ({ ...p, [c.id]: e.target.value }))
              }
              placeholder="Ajouter une sous-catégorie…"
              className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              disabled={pending || (newSub[c.id] ?? "").trim().length < 2}
              onClick={() =>
                run(async () => {
                  const r = await createSubcategory({
                    categoryId: c.id,
                    name: (newSub[c.id] ?? "").trim(),
                  });
                  if (!r.error) setNewSub((p) => ({ ...p, [c.id]: "" }));
                  return r;
                })
              }
              className="rounded-lg border border-border px-3 text-sm font-medium text-ink hover:bg-secondary disabled:opacity-50"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
