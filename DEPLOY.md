# Déploiement — TalentHub

Guide de mise en production sur **Vercel** + **Supabase**.

## 1. Pré-requis
- Projet Supabase en production (peut être le même qu'en dev, ou un projet dédié « prod » — recommandé).
- Compte Vercel relié au dépôt Git du projet.
- Un nom de domaine (optionnel mais recommandé).

## 2. Base de données (Supabase)
```bash
# Applique le schéma sur la base de prod (DIRECT_URL = Session pooler, port 5432)
npm run db:deploy        # = prisma migrate deploy  (ou: npx prisma db push)
npm run db:seed          # catégories, pays, villes  (données de référence)
```
> Ne **pas** lancer `db:seed:demo` en production (données de démonstration).

## 3. Storage & Auth (Supabase)
- **Storage** : bucket public `listings` + policy `INSERT` pour le rôle `authenticated`.
- **Authentication → URL Configuration** :
  - *Site URL* : `https://ton-domaine.com`
  - *Redirect URLs* : `https://ton-domaine.com/auth/callback`

## 4. Variables d'environnement (Vercel → Settings → Environment Variables)
Reprendre les clés de `.env.example`, valeurs de **production** :
| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API (secret) |
| `DATABASE_URL` | Transaction pooler `:6543?pgbouncer=true` |
| `DIRECT_URL` | Session pooler `:5432` (pas `db.<ref>` = IPv6 only) |
| `RESEND_API_KEY` | Resend |
| `RESEND_FROM_EMAIL` | ex. `TalentHub <no-reply@ton-domaine.com>` |
| `NEXT_PUBLIC_SITE_URL` | `https://ton-domaine.com` |

## 5. Build (Vercel détecte Next.js automatiquement)
- Build command : `next build` (auto)
- Le client Prisma est généré au build (`postinstall` n'est pas requis ; `prisma generate` est lancé via le build Next ou ajouter `"postinstall": "prisma generate"` si besoin sur Vercel).

> ⚠️ Si Vercel échoue sur Prisma, ajouter dans `package.json` :
> `"postinstall": "prisma generate"`

## 6. Domaine
Vercel → Settings → Domains → ajouter le domaine, suivre la config DNS.
Mettre à jour `NEXT_PUBLIC_SITE_URL` **et** les Redirect URLs Supabase avec le domaine final.

## 7. Compte administrateur
```bash
# en local, connecté à la base de prod (DATABASE_URL prod dans .env)
npm run make:admin ton-email@domaine.com
```

## 8. Checklist avant lancement
- [ ] `npm run build` OK · `npm run test` OK
- [ ] Mentions légales et confidentialité complétées (champs entre crochets)
- [ ] Données de démo supprimées (`public/img/`, `prisma/seed-demo.ts`, users `@talenthub.test`)
- [ ] Parcours testé : inscription → confirmation email → publication annonce → contact WhatsApp
- [ ] Monitoring (optionnel) : Sentry, Vercel Analytics
