import db from './database'; // SQLite database instance

const SQLiteDecorationsService = {
  addDecoration(img, name) {
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'INSERT INTO decorations (img, name) VALUES (?, ?);',
        [img, name]);
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
    const { img, name } = updatedData;
    return new Promise((resolve, reject) => {
      const results = db.getAllSync(
        'UPDATE decorations SET img = ?, name = ? WHERE id = ?;',
        [img, name, id]);
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
