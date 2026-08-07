# BroLab revenue operating system — 2026-08-07

## North-star

`first_offer_published` est le KPI d'activation. Le MRR est compté uniquement après activation Clerk payante ; une trial est du MRR engagé, pas du cash encaissé.

## Funnel propriétaire

`researched → contacted → replied → qualified → concierge_link_sent → booked → attended → workspace_created → trial_started → stripe_ready → first_offer_published → first_charge_paid`

Chaque étape doit avoir une preuve datée. Aucun déplacement manuel vers une étape produit sans événement produit correspondant.

## Cadence

### 09:00 — diagnostic et file de travail

1. Exécuter `npm run metrics:growth` et `npm run metrics:mrr`.
2. Lire `/admin/growth` et sortir les relances dues.
3. Après la vague de validation, sélectionner jusqu'à 30 prospects avec signal récent : 20 producteurs et 10 ingénieurs. Rejeter plutôt que compléter le quota avec un profil faible.
4. Préparer les messages ; ne rien envoyer sans validation humaine.

### 13:00 — preuve reliée à une objection

Préparer un seul contenu parmi : multi-liens, licence, service en DM, setup accompagné. Il doit citer l'objection CRM qui justifie sa création et utiliser un CTA tracké unique.

### 18:00 — scoreboard

Reporter les chiffres observables, la chute principale, l'objection dominante et les trois actions du lendemain. Ne pas optimiser les vues si aucune conversation qualifiée n'en découle.

## Expériences

| Hypothèse | Segment | Test | Succès | Échec/arrêt |
| --- | --- | --- | --- | --- |
| Une offre concrète bat une démo générique | deux ICP | inviter avec l'offre nommée | ≥ 2 bookings / 10 qualifiés | 0 booking après 10 |
| Le concierge enlève la peur du setup | deux ICP | setup gratuit | ≥ 50 % présents → offre live | < 25 % après 8 présents |
| Multi-liens est une douleur producteur | producteurs | opener diagnostique | ≥ 3 réponses confirmées / 20 | < 2 / 20 |
| Packaging réduit les DMs ingénieur | ingénieurs | un service fixe | ≥ 3 réponses confirmées / 20 | < 2 / 20 |
| Launch Pack peut financer l'acquisition | activés/qualifiés | 149 $ après pilote | ≥ 2 ventes / 10 offres | 0 / 10 |

## Contenu

Trois contenus maximum par semaine :

1. preuve réelle d'un écran + signal ICP ;
2. objection réelle + réponse courte ;
3. résultat d'activation autorisé (jamais inventé).

Chaque asset porte `campaign`, `source` et `segment`. Les métriques utiles sont réponse qualifiée, lien envoyé, booking et première offre — pas impressions seules.

## Automatisation autorisée

- métriques et diagnostic ;
- sélection/déduplication de prospects ;
- brouillons de messages et contenus ;
- relances dues ;
- rapport quotidien et hebdomadaire.

## Automatisation interdite sans validation explicite

- envoyer un DM/email ;
- suivre, liker ou commenter ;
- publier un contenu ;
- déplacer un prospect selon une supposition ;
- fabriquer une preuve sociale.
