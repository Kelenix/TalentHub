# Plan de développement — TalentHub

> Annuaire communautaire de mise en relation entre prestataires de services locaux et clients.
> **Pas un site e-commerce.** Aucun paiement, aucun panier, aucune commande. Contact direct WhatsApp / email.
> Zone V1 : Italie — Architecture multi-pays dès le départ (extension Europe ensuite).

---

## 1. Synthèse & périmètre

| | |
|---|---|
| **Type de produit** | Annuaire / marketplace de visibilité (sans transaction) |
| **Acteurs** | Visiteur (sans compte), Prestataire (compte obligatoire), Administrateur |
| **Cœur de valeur** | Donner de la visibilité aux services hors des groupes WhatsApp/Facebook |
| **Mise en relation** | Bouton « Contacter sur WhatsApp » + « Envoyer un email » |
| **Contrainte forte** | Multi-pays, multilingue à terme, système de catégories **extensible** |

---

## 2. Stack technique recommandée

Le cahier recommande Next.js (front) + Spring Boot **ou** Node.js (back) + PostgreSQL + Cloudinary + Vercel/Hostinger.

**Recommandation : Next.js full-stack (un seul service) pour aller vite au MVP.**

| Couche | Choix | Justification |
|---|---|---|
| Framework | **Next.js 16 (App Router, TypeScript)** | SSR/ISR = SEO natif (crucial pour un annuaire), front + back dans un seul déploiement |
| Backend | **Route Handlers + Server Actions** Next.js | Évite un service Spring Boot séparé au MVP. Contrat REST défini → extractible plus tard si besoin |
| Base de données | **PostgreSQL hébergé sur Supabase** | Conforme au cahier ; base managée (backups auto), regroupe DB + Auth |
| ORM / accès données | **Prisma** (schéma, migrations, requêtes serveur) | Couche données typée ; cohabite avec Supabase Auth |
| Authentification | **Supabase Auth** (`@supabase/ssr`) — email + mot de passe | Sessions + vérification email gérées par Supabase ; rôles PRESTATAIRE / ADMIN |
| Images | **Supabase Storage** (buckets + transformations + CDN) | Inclus dans l'abonnement Supabase ; redimensionnement/optimisation natifs, évite un service tiers |
| UI / Styling | **Tailwind CSS + shadcn/ui** (thème personnalisé) | Reproduit fidèlement le design system des maquettes |
| i18n | **next-intl** (FR + IT, extensible) | Multilingue = évolution prévue ; sélecteur de langue déjà visible dans les maquettes |
| Recherche | **Postgres Full-Text** au MVP → Meilisearch en V2 | Suffisant pour titre + description ; montée en charge plus tard |
| Validation | **Zod** | Schémas partagés front/back |
| Emails transactionnels | **Resend** ou SMTP Hostinger | Vérification de compte, notifications |
| Hébergement | **Vercel** (app) + Postgres managé (Neon/Supabase) **ou** VPS Hostinger | Conforme au cahier |

> **Pattern Prisma + Supabase Auth** : Supabase Auth possède la table `auth.users` (identité, sessions, vérification email). Notre table applicative `User` référence `auth.users.id`. Tout l'accès aux données se fait **côté serveur via Prisma** (Server Actions / Route Handlers), avec contrôle de rôle applicatif (RBAC). Les politiques RLS Supabase servent de défense en profondeur (utiles si un accès direct client est ajouté plus tard).
>
> **Alternative** : si une API Spring Boot dédiée est souhaitée plus tard, le modèle de données et les contrats d'API ci-dessous restent valables — Next.js consommerait l'API au lieu d'accéder directement à la base.

---

## 3. Architecture (vue d'ensemble)

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js (Vercel)                    │
│                                                          │
│  Pages publiques (SSR/ISR)   Espace prestataire (auth)   │
│  - Accueil / annuaire        - Tableau de bord           │
│  - Recherche & filtres       - CRUD annonces             │
│  - Détail annonce            - Profil / disponibilité    │
│  - Profil prestataire        Espace admin (rôle ADMIN)   │
│                              - Modération / users / cat. │
│                                                          │
│  Route Handlers / Server Actions  ──►  Prisma  ──► PostgreSQL │
└───────────────┬──────────────────────────────┬──────────┘
                │                               │
        Resend (emails)        Supabase (Postgres + Auth + Storage)
                │
        WhatsApp / mailto (liens externes — aucune API requise)
