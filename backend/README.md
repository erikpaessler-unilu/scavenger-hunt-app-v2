# Scavenger Hunt Backend API

Backend API for the Scavenger Hunt App. Handles hunt management and leaderboard storage.

## Features

- 🎯 Hunt CRUD operations (Create, Read, Update, Delete)
- 🏆 Leaderboard management with concurrent write support
- 💾 SQLite for local development (no setup needed)
- 🐘 PostgreSQL for production (Railway/Render)
- 🔄 Easy migration from dev to production

## Local Development Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or use nodemon for auto-reload during development:
   ```bash
   npm run dev
   ```

4. Server will be running at `http://localhost:3000`

The database will automatically be created as `database.sqlite` in the backend folder.

## API Endpoints

### Hunts

- `GET /api/hunts` - Get all hunts
- `GET /api/hunts/:id` - Get single hunt by ID
- `POST /api/hunts` - Create new hunt
- `PUT /api/hunts/:id` - Update hunt
- `DELETE /api/hunts/:id` - Delete hunt

### Leaderboard

- `GET /api/leaderboard` - Get top 100 entries
- `POST /api/leaderboard` - Submit new entry

### Health Check

- `GET /api/health` - Check if API is running

## Deployment to Railway (Free Tier)

### Step 1: Push to GitHub

Make sure your backend code is in your GitHub repository:

```bash
git add backend/
git commit -m "Add backend API"
git push
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repository
6. Railway will auto-detect it's a Node.js app
7. Add PostgreSQL:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically sets DATABASE_URL
8. Configure:
   - Go to your service settings
   - Set Root Directory: `backend`
   - Start Command: `npm start`
9. Deploy! Railway will build and run your backend

Your API will be available at: `https://your-app.railway.app`

### Step 3: Update Frontend

In your React app, update the API URL:

```javascript
// In your frontend, create a config file
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.railway.app/api'
  : 'http://localhost:3000/api';
```

## Deployment to Render (Alternative)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - Name: scavenger-hunt-api
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add PostgreSQL:
   - Click "New" → "PostgreSQL"
   - Copy the Internal Database URL
   - Add it as `DATABASE_URL` environment variable in your web service
7. Deploy!

## Moving to Their Server (Production)

When ready to deploy on the client's server:

### Step 1: Copy Backend Files

Copy the entire `backend` folder to their server.

### Step 2: Install Dependencies

```bash
cd backend
npm install --production
```

### Step 3: Set Up PostgreSQL

Install PostgreSQL on their server or use existing database, then create the database:

```bash
createdb scavenger_hunt
```

### Step 4: Configure Database

Create a `.env` file:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/scavenger_hunt
PORT=3000
```

### Step 5: Initialize Database

The schema will be created automatically on first run.

### Step 6: Start the Server

```bash
npm start
```

Or use PM2 for production:

```bash
npm install -g pm2
pm2 start server.js --name scavenger-hunt-api
pm2 save
pm2 startup
```

### Step 7: Configure Nginx (Optional)

If using Nginx as reverse proxy:

```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## Database Migration

To export data from Railway/Render to their server:

### From Railway:

```bash
# Export from Railway
railway run pg_dump > backup.sql

# Import to their server
psql scavenger_hunt < backup.sql
```

### From Render:

```bash
# Get database URL from Render dashboard
pg_dump <RENDER_DATABASE_URL> > backup.sql

# Import to their server
psql scavenger_hunt < backup.sql
```

## Troubleshooting

### Port Already in Use

Change the port in `.env`:
```
PORT=3001
```

### Database Connection Error

Check your DATABASE_URL format:
```
postgresql://username:password@host:5432/database
```

### CORS Errors

Update CORS settings in `server.js` if needed.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database (Dev):** SQLite (better-sqlite3)
- **Database (Prod):** PostgreSQL (pg)
- **Middleware:** CORS for cross-origin requests

## License

MIT
