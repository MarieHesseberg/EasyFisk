import type { Metadata } from "next";
import "@/styles/foundations.css";
import "@/styles/map-and-activity.css";
import "@/styles/forms-and-modals.css";
import "@/styles/demo-status.css";
import "@/styles/session-flow.css";
import "@/styles/detail-pages.css";
import "@/styles/feedback-form.css";
import "@/styles/home-status.css";
import "@/styles/statistics-and-rules.css";
import "@/styles/history.css";
import "@/styles/report.css";
import "@/styles/rule-center.css";
import "@/styles/rules.css";
import "@/styles/violation.css";
import "@/styles/mobile-shell.css";
import "@/styles/responsive.css";

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
