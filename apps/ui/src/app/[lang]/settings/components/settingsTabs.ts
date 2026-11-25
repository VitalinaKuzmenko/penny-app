export const SETTINGS_TABS = ['categories', 'tags', 'accounts'] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];
