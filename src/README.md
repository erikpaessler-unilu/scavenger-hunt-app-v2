# Quest Finder - Scavenger Hunt App

A student-focused scavenger hunt application with map-based gameplay, geolocation tracking, and leaderboard competition.

## Demo Login Credentials

### For Students (Users)
- **Token**: `student`
- All students share the same token
- Progress is saved locally in browser storage

### For Creators (Admin)
- **Token**: `creator123`
- Create and manage scavenger hunts

## Key Features

### Progress Persistence
- **Auto-save**: Hunt progress is automatically saved to browser localStorage
- **Page reload protection**: Your progress is preserved even if you close or reload the page
- **Per-hunt tracking**: Each scavenger hunt maintains separate progress
- Progress is cleared only when you complete a quest or manually reset

### For Students
- Browse available scavenger hunts
- **Real-time location tracking**: See your position relative to quest locations
- Interactive OpenStreetMap with distance calculations
- Progressive unlock: solve riddles to reveal next locations
- Multiple media types: images, videos, audio, text clues
- Text and multiple-choice answer inputs
- **Leaderboard**: Submit your completion time and score
- View top performers on the global leaderboard

### For Creators
- Create custom scavenger hunts
- Add multiple locations with GPS coordinates
- Upload rich media clues (images, videos, audio, text)
- Set text or multiple-choice answers
- Edit and delete existing hunts
- All hunts are stored in localStorage

## How It Works

### Student Experience
1. Login with token `student`
2. Select a quest to start or continue
3. Enable location access to see how far you are from each location
4. View clues and solve puzzles to unlock the next location
5. Complete all locations to finish the quest
6. Submit your name to the leaderboard with your time and score

### Data Storage
- **Hunt Progress**: Stored locally per student (browser localStorage)
- **Hunt Data**: Shared across all users (localStorage simulates database)
- **Leaderboard**: Shared globally (localStorage simulates database)
- **Session**: Auto-restores your login on page refresh

### Scoring System
- Each completed location: 100 points
- Leaderboard ranks by: Points (higher better), then Time (lower better)
- Top 100 scores are maintained

## Technology Stack
- React with TypeScript
- Tailwind CSS for styling
- Motion (Framer Motion) for animations
- Pigeon Maps + OpenStreetMap for mapping
- Browser Geolocation API
- localStorage for data persistence

## Important Notes
- This is a **client-side prototype** using browser localStorage
- All students share the same login token but have individual progress
- Leaderboard is stored locally and simulates a shared database
- For production use, connect to a real backend (e.g., Supabase) for:
  - True multi-user data sharing
  - Secure authentication
  - Persistent cloud storage
  - Real-time leaderboard updates across devices
