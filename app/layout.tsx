import { ThemeProvider } from "@/components/ThemeProvider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BroLab Entertainment",
  description: "Multi-tenant platform for music Providers to sell beats and services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Pixel font for ELECTRI-X style */}
        <link 
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
