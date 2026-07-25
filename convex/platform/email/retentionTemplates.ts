/**
 * Revenue-protection email content.
 *
 * These are the sends that keep MRR that has already been won: dunning when a
 * card fails, a survey when someone cancels, and the two win-back ladders
 * (expired trial, churned customer).
 *
 * They sit apart from templates.ts because they share a constraint the growth
 * templates do not: every one of them reaches somebody whose relationship with
 * the product is currently negative or interrupted. The copy rule throughout is
 * *no guilt and no pressure* — a failed card is almost always an expired card,
 * and a cancellation that gets lectured at never comes back.
 *
 * Every template takes a locale and returns copy in that language. Both
 * variants live side by side so a change to one that is not mirrored in the
 * other is visible in the same diff.
 */

import { pick, type Locale } from "./i18n";
import {
  badge,
  bulletList,
  button,
  h1,
  noteBox,
  paragraph,
  renderEmailLayout,
  secondaryLink,
  textFooter,
  type EmailBrand,
} from "./theme";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

interface BaseParams {
  brand: EmailBrand;
  locale: Locale;
  unsubscribeUrl?: string;
}

// ============================================================================
// DUNNING — failed payment recovery
// ============================================================================

export type DunningStage = "first" | "reminder" | "urgent" | "final";

interface StageCopy {
  subject: string;
  preheader: string;
  badgeLabel: string;
  heading: string;
  lead: string;
  detail: string[];
  cta: string;
  reassurance: string;
}

/**
 * Four sends across twelve days.
 *
 * The escalation is in the *stakes*, not the tone: each email states more
 * precisely what stops working, and none of them imply the recipient did
 * something wrong. Card expiry is the single most common cause, and the person
 * reading this usually has no idea anything failed.
 *
 * Accuracy note — what actually breaks on a lapsed subscription is narrower
 * than it sounds, and the copy has to match it. `assertActiveSubscription`
 * gates only the seller-side mutations in modules/beats.ts and
 * modules/services.ts: upload, publish, edit, price changes. The public
 * marketplace and the checkout path never read subscription status, so an
 * already-published catalog keeps selling the entire time. Claiming the
 * storefront "stops accepting orders" would be a threat the product does not
 * carry out, and the first producer who checks discovers we bluffed.
 */
