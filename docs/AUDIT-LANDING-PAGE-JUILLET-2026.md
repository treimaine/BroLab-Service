# Audit Landing Page — BroLab Entertainment

**Date :** 22 juillet 2026
**Périmètre :** `app/(hub)/page.tsx` → `HubLandingPageClient` (13 sections) + design system `src/platform/ui`
**Méthode :** lecture du code + inspection runtime (localhost:3000) à 375 / 843 / 1440 px, thèmes clair et sombre
**Statut :** audit — aucune modification de code appliquée

---

## 0. Résumé exécutif

| Sévérité | Nombre | Impact |
|---|---|---|
| 🔴 Bloquant | 1 | Le design system ne s'affiche pas (272 déclarations CSS invalides) |
| 🟠 Majeur | 6 | Collisions de texte, header mobile illisible, 0 preuve sociale |
| 🟡 Moyen | 8 | Hiérarchie, redondance de sections, SEO |

**Le point clé :** la demande « plus de contraste » n'est pas un problème de goût. C'est un **bug CSS**. Toutes les cartes, bordures et glows du site sont invisibles parce que leur couleur est écrite dans une syntaxe que le navigateur rejette. Corriger ce seul bug transforme la page avant même de toucher au design.

---

## 1. 🔴 BLOQUANT — Syntaxe `rgba(var(--token), alpha)` invalide

### Le problème

Les tokens sont stockés en canaux séparés par des espaces :

```css
:root { --bg-2: 236 245 255; --border: 15 23 42; }
```

Et consommés ainsi, partout :

```css
.glass {
  background: rgba(var(--bg-2), 0.6);                        /* → rgba(236 245 255, 0.6) */
  border: 1px solid rgba(var(--border), var(--border-alpha)); /* → rgba(15 23 42, 0.12)   */
}
```

Après substitution, on obtient `rgba(236 245 255, 0.6)` : **canaux séparés par des espaces + alpha séparé par une virgule**. Cette forme hybride n'existe dans aucune spec CSS. Le navigateur **rejette la déclaration entière**.

Vérifié en runtime :

```js
CSS.supports('color', 'rgba(236 245 255, 0.6)')   // false  ← la syntaxe utilisée
CSS.supports('color', 'rgb(236 245 255 / 0.6)')   // true   ← la syntaxe correcte
```

### Preuve mesurée

Sur une carte « HOW IT WORKS » (`class="… rounded-2xl glass p-8 …"`) :

| Propriété | Attendu | Calculé réellement |
|---|---|---|
| `background-color` | `rgba(236,245,255,.6)` | `rgba(0, 0, 0, 0)` — transparent |
| `border` | `1px solid rgba(15,23,42,.12)` | `0px none` — inexistant |
| `box-shadow` | glow accent | `none` |
| `backdrop-filter` | `blur(14px)` | `blur(14px)` ✅ (seule déclaration valide de la règle) |

`backdrop-filter` passe, les autres tombent : la preuve que la règle est bien appliquée mais que ces trois déclarations sont invalides.

### Ampleur

```
272 occurrences  de rgba(var(--…), …)
 58 fichiers     concernés
```

Top fichiers : `app/globals.css` (20), `LandingSections.tsx` (18), `AboutPageClient.tsx` (13), `ContactPageClient.tsx` (12), `PricingPageClient.tsx` (8), `OnboardingClient.tsx` (8), `tenant-demo/page.tsx` (8), tout `platform/ui/dribbble/audio/*`, `PillCTA`, `TrustBadges`, `ArtistDashboard`…

Sur la seule landing page : **41 éléments** avec `style` inline cassé + **68 éléments** avec classe Tailwind arbitraire cassée.

### Ce qui est cassé, concrètement

