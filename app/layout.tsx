import type { Metadata } from "next";
import "./globals.css";
import "./light-theme.css";

export const metadata: Metadata = {
  title: "Nucleus · Zero Rent CRM",
  description: "AI-powered lead and sales operations for premium coworking spaces.",
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
