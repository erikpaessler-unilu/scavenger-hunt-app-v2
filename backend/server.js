const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database');
const huntsRouter = require('./routes/hunts');
const leaderboardRouter = require('./routes/leaderboard');
const mediaRouter = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/hunts', huntsRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/media', mediaRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});
