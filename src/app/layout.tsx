import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner"
import TrpcProvider from "./_trpc/TrpcProvider";
import NextAuthSessionProvider from "@/components/auth/NextAuthSessionProvider";

export const metadata: Metadata = {
  title: "GrowPoint",
  description: "Merging open finance with real world assets, creating a robust ecosystem for stable growth and innovative yield opportunities.Making. Growth. Relevant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href="/go.webp" sizes="any" />
      <TrpcProvider>
        <NextAuthSessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <body>
              {children}
              <Toaster />
            </body>
          </ThemeProvider>
        </NextAuthSessionProvider>
      </TrpcProvider>
    </html>
  );
}
