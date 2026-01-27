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
        baseTheme: undefined, // Let CSS variables handle theming
        variables: {
          // Dribbble design tokens - cyan accent theme
          colorPrimary: "rgb(34 211 238)", // --accent in dark mode
          colorTextOnPrimaryBackground: "rgb(7 10 15)", // Dark text on cyan button for better contrast
          colorBackground: "rgba(10 16 32, 0.6)", // --bg-2 with glass alpha
          colorInputBackground: "rgba(10 16 32, 0.8)", // Slightly more opaque for inputs
          colorInputText: "rgb(234 242 255)", // --text in dark mode
          
          // Border and focus states
          colorDanger: "rgb(239 68 68)", // red-500 for errors
          colorSuccess: "rgb(34 211 238)", // cyan accent
          colorWarning: "rgb(251 191 36)", // amber-400
          
          // Spacing and sizing (8px grid)
          borderRadius: "1rem", // 16px = 2 * 8px
          spacingUnit: "0.5rem", // 8px base unit
          
          // Typography
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          fontSize: "1rem", // 16px
          fontWeight: {
            normal: 400,
            medium: 500,
            bold: 600,
          },
        },
        elements: {
          // Card/Modal styling - glass morphism
          card: "glass glow", // Use utility classes from globals.css
          
          // Form elements
          formButtonPrimary: 
            "bg-accent hover:bg-accent-2 text-bg font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2",
          
          formFieldInput: 
            "glass border-border focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-200",
          
          // Headers and footers
          headerTitle: "text-text font-semibold",
          headerSubtitle: "text-muted",
          
          // Footer links
          footerActionLink: "text-accent hover:text-accent-2 transition-colors duration-200",
          
          // Social buttons
          socialButtonsBlockButton: 
            "glass border-border hover:border-accent transition-all duration-200",
          
          // Divider
          dividerLine: "border-border",
          dividerText: "text-muted",
          
          // Form field labels
          formFieldLabel: "text-text font-medium",
          formFieldHintText: "text-muted text-sm",
          
          // Alert/Error messages
          alertText: "text-sm",
          
          // Avatar
          avatarBox: "glass border-border",
          
          // Badges
          badge: "glass text-accent border-accent/20",
          
          // Navbar (for UserButton dropdown)
          navbar: "glass border-border",
          navbarButton: "text-text hover:text-accent transition-colors duration-200",
          
          // User button
          userButtonPopoverCard: "glass glow border-border",
          userButtonPopoverActionButton: "hover:bg-accent/10 transition-colors duration-200",
          
          // Organization switcher
          organizationSwitcherPopoverCard: "glass glow border-border",
          organizationSwitcherTrigger: "glass border-border hover:border-accent transition-all duration-200",
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
