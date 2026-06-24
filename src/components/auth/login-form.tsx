"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { signInAction, type AuthState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

const initial: AuthState = {};

const inputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

export function LoginForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(signInAction, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">{t("email")}</label>
        <input name="email" type="email" required className={inputClass} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-ink">{t("password")}</label>
        <input name="password" type="password" required className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {t("submitLogin")}
      </Button>
    </form>
  );
}
