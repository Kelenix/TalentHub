import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = { title: "Mentions légales" };

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink">Mentions légales</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink">
        <section>
          <h2>Éditeur du site</h2>
          <p>
            Le site TalentHub est édité par [Nom de l&apos;éditeur / société],
            [forme juridique], dont le siège est situé à [adresse], [code postal]
            [ville], Italie. Contact : [email de contact].
          </p>
        </section>
        <section>
          <h2>Directeur de la publication</h2>
          <p>[Nom du directeur de la publication].</p>
        </section>
        <section>
          <h2>Hébergement</h2>
          <p>
            Le site est hébergé par Vercel Inc. (340 S Lemon Ave #4133, Walnut,
            CA 91789, États-Unis). La base de données et l&apos;authentification
            sont fournies par Supabase.
          </p>
        </section>
        <section>
          <h2>Nature du service</h2>
          <p>
            TalentHub est un <strong>annuaire de mise en relation</strong> entre
            prestataires de services et visiteurs. La plateforme n&apos;est pas
            un site de commerce en ligne : <strong>aucun paiement</strong>,
            aucune commande et aucune transaction n&apos;y sont effectués. Les
            échanges et accords éventuels se font directement entre le visiteur
            et le prestataire, en dehors de la plateforme. TalentHub n&apos;est
            pas partie à ces relations et ne saurait être tenu responsable de la
            qualité, de la légalité ou de l&apos;exécution des prestations
            proposées.
          </p>
        </section>
        <section>
          <h2>Responsabilité du contenu</h2>
          <p>
            Les annonces et profils sont publiés sous la responsabilité de leurs
            auteurs (les prestataires). Tout contenu inapproprié peut être
            signalé via le bouton « Signaler » présent sur chaque annonce et
            sera examiné par notre équipe de modération.
          </p>
        </section>
        <section>
          <h2>Propriété intellectuelle</h2>
          <p>
            La marque, le logo et l&apos;identité visuelle de TalentHub sont
            protégés. Les photos et descriptions des annonces restent la
            propriété de leurs auteurs.
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