- `.glass` → **36 cartes sans fond ni bordure** sur la landing page
- `.glow`, `.glow-accent`, `.glow-strong` → aucun glow ne s'affiche
- `.outline-word`, `.outline-hero` → contour de texte absent
- `.border-border` → toutes les bordures « design system » à 0
- `bg-[rgba(var(--accent),0.15)]` → les 12 pastilles d'icônes n'ont pas de fond teinté
- Les `radial-gradient(… rgba(var(--accent), .08) …)` décoratifs
- **Impact hors landing :** storefronts tenants, dashboard Studio, onboarding, lecteur audio, pricing, about, contact

### Correctif

Remplacer partout `rgba(var(--x), A)` par `rgb(var(--x) / A)`. Purement mécanique, régexp-able, zéro changement de valeur visuelle intentionnelle.

```
rgba\(var\((--[a-z0-9-]+)\),\s*([^)]+)\)   →   rgb(var($1) / $2)
```

**Recommandation complémentaire :** ajouter des utilitaires (`.surface`, `.surface-strong`) plutôt que de laisser 272 appels bruts se disperser, pour que ce type de régression ne puisse pas se reproduire silencieusement.

---

## 2. 🟠 MAJEUR — Bugs de layout confirmés

### 2.1 Collision hero : le `<h1>` passe sous le module latéral

À partir de `xl` (1280px), `MicroInfoModule` est positionné en `absolute` à droite, **sans réserver d'espace**. Mesuré à 1440px :

- `<h1>` : x 376 → **1048**
- `MicroInfoModule` : x **1000** → 1260, y 379

→ 48 px de recouvrement. Le module est au-dessus (`z-30` contre `z-10`) : **« Sell your music » est amputé du « r »**. Visible sur les deux thèmes.

`src/components/hub/HeroSection.tsx:172`

### 2.2 Header mobile illisible (375px)

Trois collisions simultanées :
- « BROLAB » (tracking `0.4em`) chevauche l'icône `ThemeToggle`
- « Dashboard » chevauche « BROLAB »
- Résultat lu à l'écran : `B R O L☾ A BDashboard`

`HeroSection.tsx:131-145` — `TopMinimalBar` n'a pas de stratégie de repli sous `sm`.

### 2.3 `EditionBadge` recouvre le texte de réassurance (mobile)

`absolute bottom-12 left-0` sur le badge, contre le flux du `HeroCopy` → « No credit card • Cancel anytime » devient « …edit card • Cancel anytime ».

`HeroSection.tsx:167`

### 2.4 Hero : ~40 % de hauteur vide

`<section min-h-screen>` contient `<div min-h-screen>` contenant `<div min-h-[75vh]>`. Triple contrainte de hauteur → sur mobile, ~300 px de vide sous le CTA ; sur desktop, ~180 px. Aucun indice de scroll.

`HeroSection.tsx:109 / 147 / 149`

### 2.5 Quatre `<h1>` dans le DOM, deux visibles

`HeroTitle` et `HeroCopy` sont chacun rendus **deux fois** (bloc `hidden lg:block` + bloc `lg:hidden`). Et `OutlineStackTitle` a `as = 'h1'` par défaut, non surchargé.

DOM réel : `h1 "LAUNCH"` ×2, `h1 "Launch your store…"` ×2. Deux sont visibles simultanément.
Conséquence : liens dupliqués (`/sign-up` ×4, `/tenant-demo` ×3), CTA dupliqués, poids DOM doublé, signal SEO dilué.

**Note :** les calques d'outline sont bien `aria-hidden` — pas de problème lecteur d'écran de ce côté.

### 2.6 `BackgroundPattern` invisible en thème clair

`text-white opacity-[0.025]` — couleur codée en dur au lieu d'un token. Blanc sur `#f7faff` = invisible. Le motif « MUSIC » n'existe qu'en dark.

`HeroSection.tsx:32`

---

## 3. 🟡 Design & hiérarchie

### 3.1 Zéro rythme vertical

Les **13 sections** ont toutes littéralement `bg-[rgb(var(--bg))]`. Vérifié en runtime : `rgb(247, 250, 255)` × 13. Avec les cartes rendues invisibles (§1), la page est un **aplat monochrome de ~6 900 px**. Rien ne délimite les sections, rien ne hiérarchise.

