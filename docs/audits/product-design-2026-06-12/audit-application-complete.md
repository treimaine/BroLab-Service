# Audit produit BroLab MVP - 12 juin 2026

## Perimetre

Audit combine UX, design, accessibilite et risques techniques sur l'application locale `http://localhost:3000`.

Surfaces verifiees:

- Hub public: `/`, `/pricing`, `/contact`
- Auth: `/sign-in`
- Storefront demo: `/tenant-demo`
- Routes protegees: `/studio`, `/studio/tracks`
- Lecture code: marketing shell, landing, marketplace, tenant storefront, onboarding, studio, Convex analytics/domains/beats

Destination: dossier local `docs/audits/product-design-2026-06-12/`.

## Captures acceptees

Les captures sont dans `docs/audits/product-design-2026-06-12/screenshots/`.

1. `01-home-desktop.png` - Home publique, pleine page
2. `02-pricing-desktop.png` - Pricing, pleine page
3. `04-contact-desktop.png` - Contact, pleine page
4. `05-sign-in-desktop.png` - Sign in Clerk
5. `07-tenant-demo-desktop.png` - Tenant demo, viewport
6. `09-studio-redirect-desktop.png` - Studio non authentifie, redirection sign-in
7. `10-studio-tracks-redirect-desktop.png` - Tracks non authentifie, redirection sign-in

Limite importante: le navigateur integre est devenu instable apres une capture longue. Je n'ai pas pu completer les captures viewport mobile ni inspecter les parcours authentifies sans compte de test.

## Liste des etapes et sante

1. Home publique - Sante faible
   Capture: `01-home-desktop.png`. La page rend un tres grand espace vide et la capture pleine page repete surtout le header/fond decoratif. Le contenu de proposition de valeur n'est pas visible de maniere fiable dans la preuve.

2. Pricing - Sante moyenne faible
   Capture: `02-pricing-desktop.png`. Le hero est lisible, mais il pousse fortement le contenu tarifaire sous le pli. Les cartes de prix dependent de Convex et risquent d'afficher longtemps un etat de chargement si les plans ne reviennent pas vite.

3. Contact - Sante moyenne
   Capture: `04-contact-desktop.png`. Le hero est propre et coherent avec le style, mais les actions de contact concretes ne sont pas visibles au premier ecran.

4. Auth sign-in - Sante moyenne
   Capture: `05-sign-in-desktop.png`. Clerk est fonctionnel et lisible, mais le style visuel est en rupture avec le reste. Le badge `Development mode` est normal localement, mais l'experience ne montre pas le contexte "createur / artiste".

5. Tenant demo - Sante faible
   Capture: `07-tenant-demo-desktop.png`. La capture acceptee est quasi vide, ce qui indique un rendu client/hydratation/animation instable ou une attente de montage. C'est critique car la demo est le principal support de conversion.

6. Routes studio protegees - Sante correcte cote securite, faible cote onboarding
   Captures: `09-studio-redirect-desktop.png`, `10-studio-tracks-redirect-desktop.png`. Les routes renvoient bien vers sign-in. En revanche, l'utilisateur non authentifie ne recoit pas d'explication contextualisee sur ce qu'il pourra faire apres connexion.

7. Backend Convex et donnees - Sante technique a surveiller
   Typecheck OK. Lint KO sur `test_x_api.mjs`. Plusieurs queries Convex utilisent `.collect()` ou filtrent en memoire, notamment dans `convex/modules/analytics.ts`, `convex/modules/beats.ts` et `convex/platform/domains.ts`.

## Forces

- La direction visuelle est distinctive: pixel type, cyan accent, glass surfaces, references musicales.
- Les routes protegees studio/artist passent par le middleware Clerk.
- Les flows coeur sont presents dans le code: onboarding role -> workspace -> Stripe, upload de tracks, services, checkout, analytics, custom domains.
- Le typecheck passe: `npm run typecheck` ne remonte pas d'erreur.

