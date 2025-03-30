import db from './database';

const SettingsService = {
  
  async getAllSettings() {
    // return only one settings
    return await db.settings.toArray()[0];
  },

  async updateSettings(settings) {
    // update only one settings
    await db.settings.update(1, settings);
  },
};

export default SettingsService;