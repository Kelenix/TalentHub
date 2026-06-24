import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "light";
}) {
  return (
    <span
      className={cn(
        "font-display text-xl font-extrabold tracking-tight",
        variant === "light" ? "text-cream" : "text-ink",
        className,
      )}
    >
      Talent<span className="text-terracotta">Hub</span>
    </span>
  );
}