export function paymentFailed(
  p: BaseParams & {
    stage: DunningStage;
    planLabel: string;
    priceLabel: string;
    billingUrl: string;
  }
): RenderedEmail {
  const copy = pick<Record<DunningStage, StageCopy>>(p.locale, {
    en: {
      first: {
        subject: "Your payment didn't go through",
        preheader: "Publishing is paused until it's fixed. Your live catalog keeps selling.",
        badgeLabel: "Action needed",
        heading: "Your card was declined",
        lead: `We tried to charge ${p.priceLabel} for your ${p.planLabel} plan and the payment did not go through. Nine times out of ten this is a card that expired or a bank that flagged a new merchant.`,
        detail: [
          "Until it clears, you can't upload, publish or edit anything.",
          "Your published catalog stays online and keeps selling — and you still keep 100% of it.",
          "Payouts are unaffected: buyers pay your Stripe account directly, not us.",
        ],
        cta: "Update my payment method",
        reassurance:
          "If you already fixed this, ignore this email — it can cross with our retry.",
      },
      reminder: {
        subject: "Your catalog is frozen",
        preheader: `Three days without a working card. Nothing published, nothing changed.`,
        badgeLabel: "3 days",
        heading: "We still can't charge your card",
        lead: `Three days on, the ${p.priceLabel} charge for your ${p.planLabel} plan is still failing — so your catalog is frozen. You can't put out a new beat, change a price, or update a service.`,
        detail: [
          "Everything already published is still live and still earning for you.",
          "Nothing has been deleted and nothing expires.",
          "One card update unfreezes all of it immediately.",
        ],
        cta: "Update my card",
        reassurance:
          "Changed banks or need an invoice for accounting? Reply to this email and we'll sort it.",
      },
      urgent: {
        subject: "A week without being able to publish",
        preheader:
          "Every release you've held back is still waiting. One card update releases them.",
        badgeLabel: "Urgent",
        heading: "You've lost a week of releases",
        lead: `The ${p.priceLabel} charge has been failing for a week. That's a week you couldn't drop a beat, adjust a price, or open a new service — on a plan you were paying for anyway.`,
        detail: [
          "Your account and every file in it are intact. We don't delete a producer's catalog over a card.",
          "The moment a payment succeeds, publishing is back — no re-setup, no re-upload.",
          "You keep 100% of every sale. That never changes.",
        ],
        cta: "Unfreeze my catalog",
        reassurance:
          "Card genuinely not working right now? Reply and we'll hold your account while you sort it.",
      },
      final: {
        subject: "Last notice on your account",
        preheader:
          "Your files are kept either way. This is the last time we bring it up.",
        badgeLabel: "Final notice",
        heading: "Last notice",
        lead: `We haven't been able to collect ${p.priceLabel} for twelve days, and your ${p.planLabel} plan is on its way out. Your catalog has been frozen that whole time.`,
        detail: [
          "Every file you uploaded is kept — we don't delete a producer's catalog over a card.",
          "Reactivating restores your account exactly as you left it.",
          "After this we stop emailing you about it.",
        ],
        cta: "Reactivate my plan",
        reassurance:
          "If you meant to leave, no hard feelings — just reply and tell us why. It genuinely helps.",
      },
    },
    fr: {
      first: {
        subject: "Votre paiement n'est pas passé",
        preheader:
          "La publication est bloquée le temps de régler. Votre catalogue en ligne continue de vendre.",
        badgeLabel: "Action requise",
        heading: "Votre carte a été refusée",
        lead: `Nous avons tenté de prélever ${p.priceLabel} pour votre plan ${p.planLabel} et le paiement n'est pas passé. Neuf fois sur dix, c'est une carte expirée ou une banque qui bloque un nouveau marchand.`,
        detail: [
          "Tant que ce n'est pas réglé, vous ne pouvez plus uploader, publier ni modifier quoi que ce soit.",
          "Votre catalogue publié reste en ligne et continue de vendre — et vous en gardez toujours 100 %.",
          "Vos virements ne sont pas touchés : les acheteurs paient directement votre compte Stripe, pas le nôtre.",
        ],
        cta: "Mettre à jour ma carte",
        reassurance:
          "Si c'est déjà réglé, ignorez cet email — il a pu croiser notre relance.",
      },
      reminder: {
        subject: "Votre catalogue est gelé",
        preheader:
          "Trois jours sans carte valide. Aucune publication, aucune modification possible.",
        badgeLabel: "3 jours",
        heading: "Le prélèvement échoue toujours",
        lead: `Trois jours plus tard, le prélèvement de ${p.priceLabel} pour votre plan ${p.planLabel} échoue encore — votre catalogue est donc gelé. Impossible de sortir un nouveau beat, de changer un prix ou de mettre à jour une prestation.`,
        detail: [
          "Tout ce qui est déjà publié reste en ligne et continue de vous rapporter.",
          "Rien n'a été supprimé et rien n'expire.",
          "Une mise à jour de carte débloque tout immédiatement.",
        ],
        cta: "Mettre à jour ma carte",
        reassurance:
          "Changement de banque ou besoin d'une facture pour la compta ? Répondez à cet email, on s'en occupe.",
      },
      urgent: {
        subject: "Une semaine sans pouvoir publier",
        preheader:
          "Chaque sortie que vous avez retenue attend encore. Une carte suffit à les libérer.",
        badgeLabel: "Urgent",
        heading: "Vous avez perdu une semaine de sorties",
        lead: `Le prélèvement de ${p.priceLabel} échoue depuis une semaine. C'est une semaine où vous n'avez pas pu sortir de beat, ajuster un prix ni ouvrir une prestation — sur un plan que vous payiez de toute façon.`,
        detail: [
          "Votre compte et tous vos fichiers sont intacts. On ne supprime pas le catalogue d'un producteur pour une carte.",
          "Dès qu'un paiement passe, la publication revient — rien à reconfigurer, rien à réuploader.",
          "Vous gardez 100 % de chaque vente. Ça ne change jamais.",
        ],
        cta: "Dégeler mon catalogue",
        reassurance:
          "Carte réellement bloquée en ce moment ? Répondez, on met votre compte en attente le temps que vous régliez.",
      },
      final: {
        subject: "Dernier rappel sur votre compte",
        preheader:
          "Vos fichiers sont conservés dans tous les cas. C'est la dernière fois qu'on en parle.",
        badgeLabel: "Dernier rappel",
        heading: "Dernier rappel",
        lead: `Nous n'avons pas pu encaisser ${p.priceLabel} depuis douze jours, et votre plan ${p.planLabel} est sur le point de s'arrêter. Votre catalogue est gelé depuis tout ce temps.`,
        detail: [
          "Tous vos fichiers sont conservés — on ne supprime pas le catalogue d'un producteur pour une carte.",
          "La réactivation restaure votre compte exactement comme vous l'avez laissé.",
          "Après ce message, nous arrêtons de vous relancer là-dessus.",
        ],
        cta: "Réactiver mon plan",
        reassurance:
          "Si vous vouliez vraiment partir, aucun souci — répondez juste pour dire pourquoi. Ça nous aide vraiment.",
      },
    },
  })[p.stage];

  const tone = p.stage === "first" ? "accent" : p.stage === "reminder" ? "warning" : "danger";

  const body = [
    badge(copy.badgeLabel, tone),
    h1(copy.heading),
    paragraph(copy.lead),
    bulletList(copy.detail),
    button(copy.cta, p.billingUrl),
    noteBox(copy.reassurance),
  ].join("\n");

  return {
    subject: copy.subject,
    html: renderEmailLayout({
      brand: p.brand,
      locale: p.locale,
      preheader: copy.preheader,
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: pick(p.locale, {
        en: "You received this because a payment on your account needs attention.",
        fr: "Vous recevez cet email car un paiement sur votre compte nécessite votre attention.",
      }),
    }),
    text: [
      copy.heading,
      "",
      copy.lead,
      "",
      ...copy.detail.map((line) => `- ${line}`),
      "",
      `${copy.cta}: ${p.billingUrl}`,
      "",
      copy.reassurance,
      textFooter(p.brand, p.unsubscribeUrl, p.locale),
    ].join("\n"),
  };
}

