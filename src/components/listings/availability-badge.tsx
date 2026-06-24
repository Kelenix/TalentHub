import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

export function AvailabilityBadge({
  availability,
}: {
  availability: "AVAILABLE" | "UNAVAILABLE";
}) {
  const t = useTranslations("common");
  const available = availability === "AVAILABLE";
  return (
    <Badge variant={available ? "green" : "muted"}>
      <span
        className={`size-1.5 rounded-full ${available ? "bg-green" : "bg-muted-foreground"}`}
      />
      {available ? t("available") : t("unavailable")}
    </Badge>
  );
}
