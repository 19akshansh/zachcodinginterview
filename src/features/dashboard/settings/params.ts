import { parseAsStringEnum } from "nuqs/server";

export const SETTINGS_TABS = [
  "general",
  "api-keys",
  "billing",
  "recruiter",
  "danger-zone",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const settingsParams = {
  tab: parseAsStringEnum<SettingsTab>([...SETTINGS_TABS])
    .withDefault("general")
    .withOptions({ clearOnDefault: true }),
};
