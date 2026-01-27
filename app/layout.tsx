import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "BroLab Entertainment",
  description: "Multi-tenant platform for music Providers to sell beats and services",
  alternates: { canonical: "/" },
};

/**
 * Root Layout
 * 
 * Provider hierarchy (CRITICAL ORDER):
 * 1. ClerkProvider (outermost - auth context)
 * 2. ConvexClientProvider (requires Clerk auth)
 * 3. ThemeProvider (UI theming)
 * 
 * Requirements: 2.1, 26.1, 26.2, 26.3
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          // Spacing and sizing (8px grid)
          borderRadius: "1rem",
          spacingUnit: "0.5rem",
          
          // Typography
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
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
          
          // Root box - ensure proper background
          rootBox: "bg-transparent",
          
          // Form elements - Primary button matching app cyan accent
          formButtonPrimary: 
            "bg-[rgb(34,211,238)] hover:bg-[rgb(6,182,212)] text-[rgb(7,10,15)] font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]",
          
          // Input fields - enhanced visibility with proper borders and backgrounds
          formFieldInput: 
            "bg-[rgba(10,16,32,0.8)] border-[rgba(255,255,255,0.15)] text-[rgb(234,242,255)] placeholder:text-[rgba(155,168,199,0.6)] focus:border-[rgb(34,211,238)] focus:ring-2 focus:ring-[rgba(34,211,238,0.2)] transition-all duration-200 backdrop-blur-sm",
          
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
            "bg-[rgba(10,16,32,0.6)] border-[rgba(255,255,255,0.15)] hover:border-[rgb(34,211,238)] hover:bg-[rgba(34,211,238,0.1)] text-[rgb(234,242,255)] transition-all duration-200 backdrop-blur-sm",
          
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
          navbar: "bg-[rgba(10,16,32,0.95)] border-[rgba(255,255,255,0.1)] backdrop-blur-xl",
          navbarButton: "text-[rgb(234,242,255)] hover:text-[rgb(34,211,238)] transition-colors duration-200",
          
          // User button
          userButtonPopoverCard: "bg-[rgba(10,16,32,0.95)] border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.2)]",
          userButtonPopoverActionButton: "hover:bg-[rgba(34,211,238,0.1)] text-[rgb(234,242,255)] transition-colors duration-200",
          userButtonPopoverActionButtonText: "text-[rgb(234,242,255)]",
          userButtonPopoverActionButtonIcon: "text-[rgb(155,168,199)]",
          userButtonPopoverFooter: "border-t border-[rgba(255,255,255,0.1)]",
          
          // Organization switcher
          organizationSwitcherPopoverCard: "bg-[rgba(10,16,32,0.95)] border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.2)]",
          organizationSwitcherTrigger: "bg-[rgba(10,16,32,0.6)] border-[rgba(255,255,255,0.15)] hover:border-[rgb(34,211,238)] transition-all duration-200",
          
          // Identity preview
          identityPreview: "text-[rgb(234,242,255)]",
          identityPreviewText: "text-[rgb(155,168,199)]",
          identityPreviewEditButton: "text-[rgb(34,211,238)] hover:text-[rgb(6,182,212)]",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Pixel font for ELECTRI-X style */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" 
            rel="stylesheet"
          />
        </head>
        <body className="font-sans antialiased">
          <ConvexClientProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
            >
              {children}
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
