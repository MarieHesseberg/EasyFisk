import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "@/styles/foundations.css";
import "@/styles/home-overview.css";
import "@/styles/navigation-and-prototype.css";
import "@/styles/map.css";
import "@/styles/interactive-map.css";
import "@/styles/map-permits.css";
import "@/styles/permit-shop.css";
import "@/styles/permit-product-detail.css";
import "@/styles/permit-seller-contact.css";
import "@/styles/permit-checkout.css";
import "@/styles/activity-and-history-cards.css";
import "@/styles/forms-and-modals.css";
import "@/styles/statistics-widgets.css";
import "@/styles/personal-statistics.css";
import "@/styles/profile-menu.css";
import "@/styles/catch-form-shell.css";
import "@/styles/demo-status.css";
import "@/styles/session-flow.css";
import "@/styles/session-history-detail.css";
import "@/styles/zone-and-rules-flow.css";
import "@/styles/home-feedback.css";
import "@/styles/profile-details.css";
import "@/styles/header-and-map-details.css";
import "@/styles/feedback-form.css";
import "@/styles/feedback-review.css";
import "@/styles/home-status.css";
import "@/styles/statistics-and-rules.css";
import "@/styles/history.css";
import "@/styles/report-detail.css";
import "@/styles/report.css";
import "@/styles/rule-center.css";
import "@/styles/rules.css";
import "@/styles/violation.css";
import "@/styles/mobile-shell.css";
import "@/styles/responsive.css";
import "@/styles/documents.css";
import "@/styles/scroll-indicator.css";

export const metadata: Metadata = {
  title: "EasyFisk",
  description: "Prototypen EasyFisk for Mandalselva Elveeigarlag.",
  openGraph: {
    title: "EasyFisk",
    description: "Prototypen EasyFisk for Mandalselva Elveeigarlag.",
    type: "website",
    locale: "nb_NO",
    siteName: "EasyFisk",
  },
  twitter: {
    card: "summary",
    title: "EasyFisk",
    description: "Prototypen EasyFisk for Mandalselva Elveeigarlag.",
  },
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
      <body>{children}</body>
    </html>
  );
}
