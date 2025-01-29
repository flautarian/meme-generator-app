import db from './database'; // SQLite database instance

const SQLiteTemplatesService = {
  addTemplate(blob, name) {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'INSERT INTO templates (blob, name) VALUES (?, ?);',
        [blob, name]);
      resolve(results);
    });
  },

  getAllTemplates() {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'SELECT * FROM templates;');
      resolve(results);
    });
  },

  getTemplateById(id) {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'SELECT * FROM templates WHERE id = ?;',
        [id]);
      resolve(results);
    });
  },

  getTemplateByName(name) {
    const lowerName = name.toLowerCase();
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'SELECT * FROM templates WHERE LOWER(name) LIKE ?;',
        [lowerName]);
      resolve(results);
    });
  },

  updateTemplate(id, updatedData) {
    const { blob, name } = updatedData;
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'UPDATE templates SET blob = ?, name = ? WHERE id = ?;',
        [blob, name, id]);
      resolve(results);
    });
  },

  deleteTemplate(id) {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'DELETE FROM templates WHERE id = ?;',
        [id]);
      resolve(results);
    });
  },
};

export default SQLiteTemplatesService;
