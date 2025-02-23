import db from './database'; // SQLite database instance

const SQLiteDecorationsService = {
  addDecoration(blob, name) {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'INSERT INTO decorations (blob, name) VALUES (?, ?);',
        [blob, name]);
      resolve(results);
    });
  },

  getAllDecorations() {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'SELECT * FROM decorations;');
      resolve(results);
    });
  },

  getDecorationById(id) {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'SELECT * FROM decorations WHERE id = ?;',
        [id]);
      resolve(results);
    });
  },

  getDecorationByName(name) {
    const lowerName = name.toLowerCase();
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'SELECT * FROM decorations WHERE LOWER(name) LIKE ?;',
        [lowerName]);
      resolve(results);
    });
  },

  updateDecoration(id, updatedData) {
    const { blob, name } = updatedData;
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'UPDATE decorations SET blob = ?, name = ? WHERE id = ?;',
        [blob, name, id]);
      resolve(results);
    });
  },

  deleteDecoration(id) {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'DELETE FROM decorations WHERE id = ?;',
        [id]);
      resolve(results);
    });
  },
};

export default SQLiteDecorationsService;
