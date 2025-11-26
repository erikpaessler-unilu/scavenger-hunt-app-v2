import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { UserDashboard } from './components/UserDashboard';
import { CreatorDashboard } from './components/CreatorDashboard';
import { HuntPlayer, type UserAnswer } from './components/HuntPlayer';
import { HuntCreator } from './components/HuntCreator';
import { Leaderboard } from './components/Leaderboard';
import { ShareableResults } from './components/ShareableResults';

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

  // Load hunts from localStorage on mount
  useEffect(() => {
    const storedHunts = localStorage.getItem('questfinder_hunts');
    if (storedHunts) {
      setHunts(JSON.parse(storedHunts));
    } else {
      // Initialize with default hunts
      const mockHunts: Hunt[] = [
        {
          id: '1',
          title: 'Campus History Quest',
          description: 'Discover the hidden stories behind our university landmarks',
          creatorId: 'creator1',
          thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400',
          locations: [
            {
              id: 'loc1',
              name: 'Main Library',
              lat: 40.7589,
              lng: -73.9851,
              clue: 'Where knowledge meets architecture. Find the year carved above the entrance.',
              media: [
                { type: 'image', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600' },
                { type: 'text', content: 'Look carefully at the main entrance. The answer is a 4-digit year.' }
              ],
              answer: {
                type: 'text',
                correctAnswer: '1897'
              },
              unlocked: true
            },
            {
              id: 'loc2',
              name: 'Student Union',
              lat: 40.7614,
              lng: -73.9776,
              clue: 'A place where students gather. What color is the famous mural on the third floor?',
              media: [
                { type: 'image', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600' },
              ],
              answer: {
                type: 'multiple-choice',
                correctAnswer: 'Blue',
                options: ['Red', 'Blue', 'Green', 'Yellow']
              },
              unlocked: false
            },
            {
              id: 'loc3',
              name: 'Science Building',
              lat: 40.7649,
              lng: -73.9808,
              clue: 'Innovation starts here. What element is featured in the sculpture outside?',
              media: [
                { type: 'text', content: 'Hint: It\'s the building block of life itself!' }
              ],
              answer: {
                type: 'multiple-choice',
                correctAnswer: 'Carbon',
                options: ['Oxygen', 'Carbon', 'Hydrogen', 'Nitrogen']
              },
              unlocked: false
            }
          ]
        },
        {
          id: '2',
          title: 'Art & Culture Trail',
          description: 'Follow the artistic soul of our campus through sculptures and murals',
          creatorId: 'creator1',
          thumbnail: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400',
          locations: [
            {
              id: 'loc4',
              name: 'Sculpture Garden',
              lat: 40.7580,
              lng: -73.9855,
              clue: 'Count the bronze figures in the garden',
              media: [
                { type: 'image', url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600' }
              ],
              answer: {
                type: 'text',
                correctAnswer: '7'
              },
              unlocked: true
            }
          ]
        }
      ];
      localStorage.setItem('questfinder_hunts', JSON.stringify(mockHunts));
      setHunts(mockHunts);
    }
  }, []);

  // Save hunts to localStorage whenever they change
  useEffect(() => {
    if (hunts.length > 0) {
      localStorage.setItem('questfinder_hunts', JSON.stringify(hunts));
    }
  }, [hunts]);

  // Restore user session
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
    // Load progress from localStorage
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

  const handleSaveHunt = (hunt: Hunt) => {
    if (selectedHunt) {
      // Update existing hunt
      setHunts(hunts.map(h => h.id === hunt.id ? hunt : h));
    } else {
      // Add new hunt
      setHunts([...hunts, hunt]);
    }
    handleBackToDashboard();
  };

  const handleDeleteHunt = (huntId: string) => {
    setHunts(hunts.filter(h => h.id !== huntId));
    // Also clear any progress for this hunt
    localStorage.removeItem(`questfinder_progress_${huntId}`);
  };

  const handleUpdateHuntProgress = (updatedHunt: Hunt, startTime?: number) => {
    // Update the hunt in the main list
    setHunts(hunts.map(h => h.id === updatedHunt.id ? updatedHunt : h));
    setSelectedHunt(updatedHunt);
    
    // Save progress to localStorage
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