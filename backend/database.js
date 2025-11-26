const fs = require('fs');
const path = require('path');

let db;
let SQL;

// Check if we're using PostgreSQL (Railway/production) or SQLite (local dev)
const DATABASE_URL = process.env.DATABASE_URL;

async function initDatabase() {
  if (DATABASE_URL && DATABASE_URL.includes('postgresql')) {
    // PostgreSQL for production (Railway/Render)
    console.log('🐘 Using PostgreSQL database');
    const { Pool } = require('pg');
    db = new Pool({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await initPostgresSchema();
  } else {
    // SQLite for local development
    console.log('💾 Using SQLite database (local development)');
    const initSqlJs = require('sql.js');
    SQL = await initSqlJs();
    
    const dbPath = path.join(__dirname, 'database.sqlite');
    
    // Load existing database or create new one
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
    
    initSQLiteSchema();
    saveDatabase();
  }
}

function initSQLiteSchema() {
  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS hunts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      thumbnail TEXT,
      locations TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      score INTEGER NOT NULL,
      completion_time INTEGER NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_score 
    ON leaderboard(score DESC, completion_time ASC);
  `);
  
  console.log('✅ SQLite schema initialized');
}

async function initPostgresSchema() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS hunts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        creator_id TEXT NOT NULL,
        thumbnail TEXT,
        locations JSONB NOT NULL,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        completion_time INTEGER NOT NULL,
        timestamp BIGINT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_leaderboard_score 
      ON leaderboard(score DESC, completion_time ASC);
    `);
    console.log('✅ PostgreSQL schema initialized');
  } catch (error) {
    console.error('❌ Error initializing PostgreSQL schema:', error);
  }
}

function saveDatabase() {
  if (isPostgres()) return; // PostgreSQL saves automatically
  
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dbPath = path.join(__dirname, 'database.sqlite');
    fs.writeFileSync(dbPath, buffer);
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

function getDb() {
  return db;
}

function isPostgres() {
  return DATABASE_URL && DATABASE_URL.includes('postgresql');
}

// Export saveDatabase for manual saves
module.exports = {
  initDatabase,
  getDb,
  isPostgres,
  saveDatabase
};