```

- **Contact** = liens `https://wa.me/<numero>?text=...` et `mailto:` → zéro intégration tierce, zéro paiement.
- **SEO** : pages annonces et profils en SSR/ISR + sitemap dynamique + données structurées (schema.org `LocalBusiness` / `Service`).

---

## 4. Modèle de données

```
User                              ◄── lié à Supabase auth.users (pas de mot de passe stocké ici)
 ├─ id (= auth.users.id), email, role [PROVIDER | ADMIN]
 ├─ status [PENDING | ACTIVE | SUSPENDED]
 ├─ createdAt        (email + vérification gérés par Supabase Auth)
 └─ 1‑1 ProviderProfile

ProviderProfile
 ├─ userId (FK)
 ├─ firstName, lastName, photoUrl, description
 ├─ countryOfOrigin (FK Country), currentCity (FK City), region
 ├─ whatsappNumber, contactEmail
 ├─ socialLinks (JSON, optionnel), languages (string[])
 ├─ verified (bool), memberSince
 └─ 1‑N Listing

Category        id, name, slug, icon, order, isActive          (extensible via admin)
Subcategory     id, categoryId (FK), name, slug, order

Listing (Annonce)
 ├─ id, providerId (FK)
 ├─ title, description
 ├─ categoryId (FK), subcategoryId (FK)
 ├─ countryOfOrigin (FK), city (FK), region, serviceZone
 ├─ availability [AVAILABLE | UNAVAILABLE]
 ├─ status [DRAFT | PUBLISHED | SUSPENDED]
 ├─ attributes (JSONB)   ◄── champs spécifiques par catégorie
 │      cuisine  : { dishOrigin, preparationTime }
 │      coiffure : { hairstyleType, averageDuration }
 │      …extensible sans migration
 ├─ viewsCount, publishedAt, createdAt, updatedAt
 ├─ promoted (bool), promotedUntil (date, nullable)   ◄── hook monétisation (mise en avant)
 └─ 1‑N ListingPhoto

ListingPhoto    id, listingId (FK), url (Supabase Storage), order, isCover

Country         id, name, iso, isActive          ◄── multi-pays
City            id, countryId (FK), name, region

Report (Signalement)   id, targetType [LISTING|USER], targetId, reason,
                       reporterEmail, status [OPEN|REVIEWED|CLOSED], createdAt

ContactEvent (stats)   id, listingId, type [VIEW|WHATSAPP|EMAIL], createdAt
```

**Décision clé — champs spécifiques métier (`attributes` JSONB)** : le cahier impose un système *extensible* avec des modules « spéciaux » (Cuisine, Coiffure). Un champ JSONB par annonce permet d'ajouter des modules sans migration de schéma, tout en gardant les champs communs typés en colonnes.

---

## 5. Design system  ✅ FAIT (refonte moderne)

> Décision design : les maquettes servent uniquement de référence pour la **structure / le positionnement** des éléments. Le **thème** est moderne (inspiré des références fournies : Blue Apron + SaaS « Speed of Compute »). **Max 2 couleurs de marque + neutres, 2 polices.**

### Palette (implémentée — `src/app/globals.css`)
| Token | Valeur | Usage |
|---|---|---|
| `--ink` / `--foreground` | `#0F172A` (navy ardoise) | Texte, surfaces sombres (sidebar/footer), tuiles |
| `--primary` | `#EA580C` (orange-600) | Boutons primaires / CTA |
| `--terracotta` | `#F97316` (orange-500) | Accent décoratif (logo « Hub », mots clés) |
| `--terracotta-deep` | `#C2410C` | Liens / texte accent (contraste AA) |
| `--background` / `--cream` | `#F8FAFC` (slate-50) | Fond général |
| `--card` | `#FFFFFF` | Cartes |
| `--muted-foreground` | `#64748B` (slate-500) | Texte secondaire |
| `--border` | `#E2E8F0` (slate-200) | Bordures, séparateurs |
| `--green` / `--green-soft` | `#047857` / `#D1FAE5` | **Statut** : Disponible, WhatsApp (fonctionnel) |
| `--sidebar` | `#0F172A` | Sidebars dashboard/admin + footer |

