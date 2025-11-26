import { motion } from 'motion/react';
import { LogOut, Plus, Edit, Trash2, MapPin } from 'lucide-react';
import type { User, Hunt } from '../App';

interface CreatorDashboardProps {
  user: User;
  hunts: Hunt[];
  onCreateHunt: () => void;
  onEditHunt: (hunt: Hunt) => void;
  onDeleteHunt: (huntId: string) => void;
  onLogout: () => void;
}

export function CreatorDashboard({
  user,
  hunts,
  onCreateHunt,
  onEditHunt,
  onDeleteHunt,
  onLogout
}: CreatorDashboardProps) {
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
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-orange-600">Creator Studio</h1>
                <p className="text-gray-600">{user.name}</p>
              </div>
            </div>
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
      </motion.div>

      {/* Create Button */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateHunt}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl flex items-center justify-center gap-3 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg border-2 border-orange-400"
        >
          <Plus className="w-6 h-6" />
          Create New Quest
        </motion.button>
      </div>

      {/* Hunts List */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-orange-600 mb-6">Your Quests</h2>
        
        {hunts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-2 border-orange-200">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-400 mb-2">No quests yet</h3>
            <p className="text-gray-500">Create your first scavenger hunt to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hunts.map((hunt, index) => (
              <motion.div
                key={hunt.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-200 hover:border-orange-400 transition-all"
              >
                <div className="flex items-start gap-4">
                  {hunt.thumbnail && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-orange-200 to-red-200 flex-shrink-0">
                      <img
                        src={hunt.thumbnail}
                        alt={hunt.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-orange-600 mb-2">{hunt.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{hunt.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{hunt.locations.length} locations</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEditHunt(hunt)}
                      className="p-3 hover:bg-orange-50 rounded-xl transition-colors"
                      title="Edit quest"
                    >
                      <Edit className="w-5 h-5 text-orange-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this quest?')) {
                          onDeleteHunt(hunt.id);
                        }
                      }}
                      className="p-3 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete quest"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
