import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
// Dynamically import the appropriate service
const TemplatesService =
  Platform.OS === 'web'
    ? require('src/services/templateService').default // Web version (Dexie.js)
    : require('src/services/mobileTemplateService').default; // Mobile version (SQLite)

export const getRandomMeme = async () => {
  const result = await TemplatesService.getAllTemplates();
  if (result.length === 0)
    return null;
  const randomIndex = Math.floor(Math.random() * result.length);
  return result[randomIndex];
};

export const fetchTemplates = async (name) => {
  const result = name.length > 0 ?
    await TemplatesService.getTemplateByName(name) :
    await TemplatesService.getAllTemplates();
  return result;
};