### Typographie & composants
- **Polices (2)** : **Sora** (titres, `--font-display`) + **Inter** (texte, `--font-sans`). Mono : JetBrains Mono (technique).
- **Logo** : wordmark `Talent` (ink) + `Hub` (orange).
- **Composants** : `Button` (primary/ink/whatsapp/outline), `Badge`, `ListingCard` (moderne, hover lift), `SearchBar` (input + ville + CTA), `FiltersForm` (cases catégorie + pills sous-catégorie, conforme à la structure maquette 02), `PublicHeader` (liens catégories + langue + Connexion + CTA), `Footer` (navy), sidebars dashboard/admin.
- **Hero** : split moderne (texte + recherche à gauche, bento de services à droite — multi-services, pas limité à la cuisine).
- **Layouts** : public (header + footer sur toutes les pages publiques), dashboard (sidebar navy), admin (sidebar navy « ADMIN »).

---

## 6. Inventaire des écrans / routes

### Public (sans authentification)
| Route | Maquette | Contenu |
|---|---|---|
| `/` | 01 | Hero + recherche, grille catégories, dernières annonces, services populaires, sections Cuisine/Coiffure/Couture/Divers |
| `/recherche` | 02 | Sidebar filtres (pays, ville, catégorie, sous-catégorie, nationalité, disponibilité) + résultats + tri |
| `/annonce/[id]` | 03 | Galerie photos, description, infos (temps prépa, zone, date), carte prestataire, boutons WhatsApp/email |
| `/prestataire/[id]` | 04 | Profil public, à propos, langues, origine, grille des annonces du prestataire |
| `/connexion`, `/inscription` | — | Auth prestataire |
| `/mentions-legales`, `/confidentialite` | — | Légal (RGPD/GDPR) |

### Espace prestataire (auth PROVIDER)
| Route | Maquette | Contenu |
|---|---|---|
| `/dashboard` | 05 | Stats (annonces actives, vues, contacts WhatsApp) + table des annonces avec toggle dispo, modifier/supprimer |
| `/dashboard/annonces/nouvelle` | 06 | Formulaire dynamique (sélecteur catégorie → bloc spécifique), upload photos, brouillon/publier, autosave |
| `/dashboard/annonces/[id]/modifier` | 06 | Même formulaire pré-rempli |
| `/dashboard/profil` | — | Édition profil prestataire |
| `/dashboard/disponibilite` | — | Disponibilité globale |
| `/dashboard/statistiques` | — | Vues / contacts dans le temps |

### Administration (auth ADMIN)
| Route | Maquette | Contenu |
|---|---|---|
| `/admin` | 07 | Tableau de bord (prestataires, annonces, en attente, signalements) |
| `/admin/utilisateurs` | 07 | Liste users, statut (Vérifié/En attente), Voir/Suspendre |
| `/admin/annonces` | — | Modération des annonces |
| `/admin/categories` | — | CRUD catégories & sous-catégories |
| `/admin/moderation` | — | File des signalements |

---

## 7. API / Server Actions (contrat MVP)

| Domaine | Endpoints |
|---|---|
| Auth (Supabase Auth) | `signUp`, `signIn`, `signOut`, callback vérification email, `syncUserRow` (crée la ligne `User` applicative au 1er login) |
| Annonces (public) | `GET /api/listings` (filtres + pagination), `GET /api/listings/:id` |
| Annonces (prestataire) | `create`, `update`, `delete`, `toggleAvailability`, `saveDraft` |
| Profil | `GET /api/providers/:id`, `updateProfile` |
| Référentiels | `GET categories`, `GET subcategories`, `GET countries/cities` |
| Upload | `POST /api/uploads/sign` (URL signée Supabase Storage) |
| Stats | `POST /api/events` (VIEW/WHATSAPP/EMAIL), agrégats dashboard |
| Modération | `report`, admin `listReports`, `suspendUser`, `moderateListing`, CRUD catégories |

