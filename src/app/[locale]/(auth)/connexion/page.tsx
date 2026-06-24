import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-ink">{t("login")}</h1>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/inscription" className="text-terracotta hover:underline">
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
