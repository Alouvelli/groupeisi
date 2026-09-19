# Groupe ISI – Site web Next.js 15 + Prisma + PostgreSQL + Redis + intégration ERP/CRM

Refonte du site **new.groupeisi.com** (WordPress / thème Univet) en **Next.js 15** (App Router, Server Components, Server Actions).

Le site reproduit fidèlement l'original : **charte graphique du thème Univet** (bleu `#07294D`, jaune `#FDC72F`, beige `#F6F4EE`, titres Bitter + texte Inter), **structure des pages et des menus**, et **contenu réel du site** (campus, formations, équipe, actualités, témoignages, FAQ, frais de scolarité, photos). Les anciennes URL WordPress sont redirigées vers les nouvelles routes.

Le projet ajoute par-dessus :

- un système complet de **pré-inscription en ligne** (formulaire 6 étapes, 30+ champs) ;
- une **intégration ERP/CRM bidirectionnelle** : client API configurable, queue BullMQ avec retry automatique (backoff exponentiel), webhooks signés HMAC, logs détaillés ;
- un **espace d'administration** : dashboard, gestion des inscriptions, CRUD programmes et actualités, messages, configuration ERP, dashboard des jobs, logs ;
- une stack entièrement **dockerisée** (PostgreSQL, Redis, PgAdmin, app, worker).

---

## Sommaire

