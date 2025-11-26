import { useState } from 'react';
import { motion } from 'motion/react';
import { Key, Users } from 'lucide-react';
import type { User } from '../App';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [token, setToken] = useState('');

  const handleLogin = () => {
    // Validate token
    if (token === 'creator123') {
      const mockCreator: User = {
        id: 'creator1',
        name: 'Quest Creator',
        email: 'creator@quest.app',
        role: 'creator'
      };
      onLogin(mockCreator);
    } else if (token === 'student') {
      const mockUser: User = {
        id: 'student',
        name: 'Student',
        email: 'student@quest.app',
        role: 'user'
      };
      onLogin(mockUser);
    } else {
      alert('Invalid token. Try "student" for student access or "creator123" for creator access.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-orange-400">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-block p-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl mb-4"
            >
              <Users className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-orange-600 mb-2">Quest Finder</h1>
            <p className="text-gray-600">Start your adventure today</p>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Access Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your token"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Key className="w-5 h-5" />
              Sign In
            </motion.button>

            <div className="mt-6 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
              <p className="text-sm text-amber-800">
                <strong>Access tokens:</strong><br />
                • <code className="bg-amber-100 px-2 py-1 rounded">student</code> for student access<br />
                • <code className="bg-amber-100 px-2 py-1 rounded">creator123</code> for creator access
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}