// ============================================================================
// CANCELLATION — survey at the moment of churn
// ============================================================================

/**
 * Sent immediately on cancellation.
 *
 * Deliberately not a save attempt. The one thing worth having at this moment is
 * an honest reason, and asking for it costs nothing; a discount offer thrown at
 * someone who just decided to leave reads as desperate and gets ignored. The
 * reactivation link is present but secondary.
 */
export function cancellationSurvey(
  p: BaseParams & {
    planLabel: string;
    surveyUrl: string;
    reactivateUrl: string;
  }
): RenderedEmail {
  const copy = pick(p.locale, {
    en: {
      subject: "Before you go — one question",
      preheader:
        "Your catalog stays saved. We would just like to know what went wrong.",
      heading: "Your plan is cancelled",
      lead: `Your ${p.planLabel} plan is cancelled and you will not be charged again. You can no longer publish or edit, but nothing you uploaded has been deleted — anything already live stays live.`,
      ask: "One question, and it genuinely shapes what we build next: what made you cancel?",
      cta: "Tell us in 30 seconds",
      secondary: "Changed your mind? Reactivate here",
      note: "Your tracks, services and sales history stay in your account. If you come back, everything is exactly where you left it.",
      footerNote: "You received this because you cancelled a subscription.",
    },
    fr: {
      subject: "Avant de partir — une question",
      preheader:
        "Votre catalogue reste conservé. On aimerait juste savoir ce qui n'a pas marché.",
      heading: "Votre plan est résilié",
      lead: `Votre plan ${p.planLabel} est résilié et vous ne serez plus prélevé. Vous ne pouvez plus publier ni modifier, mais rien de ce que vous avez mis en ligne n'a été supprimé — ce qui est déjà en ligne le reste.`,
      ask: "Une seule question, et elle oriente vraiment ce qu'on construit ensuite : qu'est-ce qui vous a fait résilier ?",
      cta: "Répondre en 30 secondes",
      secondary: "Vous avez changé d'avis ? Réactiver ici",
      note: "Vos morceaux, vos prestations et votre historique de ventes restent dans votre compte. Si vous revenez, tout est exactement là où vous l'avez laissé.",
      footerNote: "Vous recevez cet email car vous avez résilié un abonnement.",
    },
  });

  const body = [
    h1(copy.heading),
    paragraph(copy.lead),
    paragraph(copy.ask),
    button(copy.cta, p.surveyUrl),
    secondaryLink(copy.secondary, p.reactivateUrl),
    noteBox(copy.note),
  ].join("\n");

  return {
    subject: copy.subject,
    html: renderEmailLayout({
      brand: p.brand,
      locale: p.locale,
      preheader: copy.preheader,
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: copy.footerNote,
    }),
    text: [
      copy.heading,
      "",
      copy.lead,
      "",
      copy.ask,
      "",
      `${copy.cta}: ${p.surveyUrl}`,
      `${copy.secondary}: ${p.reactivateUrl}`,
      "",
      copy.note,
      textFooter(p.brand, p.unsubscribeUrl, p.locale),
    ].join("\n"),
  };
}