1. [Stack technique](#stack-technique)
2. [Démarrage rapide](#démarrage-rapide)
3. [Variables d'environnement](#variables-denvironnement)
4. [Docker](#docker)
5. [Base de données (Prisma)](#base-de-données-prisma)
6. [Arborescence](#arborescence)
7. [Pages du site](#pages-du-site)
8. [Espace d'administration](#espace-dadministration)
9. [Intégration ERP / CRM](#intégration-erp--crm)
10. [Emails](#emails)
11. [Scripts npm](#scripts-npm)
12. [Tests réalisés](#tests-réalisés)
13. [Déploiement en production](#déploiement-en-production)
14. [Points à finaliser avec le Groupe ISI](#points-à-finaliser-avec-le-groupe-isi)

---

## Stack technique

| Domaine | Technologie |
|---|---|
| Framework | Next.js 15.5 (App Router, TypeScript, Server Components, Server Actions, Turbopack en dev) |
| ORM / BDD | Prisma 6 + PostgreSQL 16 |
| Queue | BullMQ 6 + Redis 7 (ioredis) |
| Style | Tailwind CSS 4, Framer Motion, lucide-react |
| Formulaires | react-hook-form + zod 4 |
| Emails | Resend (repli console si aucune clé) |
| Auth admin | bcryptjs + session signée HMAC (cookie httpOnly, vérifiée dans le middleware Edge) |
| API ERP | axios, signature HMAC-SHA256 des requêtes |
| Conteneurs | Docker + Docker Compose (PostgreSQL, Redis, PgAdmin, app, worker) |

---

## Démarrage rapide

```bash
# 1. Dépendances
npm install

# 2. Variables d'environnement
cp .env.example .env          # puis adapter les valeurs si besoin

# 3. Services Docker (PostgreSQL :5432, Redis :6379, PgAdmin :5050)
docker compose up -d

# 4. Prisma : client + schéma + données de démonstration
npx prisma generate
npx prisma db push
npm run db:seed

# 5. Application (terminal 1)
npm run dev                   # http://localhost:3000

# 6. Worker BullMQ – synchro ERP + emails (terminal 2)
npm run worker
```

Ou en une commande : `npm run setup` (install + docker + generate + push + seed).

**Comptes créés par le seed**

| Rôle | Email | Mot de passe |
|---|---|---|
| Super administrateur | `admin@groupeisi.com` (variable `ADMIN_EMAIL`) | `Admin@2026!` (variable `ADMIN_PASSWORD`) |
| Éditeur | `communication@groupeisi.com` | `Editeur@2026!` |

Espace admin : <http://localhost:3000/admin> · PgAdmin : <http://localhost:5050> (`admin@groupeisi.com` / `admin`, serveur « Groupe ISI (Docker) » préconfiguré).

---

## Variables d'environnement

Voir `.env.example` (copié vers `.env`).

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL (`postgresql://postgres:postgres@localhost:5432/groupeisi?schema=public`) |
| `REDIS_URL` | Connexion Redis (`redis://localhost:6379`) |
| `QUEUE_PREFIX` | Préfixe des clés BullMQ (`groupeisi`) |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site (liens dans les emails, sitemap, webhooks) |
| `AUTH_SECRET` | Secret de signature des sessions admin (32+ caractères aléatoires) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte super admin créé par le seed |
| `RESEND_API_KEY` / `EMAIL_FROM` | Envoi d'emails (sans clé : les emails sont affichés dans la console) |
| `ADMIN_NOTIFICATION_EMAIL` | Destinataire des notifications (nouvelles inscriptions, échecs ERP) |
| `ERP_BASE_URL`, `ERP_API_KEY`, `ERP_API_SECRET`, `ERP_WEBHOOK_SECRET`, `ERP_TIMEOUT_MS` | Valeurs ERP par défaut, **surchargées par la configuration saisie dans `/admin/settings`** |
| `POSTGRES_*`, `REDIS_PORT`, `PGADMIN_*`, `APP_PORT` | Ports et identifiants des conteneurs Docker |

---

## Docker

`docker-compose.yml` définit :

| Service | Image | Port | Rôle |
|---|---|---|---|
| `postgres` | postgres:16-alpine | 5432 | Base de données (volume `postgres_data`, extensions `uuid-ossp` et `pg_trgm`) |
| `redis` | redis:7-alpine | 6379 | Broker BullMQ (AOF activé, `noeviction`) |
| `pgadmin` | dpage/pgadmin4 | 5050 | Administration BDD (serveur préconfiguré via `docker/pgadmin/servers.json`) |
| `app` *(profil `app`)* | build `Dockerfile` cible `runner` | 3000 | Next.js en mode standalone, `prisma db push` au démarrage |
| `worker` *(profil `app`)* | build `Dockerfile` cible `worker` | – | Worker BullMQ (`src/worker.ts`) |

```bash
docker compose up -d                    # infra seulement (dev local avec npm run dev + npm run worker)
docker compose --profile app up -d --build   # stack complète conteneurisée
docker compose logs -f worker           # suivre le worker
```

> Note : le daemon Docker n'était pas disponible dans l'environnement de développement de ce dépôt ; la stack a été validée avec PostgreSQL 16 et Redis 7 locaux. Les images `app` et `worker` sont à valider lors du premier `docker compose --profile app build`.

---

## Base de données (Prisma)

`prisma/schema.prisma` – 19 modèles demandés + 2 modèles utilitaires :

| # | Modèle | Rôle |
|---|---|---|
| 1 | `SiteSettings` | Paramètres du site (coordonnées, réseaux, hero, chiffres clés, SEO, ouverture des inscriptions, options de rentrée) |
| 2 | `NavigationItem` | Menu header / footer (hiérarchique, méga-menu) |
| 3 | `Departement` | Départements (Génie Informatique, Réseaux & Systèmes, Management, Formation continue) |
| 4 | `Programme` | Formations (niveau, durée, semestres, crédits, volume horaire, unités d'enseignement JSON, objectifs, débouchés, frais annuels / inscription / mensualité, accréditation, `erpCode`) – relation N-N avec `Campus` |
| 5 | `Campus` | Campus et annexes (zone, adresse, contacts, direction, mission/vision, chiffres, équipements, carte, `erpCode`) |
| 6 | `Post` | Actualités |
| 7 | `CategorieActualite` | Catégories d'actualités |
| 8 | `Evenement` | Événements (agenda) |
| 9 | `Personne` | Équipe (direction, enseignants, administration) |
| 10 | `Alumni` | Anciens étudiants |
| 11 | `Partenaire` | Partenaires (logos) |
| 12 | `Inscription` | Pré-inscriptions : identité, contact, parcours, formation, tuteur, divers, suivi interne **+ champs ERP** (`erpSyncStatus`, `erpProspectId`, `erpContactId`, `erpSyncedAt`, `erpLastError`, `erpAttempts`, `erpJobId`) |
| 13 | `Document` | Téléchargements |
| 14 | `Testimonial` | Témoignages |
| 15 | `FAQ` | Questions fréquentes |
| 16 | `User` | Utilisateurs admin (rôles `SUPER_ADMIN`, `ADMIN`, `EDITEUR`) |
| 17 | `ERPConfig` | Configuration ERP (URL, clé, secrets, endpoints, options de sync, retry, notification, état du dernier test) |
| 18 | `ERPLog` | Journal détaillé de chaque appel sortant / webhook entrant (payloads, code HTTP, durée, tentative, job) |
| 19 | `ERPMapping` | Correspondance inscription ↔ entité ERP (type, id, url, statut ERP, direction de la dernière synchro) |
| + | `ContactMessage` | Messages du formulaire de contact |
| + | `NewsletterSubscriber` | Abonnés newsletter |

Commandes : `npm run db:push`, `npm run db:seed`, `npm run db:studio`, `npm run db:reset` (réinitialise et reseed).

---

## Arborescence

```
├── docker-compose.yml / Dockerfile / docker/       # infrastructure
├── prisma/schema.prisma · prisma/seed.ts           # modèles + contenu du site
├── prisma/data/actualites.json                      # actualités extraites de new.groupeisi.com
├── public/media/                                    # visuels du site (photos, logos, affiches)
├── public/                                          # logos partenaires, documents PDF
└── src/
    ├── app/
    │   ├── (site)/                                  # pages publiques (layout Header/Footer)
    │   ├── admin/login · admin/(dashboard)/         # espace d'administration
    │   ├── actions/                                 # Server Actions (inscriptions, contact, newsletter, auth, admin…)
    │   ├── api/webhooks/erp · api/health · api/admin/jobs · api/admin/inscriptions/export
    │   ├── avatars/[file]                           # avatars SVG générés localement
    │   ├── sitemap.ts · robots.ts · layout.tsx · globals.css
    ├── components/
    │   ├── layout/   Header, Footer, BaseLayout, BackToTop, WhatsAppButton
    │   ├── sections/ Hero, StatsBar, WhyChoose, Departements, Programmes, Campus, News, Events,
    │   │             Testimonials, Team, Alumni, Gallery, Partners, PreInscriptionCTA
    │   ├── cards/    DepartmentCard, ProgramCard, CampusCard, NewsCard, EventCard, TestimonialCard,
    │   │             PartenaireLogo, StatCard, TeamCard, AlumniCard, DocumentCard
    │   ├── ui/       Section, Container, Button, Card, Badge, Breadcrumb/PageHeader, Pagination,
    │   │             Accordion, Tabs, Modal, Carousel, Reveal, Counter, Icon, SocialLinks
    │   ├── forms/    PreInscriptionForm, ContactForm, NewsletterForm, LoginForm
    │   └── admin/    AdminShell, JobsDashboard, SettingsForms, ProgrammeForm, PostForm, …
    ├── lib/
    │   ├── prisma.ts      client Prisma singleton
    │   ├── erp-client.ts  client API ERP (HMAC, logs, erreurs retryable / définitives)
    │   ├── erp-sync.ts    traitement des jobs de synchronisation + notification d'échec
    │   ├── queue.ts       BullMQ : queues, options de retry, helpers dashboard, fabrique de workers
    │   ├── email.ts       Resend + templates HTML (confirmation, admin, alerte ERP, contact, statut)
    │   ├── auth.ts · session-token.ts   authentification admin
    │   ├── validations.ts schémas zod (inscription 30+ champs, contact, newsletter, login, ERP, programme, article, paramètres)
    │   ├── data.ts        requêtes des pages publiques
    │   └── constants.ts · utils.ts · env.ts
    ├── fonts/             Bitter et Inter auto-hébergées (woff2)
    ├── middleware.ts      protection /admin et /api/admin
    └── worker.ts          point d'entrée du worker BullMQ
```

---

## Pages du site

Les routes reprennent celles de new.groupeisi.com (les anciennes URL WordPress sont redirigées en 308 – voir `next.config.ts`).

| Route | Contenu |
|---|---|
| `/` | Accueil : barre supérieure, header avec méga-menu « Formations » et panneau latéral, diaporama d'affiches, accès rapides (Admission / Brochure / Préinscription), « à propos du Groupe ISI » (onglets Mission · Vision · Valeurs + chiffres clés), Programmes & Formations, « Les inscriptions sont ouvertes » (formulaire), Nos chefs de département, Campus & Annexes, Évènements, bande « Vie estudiantine », témoignages, actualités, bande galerie + pied de page |
| `/a-propos` | À propos de ISI, citation du président, chiffres, Notre Vision, encarts, « Les 72H du Groupe ISI », témoignages, galerie |
| `/a-propos/histoire` | Histoire du groupe et frise des distinctions (Gov'athon, Quality Achievements Awards, académies Huawei et Cisco…) |
| `/a-propos/administration` | Répertoire administratif : personnels fréquemment contactés, direction, responsables de campus |
| `/a-propos/localisation` | Les 14 implantations avec carte Google Maps, site propre du campus, groupées par zone (Dakar, annexes, régions, Mauritanie) |
| `/mot-du-president` | Mot d'Abdou Sambe, président du Groupe ISI + galerie |
| `/formations`, `/formations/[slug]` | Catalogue filtrable (campus, départements, niveaux, recherche) + fiche formation (sommaire ancré, détails du programme, unités d'enseignement, coût & modalités, admissions, demande d'information, JSON-LD `Course`) |
| `/departements`, `/departements/[slug]` | Les 4 départements + fiche (présentation, contact, formations par niveau, équipe) |
| `/campus`, `/campus/[slug]` | Campus & annexes + fiche (direction, mission/vision, chiffres, équipements, carte, formations, équipe, événements, galerie) |
| `/frais-d-etudes` | Grille tarifaire par cycle (coût annuel, droits d'inscription, mensualité), FAQ et formulaire |
| `/condition-admission` | Exigences, pièces à fournir, procédure en 4 étapes, profils, FAQ |
| `/preinscription`, `/preinscription/confirmation` | Formulaire 6 étapes (identité, coordonnées, parcours, formation, tuteur, finalisation), brouillon en `localStorage`, honeypot, page de confirmation avec numéro de dossier |
| `/actualites`, `/actualites/[slug]` | Liste paginée avec catégories, recherche et articles récents + article (JSON-LD `NewsArticle`) |
| `/evenements`, `/evenements/[slug]` | Agenda (à venir / passés) + fiche (ajout à Google Agenda, carte, JSON-LD `Event`) |
| `/alumnis`, `/alumni/[slug]` | Réseau alumni (communauté mondiale, portraits, événements, galerie, actualités) + portrait |
| `/equipe`, `/equipe/[slug]` | Direction, chefs de département, administration + fiche |
| `/formation-en-ligne` | Offre à distance (FOAD) : licences, masters et certificats en ligne, accès à la plateforme e-learning, arguments et contacts |
| `/temoignages` | Interviews vidéo (YouTube) et témoignages écrits |
| `/galerie` | Galerie filtrable par catégorie avec visionneuse |
| `/librairie` | Collections, chiffres clés, documents à télécharger, actualités |
| `/faq` | FAQ par catégorie (accordéon, JSON-LD `FAQPage`) |
| `/contact` | Coordonnées (email, téléphone, adresse, carrière), formulaire, carte et tous les campus |
| `/telechargements` | Documents PDF par type |
| `/mentions-legales`, `/confidentialite` | Pages légales |
| `404` | Page introuvable personnalisée |
| `/sitemap.xml`, `/robots.txt` | SEO (métadonnées Open Graph / Twitter sur toutes les pages) |

### Fidélité au site d'origine

- **Charte** : couleurs et typographies extraites du kit Elementor et du thème Univet ; polices Bitter et Inter auto-hébergées (`src/fonts/`).
- **Composants** : header deux niveaux, méga-menu, panneau latéral, cartes formation / campus / équipe / événement / actualité / témoignage, accordéons, onglets et pied de page reprennent la structure du thème.
- **Contenu** : campus, départements, 26 formations (durée, crédits, volume horaire, unités d'enseignement, frais), équipe, alumni, témoignages, FAQ et 18 actualités réelles proviennent du site ; les textes des actualités sont extraits dans `prisma/data/actualites.json`.
- **Images** : 100 visuels du site sont téléchargés, redimensionnés et servis depuis `public/media/` (aucune dépendance à new.groupeisi.com en production).
- **Redirections** : `/programs/:slug`, `/faculties/:slug`, `/blog-grid`, `/contact-2`, `/apply-now`, `/frais-etudes`, `/2025/01/10/:slug`… redirigent vers les routes correspondantes.

## Chatbot institutionnel

Un assistant flottant répond aux questions des visiteurs à partir du contenu du site, avec des sources cliquables. Il n'y a **pas d'entraînement** : c'est de la génération augmentée par la recherche, la fraîcheur vient de l'index, reconstruit depuis la base de données.

### Fonctionnement

| Étape | Où | Ce qui se passe |
|---|---|---|
| Corpus | `src/lib/rag/corpus.ts` | Le contenu est lu depuis Prisma — formations, campus, départements, équipe, actualités, évènements, questions fréquentes, témoignages, alumni, documents, réglages — et découpé en passages portant chacun l'URL de sa page. S'y ajoutent les connaissances écrites dans les composants : plan du site, procédure de préinscription, conditions d'admission, offre à distance, vie étudiante. |
| Index | `src/lib/rag/recherche.ts` | Recherche BM25 en mémoire, adaptée au français : repli des accents, désuffixation, mots vides, et un lexique de synonymes du domaine qui rapproche « c'est cher comment » de « frais de scolarité ». |
| Récupération | `src/lib/rag/base.ts` | L'index se reconstruit toutes les quinze minutes. La question est enrichie du tour précédent, les résultats sont réordonnés selon le niveau nommé (« master data science » privilégie les masters) et une même page ne fournit pas plus de deux tranches. |
| Génération | `src/lib/rag/reponse.ts` | Les dix meilleurs passages sont numérotés et remis à `claude-opus-5` via le SDK Anthropic, en flux continu. La consigne interdit d'affirmer quoi que ce soit hors des extraits et impose de citer les numéros employés. |
| Route | `src/app/api/chat/route.ts` | Diffuse la réponse en JSON délimité par des sauts de ligne, puis les sources déduites des citations réellement présentes. |
| Interface | `src/components/chat/` | Bulle flottante, panneau de conversation, questions suggérées, sources cliquables, interruption possible. L'assistant connaît la page consultée. |

### Configuration

`ANTHROPIC_API_KEY` dans `.env`. **Sans cette clé, l'assistant reste utile** : la recherche fonctionne de toute façon et il répond en mode documentaire, en restituant les passages trouvés au lieu de les faire rédiger.

Deux garde-fous : la limitation de débit par adresse (douze questions par minute, quatre-vingts par heure) dans `src/lib/rag/quota.ts`, et la validation du corps de requête avant tout appel facturé.

### Mesure

```bash
npx tsx scripts/evaluer-rag.ts                    # rappel de la recherche sur 24 questions types
npx tsx scripts/inspecter-prompt.ts "votre question"   # passages retenus et contexte envoyé au modèle
```

L'évaluation vérifie qu'un passage attendu remonte pour chaque question. Dernier relevé : **100 % de rappel dans les cinq premiers résultats**, 96 % dans les trois premiers, 79 % en première position, pour une recherche à 0,6 ms.

---

### Couche de mouvement

Les primitives vivent dans `src/components/motion/`, les jetons partagés (courbes, durées, cascades) dans `src/lib/motion.ts`.

| Primitive | Effet |
|---|---|
| `Reveal`, `Stagger`, `StaggerChildren` | Apparition au défilement, en série pour les grilles de cartes. `StaggerChildren` enveloppe automatiquement ses enfants, sans toucher aux cartes. |
| `AnimatedHeading` | Titre dont les mots montent en cascade derrière une ligne de masque. Le texte reste un seul nœud pour les lecteurs d'écran (`aria-label`). |
| `Parallax` | Parallaxe verticale amortie par un ressort. |
| `ImageReveal` | Visuel dévoilé par un voile qui glisse, avec désagrandissement lent. |
| `Magnetic`, `Tilt` | Attraction vers le curseur et inclinaison légère, uniquement sur pointeur fin. |
| `ReadingProgress` | Barre de progression sur les pages longues. |
| `PageTransition` | Transition d'entrée, montée par `src/app/(site)/template.tsx`. |

S'y ajoutent le zoom lent du diaporama d'accueil, l'en-tête qui se compacte au défilement, l'élévation des cartes et des boutons au survol, et le bloc « Actualités & agenda » à onglets.

**Accessibilité.** `MotionProvider` applique `MotionConfig reducedMotion="user"` : framer-motion neutralise alors déplacements et mises à l'échelle pour qui a demandé moins d'animations, l'opacité restant animée. Aucune primitive ne change la structure du DOM selon cette préférence, ce qui évite toute erreur d'hydratation.

### Densité

`section-y` donne le rythme vertical commun, `rail` transforme les grilles de cartes en carrousel à défilement horizontal sous 1024 px. Effet mesuré sur l'accueil :

| Largeur | Avant | Après |
|---|---|---|
| 1440 px | 10 658 px | 8 491 px |
| 390 px | 18 513 px | 10 648 px |

### Sources de contenu

Trois sites du Groupe ISI ont servi de référence :

| Source | Rôle |
|---|---|
| `new.groupeisi.com` | Référence de **design** (thème Univet / Elementor) et de structure : mise en page, composants, routes, visuels. |
| `groupeisi.com` (site en vigueur) | Référence de **données** : coordonnées, organigramme, sites propres des campus, menu des départements, offre FOAD, distinctions et cellule COIP, actualités récentes. |
| `test.groupeisi.com` | Référence de **fiches formation** : objectifs, compétences, débouchés, conditions d'admission et unités d'enseignement, ainsi que l'organigramme et ses photos. |

Les contenus extraits sont versionnés dans des fichiers de données relus par le seed :

- `prisma/data/actualites.json` — 18 actualités (titre, extrait, contenu HTML, images, catégorie, date).
- `prisma/data/programmes-details.json` — fiches détaillées de 25 formations, régénérables avec `node scripts/normaliser-programmes.mjs` (suppression des phrases d'amorce, éclatement des puces collées, réparation des mots recollés par l'export Elementor).

Quand le site de référence et la fiche détaillée divergent, la liste la plus complète l'emporte ; les compétences et les conditions d'admission viennent toujours de la fiche d'origine. Le rattachement de chaque formation à son département suit le menu de `groupeisi.com` et les pages département de `test.groupeisi.com`.

> Deux libellés du pied de page de l'original (« About Univet », « Univet Library ») sont des restes du thème de démonstration : ils ont été remplacés par « À propos » et « Librairie », qui pointent vers les mêmes pages. Ils restent modifiables depuis `/admin`.

---

## Espace d'administration

Accès : `/admin` (redirection vers `/admin/login` si non connecté ; le middleware vérifie la signature du cookie de session).

| Route | Fonction |
|---|---|
| `/admin` | Dashboard : compteurs (inscriptions, nouvelles, semaine, acceptées, synchronisées, échecs ERP, messages, articles), dernières inscriptions, état du système (BDD, Redis, ERP, queue), derniers logs |
| `/admin/inscriptions` | Liste filtrable (statut, sync ERP, campus, formation, recherche), pagination, **export CSV** |
| `/admin/inscriptions/[id]` | Dossier complet, changement de statut avec notification email au candidat, notes internes, **resynchronisation ERP manuelle**, mapping et historique des appels |
| `/admin/programmes` (+ `new`, `[id]`) | CRUD complet (activer / mettre à la une / supprimer, campus rattachés, frais, code ERP) |
| `/admin/actualites` (+ `new`, `[id]`) | CRUD complet (publication, catégorie, tags, image) |
| `/admin/messages` | Messages de contact (lu / traité / répondre / supprimer) |
| `/admin/settings` | Onglet **Intégration ERP / CRM** : URL, clé API, en-tête d'auth, secrets HMAC, endpoints, options de sync (inscriptions, prospects, contacts, newsletter), retry, notification, **bouton « Tester la connexion »**, URL du webhook à copier, format des requêtes. Onglet **Site & contenu** : coordonnées, réseaux, hero, bandeau, année académique, options de rentrée, ouverture des inscriptions, chiffres clés, SEO |
| `/admin/jobs` | Dashboard BullMQ : compteurs waiting / active / completed / failed / delayed par queue, liste des jobs (filtres), détail (données, résultat, erreur, stack), **retry manuel**, retry de tous les échoués, suppression, nettoyage, pause/reprise, resynchronisation des inscriptions en échec, **rafraîchissement auto toutes les 5 s** (`/api/admin/jobs`) |
| `/admin/logs` | Journal ERP filtrable (statut, direction, action) avec visualisation des payloads requête / réponse |

---

## Intégration ERP / CRM

### Flux sortant (site → ERP)

1. Une pré-inscription est soumise (`src/app/actions/inscriptions.ts`) : validation zod, numéro de dossier séquentiel `ISI-AAAA-00001`, anti-doublon 24 h, enregistrement en base.
2. Un job `inscription.create` est ajouté à la queue **`erp-sync`** (BullMQ). Les emails (confirmation candidat + notification admin) partent via la queue **`emails`** (repli : envoi direct si Redis est indisponible).
3. Le worker (`npm run worker`) charge la configuration (`ERPConfig` en base, repli `.env`), construit le payload prospect et appelle `POST {baseUrl}{endpointProspects}` via `src/lib/erp-client.ts` :
   - en-têtes `Authorization: Bearer <apiKey>` (ou en-tête personnalisé), `X-Timestamp`, `X-Signature` = HMAC-SHA256(`timestamp.body`, `apiSecret`), `X-Request-Id` ;
   - chaque appel est journalisé dans `ERPLog` (payload, réponse, code, durée, tentative, job).
4. Succès → `Inscription.erpSyncStatus = SYNCED`, `erpProspectId`, `erpContactId`, création/mise à jour de `ERPMapping`.
5. Échec **retryable** (réseau, timeout, 5xx, 408, 429) → nouvelle tentative avec **backoff exponentiel** (5 s, 10 s, 20 s – 3 tentatives par défaut, configurable). Échec **définitif** (4xx, données invalides) → pas de retry (`UnrecoverableError`).
6. Après la dernière tentative : `erpSyncStatus = FAILED`, log d'erreur, **email d'alerte à l'administrateur** (`notifyEmail`). Le job reste visible dans `/admin/jobs` pour une relance manuelle.
7. Les changements de statut dans l'admin déclenchent `inscription.update` (`PUT {endpointProspects}/{erpId}`). Les messages de contact (`contact.create`) et abonnés newsletter (`newsletter.subscribe`) sont envoyés sur `{endpointContacts}` si l'option correspondante est activée.

Payload prospect (extrait) :

```json
{
  "externalId": "cmu…", "reference": "ISI-2026-00042",
  "civilite": "Monsieur", "prenom": "Fatou", "nom": "Diop",
  "email": "…", "telephone": "…", "dateNaissance": "2006-03-15",
  "adresse": "…", "ville": "Dakar", "pays": "Sénégal",
  "niveauEtudes": "Baccalauréat", "serieBac": "S2", "anneeBac": 2025,
  "programme": { "id": "…", "code": "PROG-MASTER_GENIE_LOGICIEL", "titre": "Master Génie Logiciel", "niveau": "Master" },
  "campus": { "id": "…", "code": "CAMP-DAKAR_SACRE_COEUR", "nom": "ISI Dakar – Sacré-Cœur (Siège)" },
  "niveauEntree": "1ère année", "rentree": "Octobre 2026", "modeFormation": "Cours du soir",
  "tuteur": { "nom": "…", "telephone": "…", "email": null, "lien": "Père" },
  "source": "Site web / Google", "besoinBourse": true, "statut": "NOUVELLE",
  "tags": ["site-web", "pre-inscription", "master"]
}
```

Réponse attendue de l'ERP : `{ "id": "PRS-123", "contactId": "CNT-456", "url": "https://erp/…", "status": "new" }` (les variantes `data.id`, `prospect_id`, etc. sont acceptées).

### Flux entrant (ERP → site) – `POST /api/webhooks/erp`

- Signature vérifiée en **HMAC-SHA256** (en-tête `X-Signature`, secret « webhookSecret ») sur le corps brut ou sur `timestamp.body` (`X-Timestamp`) ; comparaison en temps constant ; préfixe `sha256=` accepté.
- Corps : `{ "event": "…", "id": "evt_…", "data": { … } }`. L'inscription est retrouvée par `externalId`, `reference` (numéro), id ERP ou email.

| Événement | Effet |
|---|---|
| `ping` | Test de bout en bout |
| `prospect.created`, `prospect.updated` | Rattache / met à jour l'ID ERP, le contact, l'URL et le statut ERP (`ERPMapping`) |
| `prospect.deleted` | Supprime le mapping, `erpSyncStatus = SKIPPED` |
| `inscription.processing` / `accepted` / `confirmed` / `rejected` / `cancelled` | Met à jour le statut du dossier (+ email au candidat sauf `"notify": false`) |
| `contact.created` | Marque le message de contact comme synchronisé |

Exemple :

```bash
BODY='{"event":"inscription.confirmed","data":{"reference":"ISI-2026-00007","status":"enrolled"}}'
SIG=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$ERP_WEBHOOK_SECRET" | awk '{print $2}')
curl -X POST https://www.groupeisi.com/api/webhooks/erp -H "Content-Type: application/json" -H "X-Signature: $SIG" -d "$BODY"
```

### Configuration

Tout se règle dans **`/admin/settings`** (onglet ERP) : activation, URL, clé, secrets (masqués, conservés si laissés à `********`), endpoints, options de synchronisation, nombre de tentatives et délai, email de notification. Le bouton **Tester la connexion** appelle `GET {endpointHealth}` et enregistre le résultat.

### Supervision

- `/admin/jobs` : dashboard BullMQ temps réel (auto-refresh 5 s), retry manuel, purge, pause.
- `/admin/logs` : tous les appels sortants et webhooks entrants avec payloads.
- `/api/health` : état BDD / Redis / ERP (pour un monitoring externe).

---

## Emails

Templates HTML dans `src/lib/email.ts` : confirmation de pré-inscription (numéro de dossier, récapitulatif, prochaines étapes), notification admin (lien vers le dossier), alerte d'échec ERP, accusé de réception contact, notification admin contact, changement de statut du dossier. Envoi via **Resend** ; sans `RESEND_API_KEY`, les emails sont journalisés dans la console (utile en développement). Les envois passent par la queue `emails` (5 tentatives) avec repli en envoi direct.

---

## Scripts npm

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur de développement (Turbopack) |
| `npm run build` / `npm start` | Build de production (`prisma generate && next build`) / démarrage |
| `npm run worker` / `npm run worker:watch` | Worker BullMQ |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:generate` · `db:push` · `db:migrate` · `db:seed` · `db:studio` · `db:reset` | Prisma |
| `npm run docker:up` · `docker:down` · `docker:logs` | Docker Compose |
| `npm run setup` | Installation complète |

---

## Tests réalisés

- `npm run lint` : 0 erreur · `npm run typecheck` : OK · `npm run build` : OK.
- Base PostgreSQL 16 locale, `npm run db:push` puis `npm run db:seed` : 14 campus, 4 départements, 26 formations, 18 actualités, 12 membres de l'administration, 11 témoignages, 8 questions FAQ.
- Rendu vérifié en production (`npm start`) : toutes les pages publiques et l'espace admin répondent en HTTP 200, `/sitemap.xml` liste 80 URL.
- Redirections des anciennes URL WordPress vérifiées (308 vers la route correspondante).
- Rendu comparé au site d'origine en 1440 px et en 390 px (aucun débordement horizontal).
- Audit Playwright de 36 pages en 1440 px et 390 px : aucun débordement, aucune erreur JavaScript, aucune réponse HTTP ≥ 400.

---

## Déploiement en production

1. Renseigner `.env` (secrets forts pour `AUTH_SECRET`, `ERP_*`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`).
2. `docker compose --profile app up -d --build` : PostgreSQL, Redis, app (port 3000) et worker. L'app applique le schéma (`prisma db push`) au démarrage.
3. Exécuter le seed une fois : `docker compose exec worker npx tsx prisma/seed.ts` (ou `npm run db:seed` depuis un poste ayant accès à la base).
4. Placer un reverse proxy (Nginx / Traefik / Caddy) avec HTTPS devant le port 3000 et déclarer l'URL `https://<domaine>/api/webhooks/erp` dans l'ERP.
5. Surveiller `/api/health` et `/admin/jobs`.

---

## Points à finaliser avec le Groupe ISI

Le site de référence `new.groupeisi.com` n'était pas accessible depuis l'environnement de développement (blocage réseau). La structure, les sections et le style suivent le thème Univet et les informations publiques du Groupe ISI ; les éléments suivants sont **à vérifier / remplacer** dans `/admin/settings`, `/admin/programmes` ou `prisma/seed.ts` :

- **Coordonnées** (téléphones, adresses des campus, emails) : valeurs de démonstration à confirmer.
- **Photos** : URLs Unsplash de démonstration (`images.unsplash.com`, autorisées dans `next.config.ts`) à remplacer par les visuels officiels ; les logos ISI et partenaires sont des SVG génériques dans `public/`.
- **Contenus** (textes des programmes, frais de scolarité, équipe, alumni, témoignages, événements, actualités) : rédigés à partir des informations publiques, à valider.
- **Documents PDF** dans `public/documents/` : fichiers de substitution à remplacer.
- **Couleurs** (`src/app/globals.css`, bloc `@theme`) : bleu `#0b2a5b`, orange `#f26522`, jaune `#ffb400` – ajustables pour coller exactement à la charte.