Toutes les entrées validées par Zod ; contrôle de rôle sur chaque action protégée.

---

## 8. Roadmap par phases

### Phase 0 — Fondations  ✅ FAIT
- ✅ Next.js 16 + TS + Tailwind v4 + fondations shadcn, thème moderne (navy/orange/slate, Sora + Inter — cf. §5), ESLint.
- ✅ Prisma (schéma complet §4) + client généré + seed (catégories, sous-catégories, pays, villes Italie). Migrations à exécuter une fois Supabase connecté.
- ✅ Clients Supabase (browser/server/admin) + Supabase Auth via proxy (`@supabase/ssr`), layouts (public / dashboard / admin), i18n FR/IT (next-intl). Build OK, routes vérifiées.
- ⏳ Reste à faire par l'utilisateur : créer le projet Supabase, remplir `.env`, lancer `npm run db:migrate` + `npm run db:seed` (cf. README).

### Phase 1A — Expérience visiteur (données réelles)  ✅ FAIT
- ✅ Couche de requêtes Prisma ([listings.ts](src/lib/listings.ts), [reference.ts](src/lib/reference.ts)) avec garde « DB non connectée ».
- ✅ Accueil (01) câblé : catégories + dernières + populaires. Recherche & filtres (02) : filtres URL (catégorie/sous-cat/ville/nationalité/dispo) + texte.
- ✅ Détail annonce (03) : galerie, infos (temps prépa via `attributes`, zone, date), carte prestataire, contact WhatsApp/email, suivi de vues. Profil public (04).
- ✅ API événements ([/api/events](src/app/api/events/route.ts)) : VIEW/WHATSAPP/EMAIL + incrément `viewsCount`. SEO : metadata dynamiques + [sitemap](src/app/sitemap.ts) + [robots](src/app/robots.ts). Build + runtime vérifiés.

### Phase 1B — Espace prestataire  ✅ FAIT
- ✅ Supabase Auth : inscription (+ création User/ProviderProfile), connexion, déconnexion, [callback de vérification email](src/app/auth/callback/route.ts), `getCurrentUser`/`requireProvider`/`requireAdmin`, protection des routes `/dashboard` et `/admin`.
- ✅ Dashboard (05) : stats réelles (annonces actives, vues, contacts WhatsApp), [table des annonces](src/components/dashboard/listings-table.tsx) avec toggle disponibilité + modifier/supprimer. Page profil éditable + statistiques.
- ✅ Formulaire dynamique (06) : [ListingForm](src/components/dashboard/listing-form.tsx) — onglets catégorie, bloc « Détails cuisine » conditionnel, upload Supabase Storage, brouillon/publication, CRUD complet ([actions](src/lib/listings/actions.ts)).
- ✅ **Module Cuisine** : origine du plat + temps de préparation stockés dans `attributes` JSONB.
- ⏳ Pré-requis utilisateur pour tester : projet Supabase + `.env` rempli, bucket Storage `listings` (public + policy insert authentifié), URL de redirection auth `/auth/callback` (cf. README).
- ℹ️ Back-office prestataire en **français** (libellés) ; le site public reste bilingue FR/IT. Traduction IT du back-office = amélioration ultérieure.
    



