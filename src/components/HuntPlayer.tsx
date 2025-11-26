import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, CheckCircle, MapPin, Lock, Navigation } from 'lucide-react';
import { MapComponent } from './MapComponent';
import { ClueCard } from './ClueCard';
import { AnswerInput } from './AnswerInput';
import type { Hunt } from '../App';

export interface UserAnswer {
  locationName: string;
  answer: string;
  correct: boolean;
}

interface HuntPlayerProps {
  hunt: Hunt;
  onBack: () => void;
  onUpdateProgress: (hunt: Hunt, startTime?: number) => void;
  onComplete: (hunt: Hunt, score: number, timeInSeconds: number, answers: UserAnswer[]) => void;
}

export function HuntPlayer({ hunt, onBack, onUpdateProgress, onComplete }: HuntPlayerProps) {
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    hunt.locations.find(loc => loc.unlocked)?.id || null
  );
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  const selectedLocation = hunt.locations.find(loc => loc.id === selectedLocationId);
  const currentIndex = hunt.locations.findIndex(loc => loc.id === selectedLocationId);
  const completedCount = hunt.locations.filter(loc => loc.unlocked).length;
  const isComplete = completedCount === hunt.locations.length;

  // Load or initialize start time and answers from localStorage
  useEffect(() => {
    const progressKey = `questfinder_progress_${hunt.id}`;
    const storedProgress = localStorage.getItem(progressKey);
    
    if (storedProgress) {
      const progressData = JSON.parse(storedProgress);
      setStartTime(progressData.startTime || Date.now());
      setUserAnswers(progressData.userAnswers || []);
    } else {
      const now = Date.now();
      setStartTime(now);
      // Save initial start time
      onUpdateProgress(hunt, now);
    }
  }, []);

  // Handle quest completion
  useEffect(() => {
    if (isComplete && completedCount > 0) {
      const endTime = Date.now();
      const timeInSeconds = Math.floor((endTime - startTime) / 1000);
      const score = hunt.locations.length * 100; // 100 points per location
      
      setTimeout(() => {
        onComplete(hunt, score, timeInSeconds, userAnswers);
      }, 2500); // Give time for the success animation
    }
  }, [isComplete, completedCount]);

  const requestLocationAccess = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsRequestingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationPermission('granted');
        setIsRequestingLocation(false);

        // Continue watching position
        navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            });
          },
          (error) => {
            console.error('Error watching position:', error);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
          }
        );
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setIsRequestingLocation(false);
        alert('Unable to access your location. Please enable location permissions in your browser settings.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCorrectAnswer = (submittedAnswer: string) => {
    if (!selectedLocation) return;

    // Record the user's answer
    const newAnswer: UserAnswer = {
      locationName: selectedLocation.name,
      answer: submittedAnswer,
      correct: true
    };
    
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    setShowSuccessAnimation(true);

    setTimeout(() => {
      // Unlock next location
      const nextIndex = currentIndex + 1;
      if (nextIndex < hunt.locations.length) {
        const updatedHunt = {
          ...hunt,
          locations: hunt.locations.map((loc, idx) =>
            idx === nextIndex ? { ...loc, unlocked: true } : loc
          )
        };
        
        // Save progress with answers
        const progressKey = `questfinder_progress_${hunt.id}`;
        const progressData = {
          hunt: updatedHunt,
          startTime,
          userAnswers: updatedAnswers,
          lastUpdated: Date.now()
        };
        localStorage.setItem(progressKey, JSON.stringify(progressData));
        
        onUpdateProgress(updatedHunt);
        setSelectedLocationId(updatedHunt.locations[nextIndex].id);
      }
      setShowSuccessAnimation(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-6"
      >
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border-2 border-orange-300">
          <div className="flex items-center justify-between mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 hidden sm:inline">Back</span>
            </motion.button>

            <div className="text-center flex-1">
              <h2 className="text-orange-600">{hunt.title}</h2>
              <p className="text-gray-500 text-sm">
                {completedCount} / {hunt.locations.length} locations discovered
              </p>
            </div>

            <div className="w-20" />
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / hunt.locations.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-orange-400 to-red-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map */}
          <div className="order-2 lg:order-1">
            <MapComponent
              locations={hunt.locations}
              selectedLocationId={selectedLocationId}
              onLocationSelect={setSelectedLocationId}
              userLocation={userLocation}
              onRequestLocation={requestLocationAccess}
              locationPermission={locationPermission}
              isRequestingLocation={isRequestingLocation}
            />
          </div>

          {/* Clue Panel */}
          <div className="order-1 lg:order-2">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border-2 border-green-400 text-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block p-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-6"
                  >
                    <CheckCircle className="w-16 h-16 text-white" />
                  </motion.div>
                  <h2 className="text-green-600 mb-4">Quest Complete!</h2>
                  <p className="text-gray-600 mb-6">
                    Congratulations! You've discovered all {hunt.locations.length} locations
                    and completed the {hunt.title} scavenger hunt!
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
                  >
                    Back to Dashboard
                  </motion.button>
                </motion.div>
              ) : selectedLocation ? (
                selectedLocation.unlocked ? (
                  <motion.div
                    key={selectedLocation.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ClueCard location={selectedLocation} />
                    <div className="mt-6">
                      <AnswerInput
                        answer={selectedLocation.answer}
                        onCorrectAnswer={handleCorrectAnswer}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-300 text-center"
                  >
                    <div className="p-6 bg-gray-100 rounded-full inline-block mb-6">
                      <Lock className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-gray-400 mb-4">Location Locked</h3>
                    <p className="text-gray-500">
                      Complete the previous location to unlock this one!
                    </p>
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border-2 border-orange-300 text-center"
                >
                  <div className="p-6 bg-orange-100 rounded-full inline-block mb-6">
                    <MapPin className="w-16 h-16 text-orange-500" />
                  </div>
                  <h3 className="text-orange-600 mb-4">Select a Location</h3>
                  <p className="text-gray-500">
                    Click on a marker on the map to view its clue
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="bg-white rounded-3xl p-12 shadow-2xl"
            >
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
              <h2 className="text-green-600 text-center">Correct!</h2>
              <p className="text-gray-600 text-center">Next location unlocked!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}