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
import LoadingBarComp from "@/components/loadingbar";

export const metadata: Metadata = {
  title: "Stylus",
  description: footerTexts.description,
  icons: '/icons/logo/logo.svg'
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
                <LoadingBarComp />
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
