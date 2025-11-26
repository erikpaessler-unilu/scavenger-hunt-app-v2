import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { UserDashboard } from './components/UserDashboard';
import { CreatorDashboard } from './components/CreatorDashboard';
import { HuntPlayer, type UserAnswer } from './components/HuntPlayer';
import { HuntCreator } from './components/HuntCreator';
import { Leaderboard } from './components/Leaderboard';
import { ShareableResults } from './components/ShareableResults';
import { huntAPI } from './api';

export type UserRole = 'user' | 'creator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface MediaContent {
  type: 'image' | 'video' | 'audio' | 'text';
  url?: string;
  content?: string;
}

export interface Answer {
  type: 'text' | 'multiple-choice';
  correctAnswer: string;
  options?: string[];
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  clue: string;
  media: MediaContent[];
  answer: Answer;
  unlocked: boolean;
}

export interface Hunt {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  locations: Location[];
  thumbnail?: string;
}

export type View = 'login' | 'user-dashboard' | 'creator-dashboard' | 'play-hunt' | 'create-hunt' | 'edit-hunt' | 'leaderboard' | 'share-results';

function App() {
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedHunt, setSelectedHunt] = useState<Hunt | null>(null);
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [completionScore, setCompletionScore] = useState<number | undefined>();
  const [completionTime, setCompletionTime] = useState<number | undefined>();
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load hunts from API on mount
  useEffect(() => {
    loadHunts();
  }, []);

  const loadHunts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await huntAPI.getAll();
      setHunts(data);
    } catch (err) {
      console.error('Failed to load hunts:', err);
      setError('Failed to load hunts from server');
      // Fallback to empty array instead of crashing
      setHunts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Restore user session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('questfinder_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      if (user.role === 'user') {
        setCurrentView('user-dashboard');
      } else {
        setCurrentView('creator-dashboard');
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('questfinder_user', JSON.stringify(user));
    if (user.role === 'user') {
      setCurrentView('user-dashboard');
    } else {
      setCurrentView('creator-dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('questfinder_user');
    setCurrentView('login');
    setSelectedHunt(null);
  };

  const handlePlayHunt = (hunt: Hunt) => {
    // Load progress from localStorage (progress stays local)
    const progressKey = `questfinder_progress_${hunt.id}`;
    const storedProgress = localStorage.getItem(progressKey);
    
    if (storedProgress) {
      const progressData = JSON.parse(storedProgress);
      setSelectedHunt(progressData.hunt);
    } else {
      setSelectedHunt(hunt);
    }
    
    setCurrentView('play-hunt');
  };

  const handleCreateHunt = () => {
    setCurrentView('create-hunt');
  };

  const handleEditHunt = (hunt: Hunt) => {
    setSelectedHunt(hunt);
    setCurrentView('edit-hunt');
  };

  const handleBackToDashboard = () => {
    setSelectedHunt(null);
    if (currentUser?.role === 'user') {
      setCurrentView('user-dashboard');
    } else {
      setCurrentView('creator-dashboard');
    }
  };

  const handleSaveHunt = async (hunt: Hunt) => {
    try {
      if (selectedHunt) {
        // Update existing hunt
        await huntAPI.update(hunt.id, {
          title: hunt.title,
          description: hunt.description,
          thumbnail: hunt.thumbnail,
          locations: hunt.locations
        });
        setHunts(hunts.map(h => h.id === hunt.id ? hunt : h));
      } else {
        // Create new hunt
        await huntAPI.create({
          id: hunt.id,
          title: hunt.title,
          description: hunt.description,
          creatorId: hunt.creatorId,
          thumbnail: hunt.thumbnail,
          locations: hunt.locations
        });
        setHunts([...hunts, hunt]);
      }
      handleBackToDashboard();
    } catch (err) {
      console.error('Failed to save hunt:', err);
      alert('Failed to save hunt. Please try again.');
    }
  };

  const handleDeleteHunt = async (huntId: string) => {
    try {
      await huntAPI.delete(huntId);
      setHunts(hunts.filter(h => h.id !== huntId));
      // Also clear any progress for this hunt
      localStorage.removeItem(`questfinder_progress_${huntId}`);
    } catch (err) {
      console.error('Failed to delete hunt:', err);
      alert('Failed to delete hunt. Please try again.');
    }
  };

  const handleUpdateHuntProgress = (updatedHunt: Hunt, startTime?: number) => {
    // Don't update the server, just update local state
    // Progress is kept local per user
    setSelectedHunt(updatedHunt);
    
    // Save progress to localStorage only
    const progressKey = `questfinder_progress_${updatedHunt.id}`;
    const progressData = {
      hunt: updatedHunt,
      startTime: startTime || Date.now(),
      lastUpdated: Date.now()
    };
    localStorage.setItem(progressKey, JSON.stringify(progressData));
  };

  const handleHuntComplete = (hunt: Hunt, score: number, timeInSeconds: number, answers: UserAnswer[]) => {
    setCompletionScore(score);
    setCompletionTime(timeInSeconds);
    setUserAnswers(answers);
    setCurrentView('share-results');
    
    // Clear progress for this hunt
    localStorage.removeItem(`questfinder_progress_${hunt.id}`);
  };

  const handleViewLeaderboard = () => {
    setCompletionScore(undefined);
    setCompletionTime(undefined);
    setCurrentView('leaderboard');
  };

  const handleShareResults = () => {
    setCurrentView('share-results');
  };

  // Show loading state
  if (isLoading && currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {currentView === 'login' && (
        <LoginScreen onLogin={handleLogin} />
      )}

      {currentView === 'user-dashboard' && currentUser && (
        <UserDashboard
          user={currentUser}
          hunts={hunts}
          onPlayHunt={handlePlayHunt}
          onLogout={handleLogout}
          onViewLeaderboard={handleViewLeaderboard}
          isLoading={isLoading}
          error={error}
        />
      )}

      {currentView === 'creator-dashboard' && currentUser && (
        <CreatorDashboard
          user={currentUser}
          hunts={hunts.filter(h => h.creatorId === currentUser.id)}
          onCreateHunt={handleCreateHunt}
          onEditHunt={handleEditHunt}
          onDeleteHunt={handleDeleteHunt}
          onLogout={handleLogout}
        />
      )}

      {currentView === 'play-hunt' && selectedHunt && currentUser && (
        <HuntPlayer
          hunt={selectedHunt}
          onBack={handleBackToDashboard}
          onUpdateProgress={handleUpdateHuntProgress}
          onComplete={handleHuntComplete}
        />
      )}

      {(currentView === 'create-hunt' || currentView === 'edit-hunt') && currentUser && (
        <HuntCreator
          hunt={currentView === 'edit-hunt' ? selectedHunt : undefined}
          userId={currentUser.id}
          onSave={handleSaveHunt}
          onCancel={handleBackToDashboard}
        />
      )}

      {currentView === 'leaderboard' && (
        <Leaderboard
          currentScore={completionScore}
          completionTime={completionTime}
          onBack={handleBackToDashboard}
          showSubmitForm={completionScore !== undefined}
        />
      )}

      {currentView === 'share-results' && selectedHunt && (
        <ShareableResults
          hunt={selectedHunt}
          score={completionScore!}
          completionTime={completionTime!}
          answers={userAnswers}
          onContinue={() => setCurrentView('leaderboard')}
        />
      )}
    </div>
  );
}

export default App;
