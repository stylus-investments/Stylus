import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import TrpcProvider from "./_trpc/TrpcProvider";
import { footerTexts } from "@/constant/footerTexts";
import Privy from "@/components/providers/privy-provider";
import { Analytics } from "@vercel/analytics/react"
import SessionProviders from "@/components/providers/session-provider";
import { SpeedInsights } from "@vercel/speed-insights/next"


export const metadata: Metadata = {
  title: "Stylus",
  description: footerTexts.description,
  icons: '/save.webp'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProviders>
        <Privy>
          <TrpcProvider>
            <body>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster />
              </ThemeProvider>
            </body>
          </TrpcProvider>
        </Privy>
        <Analytics />
        <SpeedInsights />
      </SessionProviders>
    </html>
  );
}