## Risques prioritaires

1. Visibilite above-the-fold insuffisante
   Sur les captures publiques, le ratio decoration/contenu est trop eleve. Les visiteurs doivent comprendre immediatement: "je lance mon storefront, je vends beats/services, je suis paye directement".

2. Demo tenant instable
   `/tenant-demo` devrait etre la preuve produit la plus concrete. La capture montre un rendu quasi vide, donc le parcours "View Demo" peut detruire la confiance.

3. Design system incoherent avec Tailwind 4
   `docs/DESIGN_SYSTEM.md` recommande `bg-bg`, `text-text`, `p-grid-*`, etc. Le CSS local definit surtout des variables et quelques utilitaires manuels. Plusieurs composants utilisent ces classes comme si elles etaient natives, ce qui peut provoquer des styles manquants ou incoherents.

4. Marketplace encore mockee
   `src/components/marketplace/MarketplaceBeatGrid.tsx` utilise `MOCK_BEATS`. Pour une app SaaS marketplace, cela doit soit etre assume comme demo, soit connecte a Convex avec un etat vide honnete.

5. Accessibilite partielle
   Beaucoup de boutons ont des labels, mais les grands titres pixel, faibles contrastes decoratifs, fixed headers repetes en capture pleine page, et tableaux/filters marketplace demandent un test clavier + lecteur d'ecran.

6. Convex a risque de read amplification
   Les queries analytics lisent des tables entieres avec `.collect()` et filtrent en memoire. Les guidelines Convex locales recommandent des collections bornees, des index, de la pagination ou des compteurs denormalises.

7. Lint bloque par un fichier hors surface produit
   `npm run lint` echoue sur `test_x_api.mjs` avec `process`/`console` non declares et variables inutilisees. Cela masque les vrais problemes lint de l'app.

## Recommandations

1. Corriger d'abord le rendu public et demo
   Verifier `/`, `/pricing`, `/contact`, `/tenant-demo` avec screenshots viewport desktop et mobile. Fixer tout contenu invisible, trop bas, ou dependant d'une animation de montage.

2. Reduire les heros marketing
   Garder l'identite ELECTRI-X, mais rendre la proposition de valeur et les CTAs visibles dans les 720 premiers pixels. Le hero pricing/contact ne devrait pas repousser le contenu principal aussi loin.

3. Stabiliser le systeme Tailwind
   Ajouter de vrais tokens Tailwind 4 via `--color-bg`, `--color-text`, `--color-muted`, `--color-accent`, `--spacing-grid-*`, etc., ou remplacer les classes non generees par les utilitaires CSS existants.

4. Transformer `/tenant-demo` en parcours d'achat credible
   Ajouter une grille visible above-the-fold, ouvrir une modale de licence sur `License Now`, montrer le player apres Play, et rendre les CTA services/contact navigables.

5. Remplacer les mocks marketplace
   Utiliser une query Convex publique paginee pour les beats publies, avec fallback demo clairement marque si aucune donnee n'existe.

6. Ameliorer l'auth contextuel
   Sur `/sign-in` et redirections studio, ajouter un bandeau ou un layout autour de Clerk qui rappelle l'objectif: "Connecte-toi pour gerer tes tracks, services, paiements et storefront".

7. Prioriser Convex performance
   Remplacer les `.collect()` non bornes par index + `.take()`, pagination, ou compteurs denormalises pour analytics, stats dashboard et domaines verifies.

8. Nettoyer la CI locale
   Exclure `test_x_api.mjs` du lint, le convertir en script Node correctement configure, ou le deplacer dans un dossier hors lint.

## Verification

- `npm run typecheck`: OK
- `npm run lint`: KO, 25 erreurs dans `test_x_api.mjs`
- Captures Browser: partielles mais suffisantes pour identifier les problemes critiques des surfaces publiques

