import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/shell";

export const metadata: Metadata = {
  title: "CareerOS",
  description: "Self-hosted, single-user command center for your job hunt — powered by Foundry Intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
