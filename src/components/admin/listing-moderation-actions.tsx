"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  setListingStatus,
  deleteListingAdmin,
  setListingPromoted,
} from "@/lib/admin/actions";

export function ListingModerationActions({
  id,
  status,
  promoted = false,
}: {
  id: string;
  status: "DRAFT" | "PUBLISHED" | "SUSPENDED";
  promoted?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<unknown>, refresh = true) {
    start(async () => {
      await fn();
      if (refresh) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "SUSPENDED" ? (
        <Button
          type="button"
          variant="whatsapp"
          size="sm"
          disabled={pending}
          onClick={() => run(() => setListingStatus(id, "PUBLISHED"))}
        >
          Republier
        </Button>
      ) : (
        <Button
          type="button"
          variant="ink"
          size="sm"
          disabled={pending}
          onClick={() => run(() => setListingStatus(id, "SUSPENDED"))}
        >
          Suspendre
        </Button>
      )}
      <Button
        type="button"
        variant={promoted ? "secondary" : "primary"}
        size="sm"
        disabled={pending}
        onClick={() => run(() => setListingPromoted(id, !promoted))}
      >
        {promoted ? "★ Retirer la mise en avant" : "★ Mettre en avant"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => {
          if (window.confirm("Supprimer définitivement cette annonce ?")) {
            start(async () => {
              await deleteListingAdmin(id);
              router.push("/admin/annonces");
            });
          }
        }}
        className="text-destructive"
      >
        Supprimer
      </Button>
    </div>
  );
}