### 3.2 Tokens clair trop resserrés

| Paire | Écart |
|---|---|
| `--bg` 247 250 255 vs `--card` 236 245 255 | ΔL ≈ 3 % — indistinguable même une fois le bug §1 corrigé |

Le thème sombre est nettement plus fort (`--bg` 7 10 15 vs `--card` 10 16 32, accent `34 211 238`). **Le produit est visuellement conçu pour le dark ;** le light est une adaptation non retravaillée.

### 3.3 Trois sections rendent le même composant

`FeaturesSection` (§01), `ComparisonSection` (§05) et `TestimonialSection` (§06) utilisent toutes le même `IconCard`. Trois blocs visuellement identiques à 3 endroits différents de la page → sensation de remplissage.

### 3.4 « TestimonialSection » ne contient aucun témoignage

`LandingSections.tsx:532` — le composant s'appelle `TestimonialSection` mais rend « Your first sale flow », soit une redite de `HowItWorksSection` (§02).

**Conséquence : il n'y a strictement aucune preuve sociale sur la page.** Aucun témoignage, logo, nom de créateur, capture de storefront réel, ni chiffre d'usage.

### 3.5 Faux compteurs

`CreatorStatsCounter` affiche `0%` / `Your Stripe` / `Automatic PDF` dans le format visuel d'un compteur de metrics. Ce sont des fonctionnalités déguisées en statistiques — un visiteur averti le lit comme du bruit, voire comme une tentative de masquer l'absence de traction.

### 3.6 Redondance du message hero

Le mot pixel géant « LAUNCH » et le `<h1>` « **Launch** your store » disent la même chose. Le mot géant consomme la zone la plus précieuse de la page pour zéro information.

---

## 4. Avatars cibles & modèle économique

### 4.1 Les trois segments

| | Producteur / beatmaker | Ingénieur son / studio | Artiste / rappeur |
|---|---|---|---|
| **Profil** | 16-30 ans, vend déjà sur BeatStars/Airbit | 25-45 ans, mix & mastering, souvent freelance | 16-35 ans, achète des beats, réserve des sessions |
| **Douleur n°1** | 10-30 % de commission + aucune marque propre | L'administratif : devis, relances, paiement, livraison, révisions | Trouver du son et un pro fiable |
| **Déclencheur d'achat** | Économique + identitaire (« ma boutique, mon nom ») | Gain de temps (« un lien, tout est géré ») | — il n'achète pas d'abonnement |
| **Preuve attendue** | Chiffres de commission, exemple de storefront réel, migration facile | Le flux de booking de bout en bout, gestion des révisions | Catalogue, écoute, réputation |
| **Valeur pour BroLab** | 💰 Abonné | 💰 Abonné | ⚠️ **0 €** |

### 4.2 Le problème stratégique

Avec un modèle **0 % de commission + revenus par abonnement**, un artiste acheteur ne génère **aucun revenu** pour BroLab. Il représente pourtant aujourd'hui **un tiers de la surface CTA au-dessus de la ligne de flottaison** (`CTASection`, `LandingSections.tsx:115`), au même niveau visuel que les deux segments payants.

De plus, les trois `RoleCTACard` utilisent `variant="primary"` : **trois boutons cyan pleins identiques côte à côte**. Aucun n'est primaire, donc aucun ne l'est. Classique paralysie du choix.

**Recommandation :** garder les 3 parcours (choix validé) mais les **pondérer**.
- Producteur et Ingénieur en primaires visuels ;
- Artiste en parcours tertiaire (lien texte « Vous cherchez des beats ? Explorer les storefronts → »), qui alimente l'offre côté demande sans diluer le message ni voler le clic payant.

### 4.3 Ce que le copy actuel ne dit pas

