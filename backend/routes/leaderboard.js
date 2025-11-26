const express = require('express');
const router = express.Router();
const { getDb, isPostgres, saveDatabase } = require('../database');

// Get leaderboard entries (top 100, sorted by score desc, then time asc)
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    
    if (isPostgres()) {
      const result = await db.query(
        'SELECT * FROM leaderboard ORDER BY score DESC, completion_time ASC LIMIT 100'
      );
      res.json(result.rows);
    } else {
      const stmt = db.prepare(
        'SELECT * FROM leaderboard ORDER BY score DESC, completion_time ASC LIMIT 100'
      );
      const entries = [];
      while (stmt.step()) {
        entries.push(stmt.getAsObject());
      }
      stmt.free();
      res.json(entries);
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Submit new leaderboard entry
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { name, score, completionTime } = req.body;
    
    if (!name || score === undefined || completionTime === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate data types
    if (typeof name !== 'string' || typeof score !== 'number' || typeof completionTime !== 'number') {
      return res.status(400).json({ error: 'Invalid data types' });
    }
    
    // Validate ranges
    if (score < 0 || completionTime < 0) {
      return res.status(400).json({ error: 'Score and time must be positive' });
    }
    
    if (name.length > 50) {
      return res.status(400).json({ error: 'Name too long (max 50 characters)' });
    }
    
    const timestamp = Date.now();
    
    if (isPostgres()) {
      const result = await db.query(
        'INSERT INTO leaderboard (name, score, completion_time, timestamp) VALUES ($1, $2, $3, $4) RETURNING id',
        [name.trim(), score, completionTime, timestamp]
      );
      res.status(201).json({ 
        message: 'Entry added successfully', 
        id: result.rows[0].id 
      });
    } else {
      db.run(
        'INSERT INTO leaderboard (name, score, completion_time, timestamp) VALUES (?, ?, ?, ?)',
        [name.trim(), score, completionTime, timestamp]
      );
      saveDatabase(); // Save after insert
      
      // Get the last inserted ID
      const stmt = db.prepare('SELECT last_insert_rowid() as id');
      stmt.step();
      const lastId = stmt.getAsObject().id;
      stmt.free();
      
      res.status(201).json({ 
        message: 'Entry added successfully', 
        id: lastId 
      });
    }
  } catch (error) {
    console.error('Error adding leaderboard entry:', error);
    res.status(500).json({ error: 'Failed to add leaderboard entry' });
  }
});

module.exports = router;
