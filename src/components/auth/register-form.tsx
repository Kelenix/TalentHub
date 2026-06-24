"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signUpAction, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const initial: AuthState = {};

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function RegisterForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(signUpAction, initial);

  if (state.success) {
    return (
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-bold text-ink">{t("checkEmailTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("checkEmailBody")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">
            {t("firstName")}
          </label>
          <input name="firstName" required className={inputClass} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-ink">{t("lastName")}</label>
          <input name="lastName" required className={inputClass} />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">{t("whatsapp")}</label>
        <input name="whatsappNumber" required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">{t("email")}</label>
        <input name="email" type="email" required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">{t("password")}</label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className={inputClass}
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {t("submitRegister")}
      </Button>
    </form>
  );
}
