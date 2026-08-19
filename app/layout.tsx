import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EasyFisk app-prototype",
  description: "En interaktiv prototype for EasyFisk i Mandalselva.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "./favicon.svg",
    shortcut: "./favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body className="antialiased">{children}</body>
    </html>
  );
}
