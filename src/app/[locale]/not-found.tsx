import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-extrabold text-terracotta">404</p>
      <p className="text-muted-foreground">Cette page n&apos;existe pas.</p>
      <Link href="/">
        <Button variant="outline">Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}
