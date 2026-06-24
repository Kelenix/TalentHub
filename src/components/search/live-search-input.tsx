"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

export function LiveSearchInput({
  placeholder,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pathname = "/recherche" as any,
}: {
  placeholder: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pathname?: any;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchronise si l'URL change ailleurs (filtres, navigation)
  useEffect(() => {
    setValue(params.get("q") ?? "");
  }, [params]);

  function onChange(next: string) {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const query: Record<string, string> = {};
      params.forEach((val, key) => {
        if (key !== "q" && key !== "page" && val) query[key] = val;
      });
      const trimmed = next.trim();
      if (trimmed) query.q = trimmed;
      startTransition(() => {
        router.replace({ pathname, query });
      });
    }, 300);
  }

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-3.5 shadow-sm">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
      />
      {isPending && (
        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
