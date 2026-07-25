/**
 * Email Design System
 *
 * Shared tokens and layout primitives for every transactional and lifecycle
 * email. Mirrors the app's dark theme (app/globals.css `.dark`) so an email
 * and the dashboard it links to read as the same product.
 *
 * Why table-based markup: Outlook (Word rendering engine) ignores `display:flex`,
 * `border-radius` on most elements, and external/`<style>` rules inconsistently.
 * Every layout decision here uses nested tables + inline styles, which is the
 * only construct that renders identically across Gmail, Apple Mail, and Outlook.
 */

/**
 * Brand tokens — hex mirrors of the light `:root` CSS custom properties.
 *
 * Mirrors the app's light theme: the page sits on the darkest light surface and
 * the card is pure white above it, so the card reads as raised rather than
 * blending into the background.
 *
 * Accent is the darkened light-theme cyan (#077A96), which clears AA contrast
 * on white — the dark-theme cyan (#22D3EE) does not and must not be used here.
 */
export const EMAIL_THEME = {
  bg: "#EEF3FA",
  card: "#FFFFFF",
  cardRaisedBorder: "#D7E0EC",
  /** Subtle fill for stat blocks and callouts, one step above the card. */
  surfaceSubtle: "#F4F8FC",
  accent: "#077A96",
  accentDeep: "#0694AC",
  /** Text on top of the accent color — accent is dark, so this is white. */
  onAccent: "#FFFFFF",
  text: "#071022",
  muted: "#3E4C60",
  faint: "#68758A",
  success: "#0F7A5A",
  warning: "#9A5B06",
  danger: "#B4232B",
  fontStack:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
} as const;

export interface EmailBrand {
  brandName: string;
  siteUrl: string;
}

/** Resolve brand config from env once per send. */
export function resolveBrand(): EmailBrand {
  return {
    brandName: process.env.BRAND_NAME || "BroLab Entertainment",
    siteUrl:
      process.env.NEXT_PUBLIC_SITE_URL || "https://brolabentertainment.com",
  };
}

export function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export interface LayoutParams {
  brand: EmailBrand;
  /** Inbox preview text. Shown next to the subject line before opening. */
  preheader: string;
  /** Pre-rendered inner HTML — build it with the section helpers below. */
  body: string;
  /** Absolute URL that removes this recipient from non-transactional email. */
  unsubscribeUrl?: string;
  /** Explains why this person is receiving the message (trust + spam signal). */
  footerNote?: string;
  /**
   * Drives the `lang` attribute and the chrome strings the shell owns.
   * Defaults to English so existing callers keep their current output.
   */
  locale?: "en" | "fr";
}

/**
 * Strings the layout renders itself, outside any template's body.
 *
 * The `lang` attribute matters beyond politeness: screen readers pronounce the
 * footer with the wrong phonemes without it, and some clients offer to
 * translate a message whose declared language contradicts its content.
 */
const LAYOUT_STRINGS = {
  en: { unsubscribe: "Unsubscribe", unsubscribeSuffix: "from these emails." },
  fr: { unsubscribe: "Se désabonner", unsubscribeSuffix: "de ces emails." },
} as const;

/**
 * Wrap body content in the standard shell.
 *
 * Includes an MSO conditional wrapper so Outlook constrains width correctly,
 * and a hidden preheader span so the inbox preview is intentional rather than
 * the first stray words of the body.
 */
export function renderEmailLayout(p: LayoutParams): string {
  const t = EMAIL_THEME;
  const year = new Date().getFullYear();

  const locale = p.locale ?? "en";
  const strings = LAYOUT_STRINGS[locale];

  const unsubscribeBlock = p.unsubscribeUrl
    ? `<br /><a href="${p.unsubscribeUrl}" style="color:${t.faint};text-decoration:underline">${strings.unsubscribe}</a> ${strings.unsubscribeSuffix}`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${locale}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${escapeHtml(p.brand.brandName)}</title>
<!--[if mso]>
<style type="text/css">
  body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
</style>
<![endif]-->
<style type="text/css">
  /* This is a light-only design. Some clients auto-invert light emails in dark
     mode and produce dark text on a darkened card, so the palette is pinned
     explicitly. Gmail on Android may still force its own inversion — the layout
     stays legible there because contrast is carried by the border, not by the
     background alone. */
  @media (prefers-color-scheme: dark) {
    .body-bg { background-color: ${t.bg} !important; }
    .card-bg { background-color: ${t.card} !important; }
    .t-text { color: ${t.text} !important; }
    .t-muted { color: ${t.muted} !important; }
    .t-faint { color: ${t.faint} !important; }
  }
  @media only screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .card-pad { padding: 28px 22px !important; }
    .h1 { font-size: 21px !important; }
    .cta-link { display: block !important; }
  }
</style>
</head>
<body class="body-bg" style="margin:0;padding:0;background-color:${t.bg};color:${t.text};font-family:${t.fontStack};-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:${t.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(p.preheader)}</div>
<div style="display:none;max-height:0;overflow:hidden;">&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="body-bg" style="background-color:${t.bg};">
<tr><td align="center" style="padding:32px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
  <tr>
    <td style="padding:0 0 20px 4px;">
      <a href="${p.brand.siteUrl}" style="color:${t.accent};font-size:13px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;">${escapeHtml(p.brand.brandName)}</a>
    </td>
  </tr>
  <tr>
    <td class="card-bg card-pad" style="background-color:${t.card};border:1px solid ${t.cardRaisedBorder};border-radius:14px;padding:36px 32px;">
      ${p.body}
    </td>
  </tr>
  <tr>
    <td class="t-faint" style="padding:24px 8px 0;text-align:center;font-size:12px;line-height:1.7;color:${t.faint};">
      ${p.footerNote ? `${escapeHtml(p.footerNote)}<br />` : ""}
      &copy; ${year} ${escapeHtml(p.brand.brandName)}.${unsubscribeBlock}
    </td>
  </tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}