### Phase 2 — Admin & modération  ✅ FAIT
- ✅ Tableau de bord admin (stats réelles) + **gestion utilisateurs** (vérifier / suspendre / réactiver, onglets Tous/En attente/Suspendus + recherche).
- ✅ **CRUD catégories/sous-catégories** (ajout/suppression, garde anti-suppression si annonces liées).
- ✅ **Modération annonces** (suspendre/republier/supprimer) + **signalements** : bouton public « Signaler » sur la page détail → file de modération admin (Examiné/Clôturé).
- ✅ **Statistiques** globales (vues, contacts WhatsApp/email, publiées/brouillons).
- ✅ **Module Coiffure** : bloc « Détails coiffure » (type de coiffure + temps de réalisation) dans le formulaire, affiché sur la page détail (libellé « Durée » hors cuisine).
- ✅ **Pagination** des résultats de recherche (12/page).
- 🔑 Accès admin : s'inscrire puis `npm run make:admin <email>` → rôle ADMIN → `/admin`.

### Phase 3 — Qualité & lancement  ✅ FAIT (hors déploiement final)
- ✅ **RGPD** : pages **Mentions légales** + **Politique de confidentialité** (liens footer, dans le sitemap) + **bandeau cookies** (essentiels uniquement, dismissible).
- ✅ **Accessibilité** : skip-link « Aller au contenu », `lang` par page, focus visibles, alt sur les images.
- ✅ **SEO** : `metadataBase` + OpenGraph, **JSON-LD** (schema.org `Service`) sur la page détail, sitemap (annonces + prestataires + légales) + robots.
- ✅ **Tests** : Vitest configuré, 10 tests unitaires sur la logique pure (`contact`, `slug`, `format`). `npm run test`.
- ✅ **Guide de déploiement** : `DEPLOY.md` (Vercel + Supabase prod, env, domaine, checklist).
- ⏳ **Reste (action utilisateur)** : déploiement Vercel + domaine + `make:admin` en prod + monitoring (Sentry/Vercel Analytics). i18n des pages légales en IT à compléter si besoin.

### Évolutions futures (post-V1, cf. cahier §16)
Apps mobiles · géolocalisation · avis & notes · favoris · messagerie interne · Premium · pub sponsorisée · multilingue étendu · extension Europe.
*Le modèle multi-pays et le JSONB `attributes` sont déjà prévus pour absorber ces évolutions.*

---

## 9. Structure de projet (proposée)

```
talenthub/
├─ src/
│  ├─ app/
│  │  ├─ (public)/            # accueil, recherche, annonce, prestataire
│  │  ├─ (auth)/              # connexion, inscription
│  │  ├─ dashboard/           # espace prestataire
│  │  ├─ admin/               # espace admin
│  │  └─ api/                 # route handlers
│  ├─ components/             # ui/ + métier (Card, FilterSidebar, …)
│  ├─ lib/                    # prisma, supabase (auth + storage), zod
│  ├─ modules/               # logique par module (cuisine, coiffure, …)
│  ├─ messages/               # i18n fr.json / it.json
│  └─ styles/                 # tokens design system
├─ prisma/                    # schema.prisma + migrations + seed
└─ public/
```

---

## 10. Sujets transverses & risques

- **SEO** : priorité absolue pour un annuaire → SSR/ISR, URLs lisibles, sitemap, données structurées, balises OG.
- **Multi-pays** : tables `Country`/`City` + `isActive` ; pas de valeurs en dur.
- **Sécurité** : RBAC sur chaque action, rate-limiting auth, uploads signés, sanitation des inputs, masquage anti-spam des contacts (révélés au clic).
- **RGPD/GDPR** : consentement cookies, mentions légales, droit à l'effacement (suppression compte + annonces).
- **Modération** : publication directe + signalement *a posteriori* (décision actée §11) ; file de modération admin pour traiter les signalements.
- **Performance images** : Supabase Storage (transformations à la volée, formats responsives, CDN, lazy-load).

---

## 11. Décisions actées (validées avec le porteur de projet)

| # | Sujet | Décision |
|---|---|---|
| 1 | **Stack back** | **Next.js full-stack** (Route Handlers + Server Actions) — un seul service |
| 2 | **Publication / modération** | **Publication immédiate** des annonces + **modération a posteriori** via signalements |
| 3 | **Badge « vérifié »** | **MVP** : email confirmé (via Supabase Auth) + WhatsApp valide. **Évolution** : vérification manuelle admin |
| 4 | **Langues V1** | **FR + IT dès la V1** (architecture i18n complète) |
| 5 | **Base de données** | **Supabase** (Postgres managé) |
| 6 | **Authentification** | **Supabase Auth** (remplace Auth.js) — email + mot de passe |
| 7 | **Nom du produit** | **TalentHub** (marché : Italie puis Europe) |

