import { Platform } from 'react-native';
// Dynamically import the appropriate service
const DecorationsService =
  Platform.OS === 'web'
    ? require('src/services/decorationService').default // Web version (Dexie.js)
    : require('src/services/mobileDecorationService').default; // Mobile version (SQLite)

export const fetchDecorations = async (name) => {
  const result = name.length > 0 ?
    await DecorationsService.getDecorationByName(name) :
    await DecorationsService.getAllDecorations();
  return result;
};