- La promesse « 0 % de commission » n'est **jamais chiffrée**. « Sur 10 000 $ de ventes, BeatStars vous prend 3 000 $. BroLab vous prend 0 $ — vous payez 29,99 $/mois. » Ce calcul est l'argument de vente n°1 et il est absent.
- Le segment ingénieur son est traité comme une note de bas de page (« Mixing, mastering, vocal tuning ») alors que c'est le segment le moins servi par la concurrence.
- Aucune réponse à « et si je pars ? » (portabilité du catalogue) — objection majeure chez qui a déjà un catalogue ailleurs.

---

## 5. Ce qui fonctionne — à conserver

- **Routing :** 12 routes testées, 12 × HTTP 200. Aucune route morte.
- **Console :** zéro erreur JS sur la landing page.
- **Le langage ELECTRI-X en dark** est réellement distinctif : typo pixel, cyan, motif MUSIC, blobs. Ça ne ressemble pas à un template.
- **Architecture propre :** `platform/ui` comme point d'import unique, barrels, alias `@/`. Le correctif §1 se fait à un seul endroit pour les primitives.
- **Le mock de storefront** dans `ProductPreviewSection` est le meilleur élément de la page — c'est le seul endroit qui montre le produit.
- **SEO technique :** JSON-LD complet (Organization / WebSite / SoftwareApplication / FAQPage), OpenGraph, canonical, sitemap, robots.

---

## 6. Plan de refonte proposé

### Lot 1 — Débloquer (aucun choix de design)
1. Migration `rgba(var(--x), A)` → `rgb(var(--x) / A)` sur les 272 occurrences / 58 fichiers
2. Vérification visuelle sur landing + tenant-demo + studio + onboarding (les 4 zones les plus impactées)

> Ce lot seul rend visibles 36 cartes, tous les glows et toutes les bordures. À faire et à valider **avant** toute décision esthétique — l'appréciation du design actuel change complètement.

### Lot 2 — Corriger les bugs
3. Collision hero `<h1>` / `MicroInfoModule` (grille au lieu d'`absolute`)
4. Header mobile : repli sous `sm`
5. `EditionBadge` sorti du flux du hero mobile
6. Dé-duplication `HeroTitle` / `HeroCopy` → un seul rendu responsive, **un seul `<h1>`** (`OutlineStackTitle as="span"`)
7. `BackgroundPattern` : `text-white` → token
8. Hauteurs hero : une seule contrainte + indicateur de scroll

### Lot 3 — Contraste & rythme
9. Tokens clair : creuser l'écart `--bg` / `--card`, ajouter `--surface` et un token d'ombre
10. Alternance de fonds sur les 13 sections (rythme A/B + une section « inversée » pleine largeur)
11. Cartes : élévation réelle (ombre + bordure lisible), pas seulement du glass
12. Décision à prendre : **forcer le dark sur la landing** — le thème sombre est objectivement 2× plus fort et c'est le code couleur du secteur

### Lot 4 — Structure & conversion
13. Fusionner les 3 sections redondantes → **une** section « features » dense
14. Remplacer `TestimonialSection` par de la vraie preuve (témoignages bêta, ou storefronts réels)
15. Remplacer `CreatorStatsCounter` par le **calculateur d'économies de commission**
16. Repondérer les 3 CTA : Producteur / Ingénieur primaires, Artiste tertiaire
17. Hero : arbitrer entre le mot pixel et le `<h1>`, ajouter un visuel produit
18. 13 sections → ~8

---

## 7. Questions ouvertes

1. **Dark-first sur la landing ?** Fortement recommandé au vu de l'écart mesuré entre les deux thèmes.
2. **Existe-t-il des créateurs bêta citables ?** Sans preuve sociale réelle, on ne peut que la remplacer par de la preuve produit (démo, captures) — pas inventer des témoignages.
3. **Périmètre du Lot 1 :** je corrige les 272 occurrences partout (recommandé, c'est le même bug), ou seulement le périmètre landing ?
4. **Le mot pixel « LAUNCH » est-il négociable ?** C'est l'élément le plus identitaire mais aussi le moins informatif.
