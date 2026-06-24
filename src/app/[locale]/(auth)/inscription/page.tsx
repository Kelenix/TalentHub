import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-ink">{t("register")}</h1>
      <RegisterForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/connexion" className="text-terracotta hover:underline">
          {t("login")}
        </Link>
      </p>
    </div>
  );
}
