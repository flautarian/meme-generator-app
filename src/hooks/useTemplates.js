import { Platform } from 'react-native';
import { Utils } from 'src/utils/Utils';

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

export const addNewTemplate = async (template) => {
  const result = await TemplatesService.addTemplate(template.blob, template.name);
  return result;
};

export const deleteTemplate = async (template) => {
  const result = await TemplatesService.deleteTemplate(template.id);
  return result;
};

export const rebootTemplates = async () => {
  await TemplatesService.rebootTemplates();
  Utils.getInitMemes().forEach((template) => {
    addNewTemplate(template);
  });
};