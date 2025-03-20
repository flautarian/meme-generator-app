import { Platform } from 'react-native';
import { Utils } from 'src/utils/Utils';
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

export const getRandomDecoration = async () => {
  const result = await DecorationsService.getAllDecorations();
  if (result.length === 0)
    return null;
  const randomIndex = Math.floor(Math.random() * result.length);
  return result[randomIndex];
};

export const addNewDecoration = async (decoration) => {
  const result = await DecorationsService.addDecoration(decoration.blob, decoration.name);
  return result;
};

export const deleteDecoration = async (decoration) => {
  const result = await DecorationsService.deleteDecoration(decoration.id);
  return result;
};

export const rebootDecorations = async () => {
  await DecorationsService.rebootDecorations();
  Utils.getInitMemeDecorations().forEach(async (decoration) => {
    await addNewDecoration(decoration);
  });
  return true;
};

