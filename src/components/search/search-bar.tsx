"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function SearchBar({
  placeholder,
  buttonLabel,
  cities = [],
  cityLabel = "Ville",
}: {
  placeholder: string;
  buttonLabel: string;
  cities?: { id: string; name: string }[];
  cityLabel?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (city) params.set("city", city);
    const qs = params.toString();
    router.push(`/recherche${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2.5 px-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted-foreground"
        />
      </div>

      {cities.length > 0 && (
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label={cityLabel}
          className="h-10 cursor-pointer rounded-lg border-0 bg-transparent px-2 text-sm font-medium text-muted-foreground outline-none sm:border-l sm:border-border"
        >
          <option value="">{cityLabel}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      <Button type="submit">{buttonLabel}</Button>
    </form>
  );
}