// ============ Section helpers ============

export function h1(text: string): string {
  return `<h1 class="h1 t-text" style="margin:0 0 10px;font-size:24px;line-height:1.3;font-weight:700;color:${EMAIL_THEME.text};">${escapeHtml(text)}</h1>`;
}

export function paragraph(text: string): string {
  return `<p class="t-muted" style="margin:0 0 18px;font-size:15px;line-height:1.65;color:${EMAIL_THEME.muted};">${escapeHtml(text)}</p>`;
}

/** Paragraph that allows pre-built inline markup (e.g. a bolded amount). */
export function richParagraph(html: string): string {
  return `<p class="t-muted" style="margin:0 0 18px;font-size:15px;line-height:1.65;color:${EMAIL_THEME.muted};">${html}</p>`;
}

export function strong(text: string): string {
  return `<strong class="t-text" style="color:${EMAIL_THEME.text};font-weight:600;">${escapeHtml(text)}</strong>`;
}

/**
 * Primary call to action.
 *
 * Uses an MSO VML roundrect so Outlook renders a real filled button instead of
 * a square block or a bare link.
 */
export function button(label: string, url: string): string {
  const t = EMAIL_THEME;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 8px;">
<tr><td align="center" bgcolor="${t.accent}" style="border-radius:8px;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:46px;v-text-anchor:middle;width:280px;" arcsize="18%" stroke="f" fillcolor="${t.accent}">
<w:anchorlock/><center style="color:${t.onAccent};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${escapeHtml(label)}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-- -->
<a class="cta-link" href="${url}" style="display:inline-block;padding:14px 30px;background-color:${t.accent};color:${t.onAccent};font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
<!--<![endif]-->
</td></tr></table>`;
}

/** Secondary, lower-emphasis link placed under the primary CTA. */
export function secondaryLink(label: string, url: string): string {
  return `<p style="margin:6px 0 0;font-size:13px;line-height:1.6;"><a href="${url}" style="color:${EMAIL_THEME.accent};text-decoration:underline;">${escapeHtml(label)}</a></p>`;
}

export interface DetailRow {
  label: string;
  value: string;
}

/**
 * Key/value block. Uses a two-column table rather than flexbox — `display:flex`
 * silently collapses in Outlook, which is what broke the old templates.
 */
export function detailTable(rows: DetailRow[]): string {
  const t = EMAIL_THEME;
  const cells = rows
    .map(
      (r, i) => `<tr>
<td class="t-muted" style="padding:11px 0;font-size:14px;color:${t.muted};${i > 0 ? `border-top:1px solid ${t.cardRaisedBorder};` : ""}">${escapeHtml(r.label)}</td>
<td align="right" class="t-text" style="padding:11px 0;font-size:14px;font-weight:600;color:${t.text};${i > 0 ? `border-top:1px solid ${t.cardRaisedBorder};` : ""}">${escapeHtml(r.value)}</td>
</tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;">${cells}</table>`;
}

export type BadgeTone = "accent" | "success" | "warning" | "danger";

export function badge(label: string, tone: BadgeTone = "accent"): string {
  const t = EMAIL_THEME;
  const color = {
    accent: t.accent,
    success: t.success,
    warning: t.warning,
    danger: t.danger,
  }[tone];
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr>
<td style="padding:5px 13px;border:1px solid ${color}55;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${color};">${escapeHtml(label)}</td>
</tr></table>`;
}

/** Emphasised stat block, e.g. earnings figures in seller emails. */
export function statBlock(value: string, caption: string): string {
  const t = EMAIL_THEME;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;"><tr>
<td align="center" style="padding:22px;background-color:${t.surfaceSubtle};border:1px solid ${t.cardRaisedBorder};border-radius:12px;">
<div style="font-size:32px;line-height:1.1;font-weight:700;color:${t.accent};">${escapeHtml(value)}</div>
<div class="t-muted" style="margin-top:6px;font-size:13px;color:${t.muted};">${escapeHtml(caption)}</div>
</td></tr></table>`;
}

/** Callout for a supporting message that should not compete with the CTA. */
export function noteBox(text: string): string {
  const t = EMAIL_THEME;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;"><tr>
<td class="t-muted" style="padding:14px 16px;background-color:${t.surfaceSubtle};border-left:3px solid ${t.accent};border-radius:6px;font-size:13px;line-height:1.6;color:${t.muted};">${escapeHtml(text)}</td>
</tr></table>`;
}

export function bulletList(items: string[]): string {
  const t = EMAIL_THEME;
  const rows = items
    .map(
      (item) => `<tr>
<td valign="top" style="padding:0 10px 10px 0;font-size:15px;line-height:1.6;color:${t.accent};">&bull;</td>
<td valign="top" class="t-muted" style="padding:0 0 10px;font-size:15px;line-height:1.6;color:${t.muted};">${escapeHtml(item)}</td>
</tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 18px;">${rows}</table>`;
}

/** Plain-text signature appended to every text alternative. */
export function textFooter(
  brand: EmailBrand,
  unsubscribeUrl?: string,
  locale: "en" | "fr" = "en"
): string {
  const lines = ["", "—", `${brand.brandName}`, brand.siteUrl];
  if (unsubscribeUrl) {
    lines.push("", `${LAYOUT_STRINGS[locale].unsubscribe}: ${unsubscribeUrl}`);
  }
  return lines.join("\n");
}
