import db from './database'; // SQLite database instance

const SQLiteSettingsService = {
  getAllSettings() {
    return new Promise((resolve, reject) => {
      try {
        const results = db.getAllSync(
          'SELECT * FROM settings LIMIT 1;');
        resolve(results[0]);
      }
      catch (err) {
        reject(err);
      }
    });
  },
  updateSettings(settings) {
    return new Promise((resolve, reject) => {
      const { valuesStored } = settings;
      try {
        const results = db.getAllSync(
          'UPDATE settings SET valuesStored = ? WHERE id = ?;',
          [valuesStored, 1]);
        resolve(results);
      } catch (err) {
        reject(err);
      }
    });
  }
};

export default SQLiteSettingsService;
