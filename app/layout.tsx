import type { Metadata } from "next";
import "@/styles/detail-pages.css";
import "@/styles/feedback-form.css";
import "@/styles/globals.css";
import "@/styles/home-status.css";
import "@/styles/navigation-pages.css";
import "@/styles/report.css";
import "@/styles/rule-center.css";
import "@/styles/rules.css";
import "@/styles/violation.css";

export const metadata: Metadata = {
  title: "EasyFisk",
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
