import { motion } from 'motion/react';
import { LogOut, Play, MapPin, Trophy } from 'lucide-react';
import type { User, Hunt } from '../App';

interface UserDashboardProps {
  user: User;
  hunts: Hunt[];
  onPlayHunt: (hunt: Hunt) => void;
  onLogout: () => void;
  onViewLeaderboard: () => void;
}

export function UserDashboard({ user, hunts, onPlayHunt, onLogout, onViewLeaderboard }: UserDashboardProps) {
  const getProgress = (hunt: Hunt) => {
    // Check localStorage for progress
    const progressKey = `questfinder_progress_${hunt.id}`;
    const storedProgress = localStorage.getItem(progressKey);
    
    let locations = hunt.locations;
    if (storedProgress) {
      const progressData = JSON.parse(storedProgress);
      locations = progressData.hunt.locations;
    }
    
    const unlocked = locations.filter(loc => loc.unlocked).length;
    const total = locations.length;
    return { unlocked, total, percentage: (unlocked / total) * 100 };
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-orange-600">Welcome back, {user.name}!</h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onViewLeaderboard}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:from-yellow-500 hover:to-orange-600 transition-all shadow-md flex items-center gap-2"
              >
                <Trophy className="w-5 h-5" />
                <span className="hidden sm:inline">Leaderboard</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hunts Grid */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-orange-600 mb-6">Available Quests</h2>
        
        {hunts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-orange-200">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-400 mb-2">No quests available</h3>
            <p className="text-gray-500">Check back soon for new adventures!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hunts.map((hunt, index) => {
              const progress = getProgress(hunt);
              return (
                <motion.div
                  key={hunt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-orange-200 hover:border-orange-400 transition-all"
                >
                  {/* Thumbnail */}
                  {hunt.thumbnail && (
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-orange-200 to-red-200">
                      <img
                        src={hunt.thumbnail}
                        alt={hunt.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-orange-600 mb-2">{hunt.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{hunt.description}</p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm text-orange-600">
                          {progress.unlocked} / {progress.total} locations
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.percentage}%` }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="h-full bg-gradient-to-r from-orange-400 to-red-500"
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onPlayHunt(hunt)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-xl flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600 transition-all shadow-md"
                    >
                      <Play className="w-5 h-5" />
                      {progress.unlocked === 0 ? 'Start Quest' : 'Continue Quest'}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}