> Conséquence du badge (#3) : puisque la publication est immédiate (#2), le statut « En attente » de la maquette admin (07) concerne la **vérification du profil prestataire**, pas l'annonce.

### Points complémentaires validés
- Stockage images : **Supabase Storage** (inclus dans l'abonnement, transformations + CDN).
- Hébergement app : **Vercel**.
- Emails transactionnels : **Resend**.

---

## 12. Monétisation (sans paywall ni abonnement au lancement)

**Principe directeur** : la plateforme reste **100 % gratuite** pour les visiteurs ET les prestataires au lancement. On monétise **l'audience une fois qu'elle existe**, jamais avant. La règle du cahier « aucun paiement pour le service entre client et prestataire » reste intacte — les revenus viennent d'ailleurs (annonceurs, mise en avant), pas de la transaction de service.

### Leviers, par ordre de rentabilité au démarrage

| # | Levier | Paiement requis ? | Quand | Détail |
|---|---|---|---|---|
| 1 | **Bannières vendues en direct** | Non (facturé hors plateforme) | Dès une 1ʳᵉ audience locale | Vendues aux commerces de la diaspora : transfert d'argent (Ria, Western Union…), épiceries africaines, restaurants, salons, événements, services administratifs. Vente directe = grosse marge, pas besoin de gros trafic |
| 2 | **Annonces mises en avant** (featured) | Stripe (paiement **ponctuel**, pas d'abonnement) | Audience naissante | Le prestataire paie une petite somme pour remonter en tête (accueil/recherche) pendant X jours. Champs `promoted` + `promotedUntil` **déjà prévus** dans le modèle |
| 3 | **Catégories / villes sponsorisées** | Non (direct) | Audience moyenne | « Cuisine à Milano présenté par X » — un partenaire sponsorise une section |
| 4 | **Affiliation** | Non (commission) | Audience moyenne | Liens affiliés utiles à la diaspora : cartes SIM, transfert d'argent, assurance → commission |
| 5 | **Google AdSense / display** | Non (Google paie) | Trafic élevé (plusieurs milliers de visites/j) | Passif mais ne rapporte qu'avec du volume. À activer quand le SEO ramène du monde |
| 6 | **Premium prestataire** (récurrent) | Stripe (abonnement) | Maturité (cf. cahier §16) | Badge premium, plus de photos, stats avancées, mise en avant permanente. L'abonnement n'arrive **qu'une fois la valeur prouvée** |

### Séquencement recommandé
1. **Lancement** → 0 monétisation. 100 % croissance, audience, SEO local (Milano, Roma…).
2. **1ʳᵉ audience locale** → **bannières en direct (#1)** + **mises en avant ponctuelles (#2)**. Ce sont les plus rentables tôt, sans gros trafic ni infrastructure lourde.
3. **À l'échelle** → sponsoring (#3), affiliation (#4), AdSense (#5).
4. **Maturité** → Premium prestataire (#6) — le seul abonnement, introduit en dernier.

### Hooks techniques à prévoir dès maintenant (coût quasi nul, évite une refonte)
- `Listing.promoted` + `promotedUntil` → **déjà au modèle (§4)**.
- Composant **`AdSlot`** : emplacements réservés (accueil, recherche, détail) pilotés par une table `Campaign` simple.
- `ContactEvent` / analytics → **déjà prévus** : mesurent vues et clics = argument de vente et facturation au CPM/clic pour les bannières.

> **Note importante** : les leviers #1, #3, #4, #5 n'introduisent **aucun flux de paiement sur la plateforme** (facturation hors-ligne ou gérée par Google) → on peut démarrer la monétisation **sans Stripe**. Stripe n'est nécessaire que pour #2 (mise en avant) et #6 (premium), à ajouter plus tard. correct
```