// ============================================================================
// WIN-BACK — expired trial
// ============================================================================

export type TrialWinbackStage = "feedback" | "value" | "final";

/**
 * Three sends across the month after a trial lapses.
 *
 * The existing trial ladder stops at day+1. Everyone who ignored that email is
 * currently never contacted again, which is the largest silent leak in the
 * funnel: they signed up, so intent was real, and something specific stopped
 * them.
 *
 * `publishedTracks` splits the audience. Someone who uploaded nothing never saw
 * the product work and needs a reason to look again; someone who uploaded a
 * catalog and still did not convert hit a different wall, and pretending
 * otherwise wastes the send.
 */
export function trialWinback(
  p: BaseParams & {
    stage: TrialWinbackStage;
    planLabel: string;
    priceLabel: string;
    publishedTracks: number;
    billingUrl: string;
    replyEmail: string;
  }
): RenderedEmail {
  const engaged = p.publishedTracks > 0;

  const copy = pick<Record<TrialWinbackStage, StageCopy>>(p.locale, {
    en: {
      feedback: {
        subject: "What stopped you?",
        preheader: "One reply, no sales pitch. It shapes what we fix next.",
        badgeLabel: "Question",
        heading: "What stopped you?",
        lead: engaged
          ? `You uploaded ${p.publishedTracks} track${p.publishedTracks === 1 ? "" : "s"} and then stopped short of picking a plan. That gap is the useful part — you saw enough of the product to decide against it.`
          : "You signed up, then never got as far as publishing anything. Somewhere between those two points something got in the way, and I would like to know what.",
        detail: [],
        cta: "Reply and tell me",
        reassurance:
          "This is a real inbox, not a support queue. Whatever you write gets read.",
      },
      value: {
        subject: "The math on 0% commission",
        preheader: `${p.priceLabel} flat versus a percentage of everything you sell.`,
        badgeLabel: "Worth knowing",
        heading: "Here is the actual math",
        lead: `Every other marketplace takes a cut of each sale. We take ${p.priceLabel} and 0% of your revenue — which means the more you sell, the wider the gap gets.`,
        detail: [
          "Sell $200 a month: a 15% marketplace keeps $30 of it. We keep $0.",
          "Sell $1,000 a month: they keep $150. We still keep $0.",
          "Your buyers pay you through your own Stripe account. We never hold your money.",
        ],
        cta: "Start my plan",
        reassurance:
          "Everything you uploaded during the trial is still there, exactly as you left it.",
      },
      final: {
        subject: "Your catalog is still waiting",
        preheader:
          "Nothing was deleted. Your storefront comes back the moment you pick a plan.",
        badgeLabel: "Still here",
        heading: "Your catalog is still yours",
        lead: `It has been a month. Your ${p.planLabel} account is frozen but fully intact — nothing was deleted and nothing expires.`,
        detail: [
          "Pick a plan and you can publish again in under a minute.",
          "Same URL, same catalog, same 0% commission.",
        ],
        cta: "Reactivate my storefront",
        reassurance:
          "This is the last email in this sequence — you will not hear from us about it again.",
      },
    },
    fr: {
      feedback: {
        subject: "Qu'est-ce qui vous a arrêté ?",
        preheader: "Une réponse, aucun argumentaire. Ça oriente ce qu'on corrige.",
        badgeLabel: "Question",
        heading: "Qu'est-ce qui vous a arrêté ?",
        lead: engaged
          ? `Vous avez mis en ligne ${p.publishedTracks} morceau${p.publishedTracks === 1 ? "" : "x"} puis vous vous êtes arrêté avant de choisir un plan. C'est justement cet écart qui m'intéresse — vous avez vu assez du produit pour décider que non.`
          : "Vous vous êtes inscrit, puis vous n'êtes jamais allé jusqu'à publier quoi que ce soit. Entre ces deux moments, quelque chose a bloqué, et j'aimerais savoir quoi.",
        detail: [],
        cta: "Répondre et me le dire",
        reassurance:
          "C'est une vraie boîte mail, pas un service client. Ce que vous écrivez est lu.",
      },
      value: {
        subject: "Le calcul de la commission à 0 %",
        preheader: `${p.priceLabel} fixe contre un pourcentage de tout ce que vous vendez.`,
        badgeLabel: "Bon à savoir",
        heading: "Voici le vrai calcul",
        lead: `Toutes les autres plateformes prennent une part de chaque vente. Nous prenons ${p.priceLabel} et 0 % de votre chiffre — donc plus vous vendez, plus l'écart se creuse.`,
        detail: [
          "200 $ de ventes par mois : une plateforme à 15 % en garde 30 $. Nous, 0 $.",
          "1 000 $ de ventes par mois : elle en garde 150 $. Nous, toujours 0 $.",
          "Vos acheteurs vous paient via votre propre compte Stripe. Nous ne détenons jamais votre argent.",
        ],
        cta: "Démarrer mon plan",
        reassurance:
          "Tout ce que vous avez mis en ligne pendant l'essai est toujours là, tel quel.",
      },
      final: {
        subject: "Votre catalogue vous attend toujours",
        preheader:
          "Rien n'a été supprimé. Votre boutique revient dès que vous choisissez un plan.",
        badgeLabel: "Toujours là",
        heading: "Votre catalogue reste le vôtre",
        lead: `Un mois est passé. Votre compte ${p.planLabel} est gelé mais totalement intact — rien n'a été supprimé et rien n'expire.`,
        detail: [
          "Choisissez un plan et vous pouvez publier à nouveau en moins d'une minute.",
          "Même URL, même catalogue, toujours 0 % de commission.",
        ],
        cta: "Réactiver ma boutique",
        reassurance:
          "C'est le dernier email de cette séquence — nous ne vous relancerons plus là-dessus.",
      },
    },
  })[p.stage];

  // The feedback email's whole purpose is a reply, so it must not compete with
  // a dashboard button. A mailto is the only CTA that produces the thing asked
  // for; a link to billing here would answer a question nobody was asked.
  const ctaTarget =
    p.stage === "feedback"
      ? `mailto:${p.replyEmail}?subject=${encodeURIComponent(
          pick(p.locale, {
            en: "What stopped me",
            fr: "Ce qui m'a arrêté",
          })
        )}`
      : p.billingUrl;

  const body = [
    badge(copy.badgeLabel, p.stage === "feedback" ? "accent" : "success"),
    h1(copy.heading),
    paragraph(copy.lead),
    copy.detail.length > 0 ? bulletList(copy.detail) : "",
    button(copy.cta, ctaTarget),
    noteBox(copy.reassurance),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: copy.subject,
    html: renderEmailLayout({
      brand: p.brand,
      locale: p.locale,
      preheader: copy.preheader,
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: pick(p.locale, {
        en: "You received this because you started a trial that has since ended.",
        fr: "Vous recevez cet email car vous avez commencé un essai qui est arrivé à son terme.",
      }),
    }),
    text: [
      copy.heading,
      "",
      copy.lead,
      "",
      ...copy.detail.map((line) => `- ${line}`),
      "",
      `${copy.cta}: ${ctaTarget}`,
      "",
      copy.reassurance,
      textFooter(p.brand, p.unsubscribeUrl, p.locale),
    ].join("\n"),
  };
}

