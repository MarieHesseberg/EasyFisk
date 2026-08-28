import type { NotificationPreference } from "@/domain/preferences/preferences";

export type LabelValue = { label: string; value: string; isPositive?: boolean };
export type HistoryEntry = { day: string; title: string; time: string; result: string };

export type AppContent = {
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
  activityHistory: readonly HistoryEntry[];
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
  };
};

export interface AppContentRepository {
  getContent(): AppContent;
}
