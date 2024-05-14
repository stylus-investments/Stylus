import type { Metadata } from "next";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css'
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import TrpcProvider from "./_trpc/TrpcProvider";
import NextAuthSessionProvider from "@/components/auth/NextAuthSessionProvider";
import { footerTexts } from "@/constant/footerTexts";

export const metadata: Metadata = {
  title: "GrowPoint",
  description: footerTexts.description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/go.webp" sizes="any" />
      <NextAuthSessionProvider>
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
      </NextAuthSessionProvider>
    </html>
  );
}
