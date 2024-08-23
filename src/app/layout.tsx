import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import TrpcProvider from "./_trpc/TrpcProvider";
import { footerTexts } from "@/constant/footerTexts";
import Privy from "@/components/providers/privy-provider";
import { Analytics } from "@vercel/analytics/react"


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
    </html>
  );
}
