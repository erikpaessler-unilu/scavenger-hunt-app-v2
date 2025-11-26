import { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle, XCircle } from 'lucide-react';
import type { Answer } from '../App';

interface AnswerInputProps {
  answer: Answer;
  onCorrectAnswer: (submittedAnswer: string) => void;
}

export function AnswerInput({ answer, onCorrectAnswer }: AnswerInputProps) {
  const [userInput, setUserInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    const submittedAnswer = answer.type === 'text' ? userInput.trim() : selectedOption;

    // Simple case-insensitive comparison
    const isCorrect = submittedAnswer?.toLowerCase() === answer.correctAnswer.toLowerCase();

    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setTimeout(() => {
        onCorrectAnswer(submittedAnswer!);
        setUserInput('');
        setSelectedOption(null);
        setFeedback(null);
        setIsSubmitting(false);
      }, 1500);
    } else {
      setTimeout(() => {
        setFeedback(null);
        setIsSubmitting(false);
      }, 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-2 border-orange-300"
    >
      <h3 className="text-orange-600 mb-4">Your Answer</h3>

      {answer.type === 'text' ? (
        <div className="space-y-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSubmitting && handleSubmit()}
            placeholder="Type your answer here..."
            disabled={isSubmitting}
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none transition-colors disabled:bg-gray-100"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {answer.options?.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              onClick={() => !isSubmitting && setSelectedOption(option)}
              disabled={isSubmitting}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedOption === option
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedOption === option
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedOption === option && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-gray-700">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        onClick={handleSubmit}
        disabled={
          isSubmitting ||
          (answer.type === 'text' ? !userInput.trim() : !selectedOption)
        }
        className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-5 h-5" />
        Submit Answer
      </motion.button>

      {/* Feedback */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
            feedback === 'correct'
              ? 'bg-green-50 border-2 border-green-400'
              : 'bg-red-50 border-2 border-red-400'
          }`}
        >
          {feedback === 'correct' ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="text-green-600">Correct!</h4>
                <p className="text-sm text-green-700">Great job! Moving to next location...</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="text-red-600">Not quite right</h4>
                <p className="text-sm text-red-700">Try again!</p>
              </div>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}