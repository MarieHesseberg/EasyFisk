import type { NotificationPreference } from "@/domain/preferences/preferences";
import type { DetailDestination } from "@/domain/navigation/navigation";

export type LabelValue = { label: string; value: string; isPositive?: boolean };
export type AppContent = {
  demoFeatures: readonly string[];
  riverStatus: {
    currentZoneName: string;
    currentZoneShortName: string;
    alternatePermitZoneName: string;
    alternatePermitZoneShortName: string;
    permitExpiry: string;
    disinfectionSummary: string;
    temperatureCelsius: number;
    flowCubicMetersPerSecond: number;
    measurementStation: string;
  };
  headerAlerts: readonly { icon: string; message: string }[];
  statistics: {
    areas: readonly string[];
    periods: readonly string[];
    totalCatches: string;
    metrics: readonly { icon: string; label: string; value: string }[];
    weeklyCatchPercentages: readonly number[];
    zoneCatchPercentages: readonly number[];
    zoneCatchTotals: readonly number[];
  };
  feedback: {
    categories: readonly string[];
    organizationName: string;
    reference: string;
    positionLabel: string;
  };
  profile: {
    initials: string;
    fisherId: string;
    name: string;
    maskedPhone: string;
    language: string;
    controlCodePrefix: string;
    controlCardRows: readonly LabelValue[];
    activePermit: { zone: string; summary: string; number: string; holder: string; area: string };
    previousPermits: readonly { title: string; description: string }[];
    disinfection: {
      station: string;
      registeredAt: string;
      validUntil: string;
      otherRivers: string;
    };
    disinfectionStations: readonly { title: string; description: string }[];
    favoriteSuggestion: string;
    favoriteZoneDescriptions: readonly string[];
    notificationStatus: string;
    notificationOptions: readonly {
      id: NotificationPreference;
      label: string;
      description: string;
    }[];
    menuItems: readonly {
      destination: Exclude<DetailDestination, "feedback" | "control-card">;
      icon: string;
      title: string;
      description: string;
    }[];
  };
};

export interface AppContentRepository {
  getContent(): AppContent;
}
