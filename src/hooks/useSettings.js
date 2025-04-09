import { Platform } from 'react-native';
// Dynamically import the appropriate service
const SettingsService =
  Platform.OS === 'web'
    ? require('src/services/settingsService').default // Web version (Dexie.js)
    : require('src/services/mobileSettingsService').default; // Mobile version (SQLite)

export const fetchSettings = async () => {
  return await SettingsService.getAllSettings();
};

export const updateSettings = async (settings) => {
  return await SettingsService.updateSettings(settings);
};

