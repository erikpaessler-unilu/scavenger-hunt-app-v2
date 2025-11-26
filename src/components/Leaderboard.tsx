import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';

export interface LeaderboardEntry {
  name: string;
  score: number;
  completionTime: number; // in seconds
  timestamp: number;
}

interface LeaderboardProps {
  currentScore?: number;
  completionTime?: number;
  onBack: () => void;
  showSubmitForm?: boolean;
}

export function Leaderboard({ currentScore, completionTime, onBack, showSubmitForm = false }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = () => {
    const stored = localStorage.getItem('questfinder_leaderboard');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Sort by score (descending), then by time (ascending)
      parsed.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.completionTime - b.completionTime;
      });
      setEntries(parsed);
    }
  };

  const handleSubmit = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (currentScore === undefined || completionTime === undefined) return;

    const newEntry: LeaderboardEntry = {
      name: playerName.trim(),
      score: currentScore,
      completionTime,
      timestamp: Date.now()
    };

    const stored = localStorage.getItem('questfinder_leaderboard');
    const existing = stored ? JSON.parse(stored) : [];
    existing.push(newEntry);
    
    // Sort by score (descending), then by time (ascending)
    existing.sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.completionTime - b.completionTime;
    });

    // Keep top 100
    const trimmed = existing.slice(0, 100);
    localStorage.setItem('questfinder_leaderboard', JSON.stringify(trimmed));
    
    setEntries(trimmed);
    setHasSubmitted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Award className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-gray-500">#{index + 1}</span>;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-300 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-orange-600">Leaderboard</h1>
                <p className="text-gray-600">Top Quest Completers</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-3 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 hidden sm:inline">Back</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Submit Score Form */}
        {showSubmitForm && !hasSubmitted && currentScore !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-400 mb-6"
          >
            <h2 className="text-green-600 mb-4">🎉 Quest Complete!</h2>
            <p className="text-gray-700 mb-4">
              Your Score: <strong className="text-green-600">{currentScore} points</strong>
              {' • '}
              Time: <strong className="text-green-600">{formatTime(completionTime || 0)}</strong>
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter your name"
                maxLength={20}
                className="flex-1 p-3 border-2 border-green-300 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                Submit to Leaderboard
              </motion.button>
            </div>
          </motion.div>
        )}

        {hasSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 rounded-2xl p-4 mb-6 border-2 border-green-300 text-center"
          >
            <p className="text-green-700">✓ Your score has been added to the leaderboard!</p>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-300"
        >
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-400 mb-2">No entries yet</h3>
              <p className="text-gray-500">Be the first to complete a quest!</p>
            </div>
          ) : (
            <div className="divide-y divide-orange-100">
              {entries.map((entry, index) => (
                <motion.div
                  key={`${entry.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 hover:bg-orange-50 transition-colors ${
                    index < 3 ? 'bg-gradient-to-r from-orange-50 to-transparent' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 flex justify-center">
                      {getRankIcon(index)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-gray-800 truncate">{entry.name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-orange-600">{entry.score} pts</div>
                      <div className="text-sm text-gray-500">{formatTime(entry.completionTime)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
