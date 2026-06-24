"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const KEY = "th-cookie-ack";

export function CookieNotice() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      // localStorage indisponible : on n'affiche rien
    }
  }, []);

  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
    setShow(false);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-lg sm:flex sm:items-center sm:gap-4">
      <p className="text-sm text-muted-foreground">
        Ce site utilise uniquement des cookies essentiels au fonctionnement et à
        l&apos;authentification.{" "}
        <Link
          href="/confidentialite"
          className="font-semibold text-terracotta-deep hover:underline"
        >
          En savoir plus
        </Link>
        .
      </p>
      <Button size="sm" onClick={dismiss} className="mt-3 w-full sm:mt-0 sm:w-auto">
        Compris
      </Button>
    </div>
  );
}
