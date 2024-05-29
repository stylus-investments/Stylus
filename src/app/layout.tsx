import type { Metadata } from "next";
import "./globals.css";
import '@rainbow-me/rainbowkit/styles.css'
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import TrpcProvider from "./_trpc/TrpcProvider";
import NextAuthSessionProvider from "@/components/auth/NextAuthSessionProvider";
import { footerTexts } from "@/constant/footerTexts";

export const metadata: Metadata = {
  title: "Savern",
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
