import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">
        Politique de confidentialité
      </h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc">
        <p>
          TalentHub attache une grande importance à la protection de vos données
          personnelles, conformément au Règlement Général sur la Protection des
          Données (RGPD).
        </p>
        <section>
          <h2>Données collectées</h2>
          <ul className="space-y-1">
            <li>
              <strong>Prestataires</strong> : email, mot de passe (géré et
              chiffré par Supabase), nom, prénom, numéro WhatsApp, ville, pays
              d&apos;origine, description, photos et annonces publiées.
            </li>
            <li>
              <strong>Visiteurs</strong> : aucune donnée de compte. Des mesures
              d&apos;audience anonymes (vues, clics de contact) sont enregistrées
              sans vous identifier.
            </li>
          </ul>
        </section>
        <section>
          <h2>Finalités</h2>
          <p>
            Les données des prestataires servent uniquement à afficher leurs
            annonces et à permettre aux visiteurs de les contacter
            (WhatsApp / email). Aucune donnée n&apos;est revendue à des tiers.
          </p>
        </section>
        <section>
          <h2>Cookies</h2>
          <p>
            Le site utilise uniquement des <strong>cookies essentiels</strong>{" "}
            nécessaires à l&apos;authentification et au bon fonctionnement (gérés
            par Supabase Auth). Aucun cookie publicitaire ou de pistage
            tiers n&apos;est utilisé à ce stade.
          </p>
        </section>
        <section>
          <h2>Durée de conservation</h2>
          <p>
            Les données sont conservées tant que le compte prestataire est actif.
            La suppression du compte entraîne la suppression de ses annonces et
            de ses photos.
          </p>
        </section>
        <section>
          <h2>Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification,
            d&apos;effacement, de portabilité et d&apos;opposition sur vos
            données. Pour l&apos;exercer, écrivez à [email de contact]. Un
            prestataire peut à tout moment modifier ou supprimer ses annonces et
            son profil depuis son tableau de bord.
          </p>
        </section>
        <section>
          <h2>Sous-traitants</h2>
          <p>
            Hébergement et base de données : Vercel et Supabase. Emails
            transactionnels : Resend. Ces prestataires traitent les données pour
            notre compte, dans le respect du RGPD.
          </p>
        </section>
        <p className="text-xs text-ink-muted">
          Les éléments entre crochets [ ] doivent être complétés par
          l&apos;éditeur avant la mise en ligne.
        </p>
      </div>
    </article>
  );
}
