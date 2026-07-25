import ConvexClientProvider from "@/components/ConvexClientProvider";
import { PostHogIdentity } from "@/components/PostHogIdentity";
import { ThemeProvider } from "@/components/ThemeProvider";
import { EnhancedGlobalAudioPlayer } from "@/components/audio/EnhancedGlobalAudioPlayer";
import { SITE_CONFIG } from "@/lib/env";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Press_Start_2P } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.brand.name,
    template: `%s | ${SITE_CONFIG.brand.name}`,
  },
  description: "Launch your music storefront in minutes. Sell beats and services directly to artists with zero platform fees.",
  keywords: ["music producer platform", "sell beats online", "beat store", "producer storefront", "music licensing", "audio engineer services"],
  authors: [{ name: SITE_CONFIG.brand.name }],
  creator: SITE_CONFIG.brand.name,
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: SITE_CONFIG.brand.name,
    title: SITE_CONFIG.brand.name,
    description: "Launch your music storefront in minutes. Sell beats and services with zero platform fees.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: SITE_CONFIG.brand.name }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@brolabent",
    creator: "@brolabent",
    images: ["/logo.png"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

/**
 * Root Layout
 * 
 * Provider hierarchy (CRITICAL ORDER):
 * 1. ClerkProvider (outermost - auth context)
 * 2. ConvexClientProvider (requires Clerk auth)
 * 3. ThemeProvider (UI theming)
 * 4. EnhancedGlobalAudioPlayer (headless audio engine - mounted once)
 * 
 * Note: PlayerBar UI is mounted in TenantLayout for tenant pages only
 * 
 * Requirements: 2.1, 12.1, 12.2, 26.1, 26.2, 26.3
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        variables: {
          // Spacing and sizing (8px grid)
          borderRadius: "1rem",
          
          // Typography
          fontFamily: `${inter.style.fontFamily}, system-ui, -apple-system, sans-serif`,
          fontSize: "1rem",
          fontWeight: {
            normal: 400,
            medium: 500,
            bold: 600,
          },
        },
        elements: {
          // Card/Modal styling - enhanced glass morphism matching app standard
          card: "glass glow border-[rgba(255,255,255,0.1)]",
          
          // Root box - ensure proper background with font smoothing
          rootBox: "bg-transparent antialiased",
          
          // Form elements - Primary button matching app cyan accent
          formButtonPrimary: 
            "bg-[rgb(34,211,238)] hover:bg-[rgb(6,182,212)] text-[rgb(7,10,15)] font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]",
          
          // Input fields - enhanced visibility with proper borders and backgrounds
          formFieldInput: 
            "bg-[rgba(10,16,32,0.8)] border-[rgba(255,255,255,0.15)] text-[rgb(234,242,255)] placeholder:text-[rgba(155,168,199,0.6)] focus:border-[rgb(34,211,238)] focus:ring-2 focus:ring-[rgba(34,211,238,0.2)] transition-all duration-200",
          
          formFieldInputShowPasswordButton:
            "text-[rgb(155,168,199)] hover:text-[rgb(234,242,255)]",
          
          // Headers and footers
          headerTitle: "text-[rgb(234,242,255)] font-bold text-2xl",
          headerSubtitle: "text-[rgb(155,168,199)] text-base",
          
          // Footer links
          footerActionLink: "text-[rgb(34,211,238)] hover:text-[rgb(6,182,212)] transition-colors duration-200 font-medium",
          footerActionText: "text-[rgb(155,168,199)]",
          
          // Social buttons - enhanced visibility matching app style
          socialButtonsBlockButton: 
            "bg-[rgba(10,16,32,0.6)] border-[rgba(255,255,255,0.15)] hover:border-[rgb(34,211,238)] hover:bg-[rgba(34,211,238,0.1)] text-[rgb(234,242,255)] transition-all duration-200",
          
          socialButtonsBlockButtonText:
            "text-[rgb(234,242,255)] font-medium",
          
          socialButtonsBlockButtonArrow:
            "text-[rgb(155,168,199)]",
          
          // Divider
          dividerLine: "bg-[rgba(255,255,255,0.1)]",
          dividerText: "text-[rgb(155,168,199)] text-sm",
          
          // Form field labels - enhanced visibility
          formFieldLabel: "text-[rgb(234,242,255)] font-semibold text-sm",
          formFieldHintText: "text-[rgb(155,168,199)] text-xs",
          formFieldSuccessText: "text-[rgb(34,211,238)] text-xs",
          formFieldErrorText: "text-[rgb(239,68,68)] text-xs",
          formFieldAction: "text-[rgb(34,211,238)] hover:text-[rgb(6,182,212)] text-sm font-medium",
          
          // Alert/Error messages
          alert: "bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)] text-[rgb(239,68,68)]",
          alertText: "text-sm",
          
          // Avatar
          avatarBox: "bg-[rgba(10,16,32,0.6)] border-[rgba(255,255,255,0.15)]",
          
          // Badges
          badge: "bg-[rgba(34,211,238,0.1)] text-[rgb(34,211,238)] border-[rgba(34,211,238,0.2)]",
          
          // Navbar (for UserButton dropdown)
          navbar: "bg-[rgba(10,16,32,0.95)] border-[rgba(255,255,255,0.1)]",
          navbarButton: "text-[rgb(234,242,255)] hover:text-[rgb(34,211,238)] transition-colors duration-200",
          
          // User button
          userButtonPopoverCard: "bg-[rgba(10,16,32,0.95)] border-[rgba(255,255,255,0.1)] shadow-[0_0_30px_rgba(34,211,238,0.2)]",
          userButtonPopoverActionButton: "hover:bg-[rgba(34,211,238,0.1)] text-[rgb(234,242,255)] transition-colors duration-200",
          userButtonPopoverActionButtonText: "text-[rgb(234,242,255)]",
          userButtonPopoverActionButtonIcon: "text-[rgb(155,168,199)]",
          userButtonPopoverFooter: "border-t border-[rgba(255,255,255,0.1)]",
          
          // Organization switcher
          organizationSwitcherPopoverCard: "bg-[rgba(10,16,32,0.95)] border-[rgba(255,255,255,0.1)] shadow-[0_0_30px_rgba(34,211,238,0.2)]",
          organizationSwitcherTrigger: "bg-[rgba(10,16,32,0.6)] border-[rgba(255,255,255,0.15)] hover:border-[rgb(34,211,238)] transition-all duration-200",
          
          // Identity preview
          identityPreview: "text-[rgb(234,242,255)]",
          identityPreviewText: "text-[rgb(155,168,199)]",
          identityPreviewEditButton: "text-[rgb(34,211,238)] hover:text-[rgb(6,182,212)]",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={`${inter.variable} ${pressStart2P.variable}`}>
        <body className="font-sans antialiased" suppressHydrationWarning>
          <ConvexClientProvider>
            <PostHogIdentity />
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
            >
              {/* Headless audio player - mounted once at app root */}
              <EnhancedGlobalAudioPlayer />
              {children}
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
