export type NotificationPreference =
  | "emergencyClosure"
  | "highTemperature"
  | "ruleChanges"
  | "reportingDeadline";

export type UserPreferences = {
  notifications: Record<NotificationPreference, boolean>;
  positionSuggestions: boolean;
  shareAnonymousData: boolean;
};

export const defaultUserPreferences: UserPreferences = {
  notifications: {
    emergencyClosure: true,
    highTemperature: true,
    ruleChanges: true,
    reportingDeadline: true,
  },
  positionSuggestions: true,
  shareAnonymousData: true,
};
