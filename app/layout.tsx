import type { Metadata } from "next";
import "./globals.css";
import "./light-theme.css";
import "./crm.css";

export const metadata: Metadata = {
  title: "Abundance Group · Workspace CRM",
  description: "Lead, sales, conversations and billing for Abundance Group managed workspaces.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
