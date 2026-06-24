# TalentHub

Annuaire communautaire de mise en relation entre prestataires de services locaux et clients (Italie → Europe).
**Sans paiement de service** : le contact se fait directement via WhatsApp / email.

Plan complet : [`PLAN_DE_DEVELOPPEMENT.md`](./PLAN_DE_DEVELOPPEMENT.md) · Cahier des charges : [`DiaspoFood.md`](./DiaspoFood.md) · Maquettes : [`diseign/`](./diseign).

## Stack

Next.js 16 (App Router, TS) · Tailwind v4 + shadcn · Prisma · **Supabase** (Postgres + Auth + Storage) · next-intl (FR/IT) · Resend · Vercel.

## Démarrage

```bash
npm install
npm run dev          # http://localhost:3000  (fonctionne même sans Supabase configuré)
```

## Connecter Supabase (à faire une fois)

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Copier `.env.example` vers `.env` **et** `.env.local`, puis remplir :
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` → *Project Settings → API*
   - `DATABASE_URL` = **Transaction pooler** (`...pooler.supabase.com:6543/...?pgbouncer=true`) et `DIRECT_URL` = **Session pooler** (`...pooler.supabase.com:5432/...`) → *Project Settings → Database → Connection string*.
     > ⚠️ Ne **pas** utiliser la « Direct connection » `db.<ref>.supabase.co:5432` pour `DIRECT_URL` : elle est IPv6-only et injoignable depuis la plupart des réseaux (erreur Prisma `P1001`). Utiliser le **Session pooler** (même hôte `pooler.supabase.com`, port 5432).
   - `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`
   > `.env` est lu par Prisma (migrations) ; `.env.local` par Next.js (runtime). Mettre les mêmes valeurs dans les deux.
3. Créer le schéma et le remplir :
   ```bash
   npm run db:migrate     # crée les tables (migration initiale)
   npm run db:seed        # catégories, sous-catégories, pays, villes d'Italie
   ```
4. **Storage** : Supabase → *Storage* → créer un bucket **public** nommé `listings`. Ajouter une policy autorisant les utilisateurs authentifiés à `INSERT` (upload des photos). La lecture publique est couverte par le bucket public.
5. **Auth** : Supabase → *Authentication* → *URL Configuration* → ajouter `http://localhost:3000/auth/callback` (et l'URL de prod) dans les *Redirect URLs*. Laisser « Confirm email » activé pour la vérification d'email.

> ⚠️ **Secrets** : mettre les vraies clés (anon, service role, mots de passe DB) dans `.env` / `.env.local` — **jamais** dans `.env.example`, qui est versionné dans git.

## Scripts utiles

| Commande | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | Cycle Next.js |
| `npm run db:migrate` | Migration Prisma (dev) |
| `npm run db:seed` | Données de référence |
| `npm run db:studio` | Explorateur de base Prisma |
| `npm run db:generate` | Régénère le client Prisma |
| `npm run lint` | ESLint |

## Structure

```
src/
├─ app/[locale]/
│  ├─ (public)/        accueil · recherche · annonce/[id] · prestataire/[id]
│  ├─ (auth)/          connexion · inscription
│  ├─ dashboard/       espace prestataire (sidebar)
│  └─ admin/           espace admin (sidebar)
├─ components/         ui/ (button…) · brand/ (logo) · layout/ (header, footer, sidebars)
├─ i18n/              routing · navigation · request (next-intl)
├─ lib/
│  ├─ supabase/        client · server · admin · middleware (session)
│  ├─ prisma.ts        client Prisma (singleton)
│  └─ utils.ts         cn()
├─ proxy.ts            i18n + refresh session Supabase (ex-middleware)
prisma/                schema.prisma · seed.ts
messages/              fr.json · it.json
```




