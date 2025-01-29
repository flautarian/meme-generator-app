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

// Helper function to convert image to base64
const getBase64Image = async (imagePath) => {
  const response = await fetch(imagePath);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

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
    templates: '++id, name, blob', // Auto-incrementing ID, image path, and name
    decorations: '++id, name, blob', // Auto-incrementing ID, image path, and name
    inputs: '++id, templateId, xAxis, yAxis, value', // Auto-incrementing ID, FK, coordinates, and value
  });
  // check if templates table is empty to fill with initMemes data
  db.templates.count().then((count) => {
    if (count === 0) {
      let c = Utils.getInitMemes();
      c.forEach(async (meme) => {
        // process each image to convert it to base64 to save in db
        meme.blob = await getBase64Image(meme.blob);
      });
      db.templates.bulkAdd(c).catch((err) => {
        console.error('Failed to insert initial memes:', err);
      });
    }
  });
  // check if decorations table is empty to fill with initMemeDecorations data
  db.decorations.count().then((count) => {
    if (count === 0) {
      let c = Utils.getInitMemeDecorations();
      c.forEach(async (decoration) => {
        // process each image to convert it to base64 to save in db
        decoration.blob = await getBase64Image(decoration.blob);
      });
      db.decorations.bulkAdd(c).catch((err) => {
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
  const db = SQLite.openDatabaseSync('meme-factory.db');

  try {
    const dropTablesQuery = `
        DROP TABLE IF EXISTS templates;
        DROP TABLE IF EXISTS decorations;
        DROP TABLE IF EXISTS inputs;
      `;

    const createTemplatesTableQuery = `
          CREATE TABLE IF NOT EXISTS templates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            blob TEXT NOT NULL  -- Base64-encoded image string
          );
        `;

    const createDecorationsTableQuery = `
          CREATE TABLE IF NOT EXISTS decorations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            blob TEXT NOT NULL  -- Base64-encoded image string
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
        INSERT INTO templates (blob, name) VALUES (?, ?);
      `;

    const insertDecorationQuery = `
        INSERT INTO decorations (blob, name) VALUES (?, ?);
      `;

    // creating if case, templates and inputs tables
    //db.runSync(dropTablesQuery);
    db.runSync(createTemplatesTableQuery);
    db.runSync(createDecorationsTableQuery);
    db.runSync(createInputsTableQuery);

    console.log('Database initialized with schema!');

    // Initialize with default data if empty
    const initialTemplates = db.getAllSync('SELECT COUNT(*) AS count FROM templates;');
    let result = initialTemplates[0];

    if (result.count == 0) {
      for (let i = 0; i < Utils.getInitMemes().length; i++) {
        const meme = Utils.getInitMemes()[i];
        db.runSync(insertTemplateQuery, [meme.blob, meme.name]);
      }
    }
    const createdTemplates = db.getAllSync('SELECT COUNT(*) AS count FROM templates;');
    let resultCreatedTemplates = createdTemplates[0];
    console.log("Created templates:", resultCreatedTemplates.count);


    const initialDecorations = db.getAllSync('SELECT COUNT(*) AS count FROM decorations;');
    result = initialDecorations[0];

    if (result.count == 0) {
      for (let i = 0; i < Utils.getInitMemeDecorations().length; i++) {
        const decoration = Utils.getInitMemeDecorations()[i];
        db.runSync(insertDecorationQuery, [decoration.blob, decoration.name]);
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
