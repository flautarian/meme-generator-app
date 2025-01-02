import { Platform } from 'react-native';
import { DATABASE_NAME } from 'src/config';
import { Utils } from 'src/utils/Utils';

// Init properly libraries depending on the platform
var SQLite;
var Dexie, dexieWorker;
if (Platform.OS === 'web') {
  Dexie = require('dexie').default;
  dexieWorker = require("dexie-worker");
}
else {
  SQLite = require('expo-sqlite');
}

// Define a function-based Dexie instance

function createDatabase(name) {
  if (Platform.OS === 'web') {
    return createWebWorkerDb();
  }
  else {
    return createMobileDb();
  }
}

const createWebWorkerDb = () => {
  console.log('Creating/Opening Dexie database...');
  // Web/Electron ->  DexieJs
  const db = new Dexie(name);
  // Define tables and their schemas
  db.version(1).stores({
    templates: '++id, img, name', // Auto-incrementing ID, image path, and name
    inputs: '++id, templateId, xAxis, yAxis, value', // Auto-incrementing ID, FK, coordinates, and value
  });
  // check if db is empty to fill with initMemes data
  db.templates.count().then((count) => {
    if (count === 0) {
      db.templates.bulkAdd(Utils.getInitMemes()).catch((err) => {
        console.error('Failed to insert initial memes:', err);
      });
    }
  });
  return dexieWorker.getWebWorkerDB(db);
}
// Native ->  Expo-SQLite

const createMobileDb = () => {
  // Native ->  Expo-SQLite
  if (!SQLite)
    return;

  console.log('Creating/Opening Sqlite database...');
  const db = SQLite.openDatabaseSync('meme-generator.db');

  try {
    const createTemplatesTableQuery = `
          CREATE TABLE IF NOT EXISTS templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            img TEXT NOT NULL,
            name TEXT NOT NULL
          );
        `;

    const createInputsTableQuery = `
          CREATE TABLE IF NOT EXISTS Inputs (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            templateId INTEGER,
            xAxis INTEGER,
            yAxis INTEGER,
            value VARCHAR(255),
            FOREIGN KEY (templateId) REFERENCES templates(ID) ON DELETE CASCADE
          );
        `;

    const insertTemplateQuery = `
          INSERT INTO templates (img, name) VALUES (?, ?);
        `;

    // creating if case, templates and inputs tables
    db.runSync(createTemplatesTableQuery);
    db.runSync(createInputsTableQuery);

    console.log('Database initialized with schema!');

    // Initialize with default data if empty
    const initialTemplates = db.getAllSync('SELECT COUNT(*) AS count FROM templates;');
    const result = initialTemplates[0];

    if (result.count == 0) {
      for (let i = 0; i < initMemes.length; i++) {
        const meme = initMemes[i];
        db.runSync(insertTemplateQuery, [meme.img, meme.name]);
      }
    }
  } catch (error) {
    console.error('Error reading or executing SQL file:', error);
  }
  return db;
}

// Initialize with Web Worker DB insance
const db = createDatabase(DATABASE_NAME);

// Export the ref to the backend
export default db;
