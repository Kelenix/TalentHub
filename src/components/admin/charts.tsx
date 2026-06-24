type Datum = { label: string; value: number };
type Segment = { label: string; value: number; color: string };

/** Carte conteneur d'un graphique. */
export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-5 font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

/** Diagramme à barres horizontales. */
export function BarChart({ data }: { data: Datum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0)
    return <p className="text-sm text-muted-foreground">Aucune donnée.</p>;
  return (
    <div className="space-y-3.5">
      {data.map((d) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-ink">{d.label}</span>
            <span className="text-muted-foreground">{d.value}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Courbe d'aire (activité sur une période). */
export function AreaChart({ data }: { data: Datum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const W = 100;
  const H = 40;
  const step = data.length > 1 ? W / (data.length - 1) : W;
  const pts = data.map(
    (d, i) => [i * step, H - (d.value / max) * (H - 4) - 2] as const,
  );
  const line = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        <span className="text-2xl font-bold text-ink">{total}</span> vues sur 7
        jours
      </p>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-28 w-full"
      >
        <path d={area} fill="var(--primary)" opacity="0.12" />
        <path
          d={line}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {data.map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/** Diagramme en anneau (donut) avec légende et total au centre. */
export function DonutChart({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const R = 42;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 100 100" className="size-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="var(--secondary)"
            strokeWidth="13"
          />
          {total > 0 &&
            segments.map((s) => {
              const len = (s.value / total) * C;
              const el = (
                <circle
                  key={s.label}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="13"
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-ink">{total}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            total
          </span>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="size-3 shrink-0 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-semibold text-ink">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