// ============================================================================
// WIN-BACK — churned customer
// ============================================================================

export type ChurnWinbackStage = "whatsNew" | "addressed" | "openDoor";

/**
 * Three sends across the ninety days after a paying customer leaves.
 *
 * A churned customer is the best-qualified lead there is: they already
 * understood the product well enough to pay for it. The sequence is spaced wide
 * on purpose — the reason they left usually needs time, or a shipped fix, to
 * stop being true.
 */
export function churnWinback(
  p: BaseParams & {
    stage: ChurnWinbackStage;
    priceLabel: string;
    billingUrl: string;
    changelogUrl: string;
    /** Free-text reason from the cancellation survey, when one was given. */
    statedReason?: string | null;
  }
): RenderedEmail {
  const copy = pick<Record<ChurnWinbackStage, StageCopy>>(p.locale, {
    en: {
      whatsNew: {
        subject: "What changed since you left",
        preheader:
          "A short, honest list. No offer attached.",
        badgeLabel: "Product update",
        heading: "What changed since you left",
        lead: "It has been about a month. Rather than ask you to come back, here is simply what is different now — decide for yourself whether any of it matters.",
        detail: [],
        cta: "See what shipped",
        reassurance:
          "Your account and catalog are still intact if you ever want them back.",
      },
      addressed: {
        subject: "You mentioned something — we fixed it",
        preheader: "The thing you told us about when you left.",
        badgeLabel: "Fixed",
        heading: "We took your feedback seriously",
        lead: p.statedReason
          ? `When you cancelled you told us: "${p.statedReason}". That went straight onto the list, and it has been worked on since.`
          : "A few of the things that pushed people away when you left have since been rebuilt. If one of them was your reason, it may be worth another look.",
        detail: [],
        cta: "Take another look",
        reassurance:
          "Everything you uploaded is still in your account, exactly as you left it.",
      },
      openDoor: {
        subject: "The door stays open",
        preheader: `Your catalog is kept. ${p.priceLabel} whenever you want it back.`,
        badgeLabel: "Open door",
        heading: "The door stays open",
        lead: `Three months on, your catalog is still saved. If you ever want to publish again it is ${p.priceLabel} and 0% of your sales — no setup to redo.`,
        detail: [
          "Your tracks, services and sales history are all still there.",
          "Reactivating takes under a minute and keeps the same storefront URL.",
        ],
        cta: "Reactivate my storefront",
        reassurance:
          "This is the last email in this sequence. If the product is not for you, that is a completely fine answer.",
      },
    },
    fr: {
      whatsNew: {
        subject: "Ce qui a changé depuis votre départ",
        preheader: "Une liste courte et honnête. Aucune offre attachée.",
        badgeLabel: "Nouveautés",
        heading: "Ce qui a changé depuis votre départ",
        lead: "Un mois environ est passé. Plutôt que de vous demander de revenir, voici simplement ce qui est différent aujourd'hui — jugez vous-même si quelque chose vous concerne.",
        detail: [],
        cta: "Voir les nouveautés",
        reassurance:
          "Votre compte et votre catalogue restent intacts si vous voulez les récupérer un jour.",
      },
      addressed: {
        subject: "Vous nous aviez signalé un point — c'est corrigé",
        preheader: "Ce que vous nous aviez dit en partant.",
        badgeLabel: "Corrigé",
        heading: "On a pris votre retour au sérieux",
        lead: p.statedReason
          ? `En résiliant, vous nous aviez dit : « ${p.statedReason} ». C'est parti directement sur la liste, et ça a été travaillé depuis.`
          : "Plusieurs des raisons qui faisaient partir les gens à l'époque de votre départ ont été reprises depuis. Si l'une d'elles était la vôtre, ça vaut peut-être un second regard.",
        detail: [],
        cta: "Y jeter un œil",
        reassurance:
          "Tout ce que vous aviez mis en ligne est toujours dans votre compte, tel quel.",
      },
      openDoor: {
        subject: "La porte reste ouverte",
        preheader: `Votre catalogue est conservé. ${p.priceLabel} quand vous voulez le récupérer.`,
        badgeLabel: "Porte ouverte",
        heading: "La porte reste ouverte",
        lead: `Trois mois plus tard, votre catalogue est toujours sauvegardé. Si vous voulez publier à nouveau, c'est ${p.priceLabel} et 0 % sur vos ventes — rien à reconfigurer.`,
        detail: [
          "Vos morceaux, vos prestations et votre historique de ventes sont toujours là.",
          "La réactivation prend moins d'une minute et conserve la même URL de boutique.",
        ],
        cta: "Réactiver ma boutique",
        reassurance:
          "C'est le dernier email de cette séquence. Si le produit n'est pas fait pour vous, c'est une réponse tout à fait valable.",
      },
    },
  })[p.stage];

  const ctaTarget = p.stage === "openDoor" ? p.billingUrl : p.changelogUrl;

  const body = [
    badge(copy.badgeLabel, "accent"),
    h1(copy.heading),
    paragraph(copy.lead),
    copy.detail.length > 0 ? bulletList(copy.detail) : "",
    button(copy.cta, ctaTarget),
    noteBox(copy.reassurance),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: copy.subject,
    html: renderEmailLayout({
      brand: p.brand,
      locale: p.locale,
      preheader: copy.preheader,
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: pick(p.locale, {
        en: "You received this because you were previously a subscriber.",
        fr: "Vous recevez cet email car vous avez été abonné par le passé.",
      }),
    }),
    text: [
      copy.heading,
      "",
      copy.lead,
      "",
      ...copy.detail.map((line) => `- ${line}`),
      "",
      `${copy.cta}: ${ctaTarget}`,
      "",
      copy.reassurance,
      textFooter(p.brand, p.unsubscribeUrl, p.locale),
    ].join("\n"),
  };
}
