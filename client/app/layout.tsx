import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import AppShell from "@/components/AppShell";
import AblyNotifications from "@/components/AblyNotifications";

export const metadata: Metadata = {
  title: "Valdyum — AI Agent Marketplace on Stellar",
  description:
    "Build, monetize, and deploy AI agents on the Stellar blockchain. Pay per request with 0x402 protocol.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAFBFC] text-[#0A0E27]">
        <Navbar />
        <main className="pt-[68px]">
          <AppShell>{children}</AppShell>
        </main>
        <AblyNotifications />
      </body>
    </html>
  );
}

