export type NotificationPreference =
  | "emergencyClosure"
  | "highTemperature"
  | "ruleChanges"
  | "reportingDeadline";

export type UserPreferences = {
  favoriteZones: string[];
  notifications: Record<NotificationPreference, boolean>;
  positionSuggestions: boolean;
  shareAnonymousData: boolean;
};

export const defaultUserPreferences: UserPreferences = {
  favoriteZones: ["Sone 3 · Øyslebø–Laudal", "Sone 2 · Fuskeland B"],
  notifications: {
    emergencyClosure: true,
    highTemperature: true,
    ruleChanges: true,
    reportingDeadline: true,
  },
  positionSuggestions: true,
  shareAnonymousData: true,
};
