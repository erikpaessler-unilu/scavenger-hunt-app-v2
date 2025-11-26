const express = require('express');
const router = express.Router();
const { getDb, isPostgres, saveDatabase } = require('../database');

// Get all hunts
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    
    if (isPostgres()) {
      const result = await db.query('SELECT * FROM hunts ORDER BY created_at DESC');
      const hunts = result.rows.map(row => ({
        ...row,
        locations: row.locations
      }));
      res.json(hunts);
    } else {
      const stmt = db.prepare('SELECT * FROM hunts ORDER BY created_at DESC');
      const hunts = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        hunts.push({
          ...row,
          locations: JSON.parse(row.locations)
        });
      }
      stmt.free();
      res.json(hunts);
    }
  } catch (error) {
    console.error('Error fetching hunts:', error);
    res.status(500).json({ error: 'Failed to fetch hunts' });
  }
});

// Get single hunt by ID
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    if (isPostgres()) {
      const result = await db.query('SELECT * FROM hunts WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Hunt not found' });
      }
      res.json({
        ...result.rows[0],
        locations: result.rows[0].locations
      });
    } else {
      const stmt = db.prepare('SELECT * FROM hunts WHERE id = ?');
      stmt.bind([id]);
      
      if (stmt.step()) {
        const hunt = stmt.getAsObject();
        stmt.free();
        res.json({
          ...hunt,
          locations: JSON.parse(hunt.locations)
        });
      } else {
        stmt.free();
        res.status(404).json({ error: 'Hunt not found' });
      }
    }
  } catch (error) {
    console.error('Error fetching hunt:', error);
    res.status(500).json({ error: 'Failed to fetch hunt' });
  }
});

// Create new hunt
router.post('/', async (req, res) => {
  try {
    const db = getDb();
    const { id, title, description, creatorId, thumbnail, locations } = req.body;
    
    if (!id || !title || !description || !creatorId || !locations) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const now = Date.now();
    
    if (isPostgres()) {
      await db.query(
        'INSERT INTO hunts (id, title, description, creator_id, thumbnail, locations, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [id, title, description, creatorId, thumbnail || null, JSON.stringify(locations), now, now]
      );
    } else {
      db.run(
        'INSERT INTO hunts (id, title, description, creator_id, thumbnail, locations, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, title, description, creatorId, thumbnail || null, JSON.stringify(locations), now, now]
      );
      saveDatabase(); // Save after insert
    }
    
    res.status(201).json({ message: 'Hunt created successfully', id });
  } catch (error) {
    console.error('Error creating hunt:', error);
    res.status(500).json({ error: 'Failed to create hunt' });
  }
});

// Update hunt
router.put('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    const { title, description, thumbnail, locations } = req.body;
    
    if (!title || !description || !locations) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const now = Date.now();
    
    if (isPostgres()) {
      const result = await db.query(
        'UPDATE hunts SET title = $1, description = $2, thumbnail = $3, locations = $4, updated_at = $5 WHERE id = $6',
        [title, description, thumbnail || null, JSON.stringify(locations), now, id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Hunt not found' });
      }
    } else {
      db.run(
        'UPDATE hunts SET title = ?, description = ?, thumbnail = ?, locations = ?, updated_at = ? WHERE id = ?',
        [title, description, thumbnail || null, JSON.stringify(locations), now, id]
      );
      saveDatabase(); // Save after update
    }
    
    res.json({ message: 'Hunt updated successfully' });
  } catch (error) {
    console.error('Error updating hunt:', error);
    res.status(500).json({ error: 'Failed to update hunt' });
  }
});

// Delete hunt
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;
    
    if (isPostgres()) {
      const result = await db.query('DELETE FROM hunts WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Hunt not found' });
      }
    } else {
      db.run('DELETE FROM hunts WHERE id = ?', [id]);
      saveDatabase(); // Save after delete
    }
    
    res.json({ message: 'Hunt deleted successfully' });
  } catch (error) {
    console.error('Error deleting hunt:', error);
    res.status(500).json({ error: 'Failed to delete hunt' });
  }
});

module.exports = router;
