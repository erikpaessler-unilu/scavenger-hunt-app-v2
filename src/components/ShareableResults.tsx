import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Trophy, Clock, Target, CheckCircle } from 'lucide-react';
import type { Hunt } from '../App';
import type { UserAnswer } from './HuntPlayer';

interface ShareableResultsProps {
  hunt: Hunt;
  score: number;
  completionTime: number;
  answers: UserAnswer[];
  onContinue: () => void;
}

export function ShareableResults({ 
  hunt, 
  score, 
  completionTime, 
  answers,
  onContinue 
}: ShareableResultsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerName, setPlayerName] = useState('');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownloadImage = async () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 600 + (answers.length * 80);

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 200);
      gradient.addColorStop(0, '#fb923c');
      gradient.addColorStop(0.5, '#f87171');
      gradient.addColorStop(1, '#f472b6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, 200);

      // Header decorative circles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(700, -50, 150, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(100, 250, 120, 0, Math.PI * 2);
      ctx.fill();

      // Trophy icon placeholder (white circle)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(400, 60, 40, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🏆', 400, 75);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Quest Completed!', 400, 140);

      // Hunt title
      ctx.font = '24px sans-serif';
      ctx.fillText(hunt.title, 400, 175);

      // Player name badge
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(300, 220, 200, 45);
      ctx.strokeStyle = '#fdba74';
      ctx.lineWidth = 2;
      ctx.strokeRect(300, 220, 200, 45);
      
      ctx.fillStyle = '#9a3412';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(playerName, 400, 248);

      // Stats boxes
      const statsY = 300;
      
      // Points box
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(50, statsY, 200, 100);
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, statsY, 200, 100);
      ctx.fillStyle = '#ca8a04';
      ctx.font = '32px sans-serif';
      ctx.fillText(score.toString(), 150, statsY + 50);
      ctx.font = '14px sans-serif';
      ctx.fillText('Points', 150, statsY + 75);

      // Time box
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(300, statsY, 200, 100);
      ctx.strokeStyle = '#93c5fd';
      ctx.strokeRect(300, statsY, 200, 100);
      ctx.fillStyle = '#2563eb';
      ctx.font = '32px sans-serif';
      ctx.fillText(formatTime(completionTime), 400, statsY + 50);
      ctx.font = '14px sans-serif';
      ctx.fillText('Time', 400, statsY + 75);

      // Locations box
      ctx.fillStyle = '#d1fae5';
      ctx.fillRect(550, statsY, 200, 100);
      ctx.strokeStyle = '#6ee7b7';
      ctx.strokeRect(550, statsY, 200, 100);
      ctx.fillStyle = '#059669';
      ctx.font = '32px sans-serif';
      ctx.fillText(answers.length.toString(), 650, statsY + 50);
      ctx.font = '14px sans-serif';
      ctx.fillText('Locations', 650, statsY + 75);

      // Answers section
      ctx.fillStyle = '#ea580c';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('My Journey:', 50, 450);

      // Draw each answer
      answers.forEach((answer, index) => {
        const y = 490 + (index * 80);
        
        // Answer box
        ctx.fillStyle = '#fff7ed';
        ctx.fillRect(50, y, 700, 70);
        ctx.strokeStyle = '#fed7aa';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, y, 700, 70);

        // Number circle
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(85, y + 35, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((index + 1).toString(), 85, y + 40);

        // Location name
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(answer.locationName, 115, y + 25);

        // Answer text
        ctx.fillStyle = '#4b5563';
        ctx.font = '14px sans-serif';
        const answerText = `Answer: "${answer.answer}"`;
        // Truncate if too long
        const maxWidth = 580;
        const truncated = answerText.length > 50 ? answerText.substring(0, 50) + '..."' : answerText;
        ctx.fillText(truncated, 115, y + 50);

        // Checkmark or X
        ctx.fillStyle = answer.correct ? '#10b981' : '#ef4444';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(answer.correct ? '✓' : '✗', 720, y + 40);
      });

      // Footer
      const footerY = 520 + (answers.length * 80);
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(50, footerY);
      ctx.lineTo(750, footerY);
      ctx.stroke();

      ctx.fillStyle = '#6b7280';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Quest Finder • ${new Date().toLocaleDateString()}`, 400, footerY + 30);

      // Download
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `quest-${hunt.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try the "Copy Text" option instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    const text = `
🎯 Quest Completed: ${hunt.title}
👤 Player: ${playerName}
⭐ Score: ${score} points
⏱️ Time: ${formatTime(completionTime)}
📍 Locations: ${answers.length}

My Answers:
${answers.map((a, i) => `${i + 1}. ${a.locationName}: "${a.answer}" ${a.correct ? '✓' : '✗'}`).join('\n')}

Play Quest Finder and start your own adventure! 🗺️
    `.trim();
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Results copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy to clipboard');
    });
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-2xl w-full">
        {/* Hidden canvas for image generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Name Input Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '2px solid #fb923c',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#ea580c',
              fontWeight: 'bold',
              fontSize: '1.125rem'
            }}>
              Enter Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name here..."
              maxLength={30}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '2px solid #fed7aa',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#fb923c'}
              onBlur={(e) => e.target.style.borderColor = '#fed7aa'}
            />
            <p style={{
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              This name will appear on your downloaded image and shared text
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-wrap gap-3 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadImage}
            disabled={isGenerating || !playerName.trim()}
            style={{
              background: 'linear-gradient(to right, #3b82f6, #6366f1)',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              cursor: (isGenerating || !playerName.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isGenerating || !playerName.trim()) ? 0.5 : 1,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Download className="w-5 h-5" />
            {isGenerating ? 'Generating...' : 'Download Image'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCopyText}
            disabled={!playerName.trim()}
            style={{
              background: 'linear-gradient(to right, #10b981, #059669)',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: 'none',
              cursor: !playerName.trim() ? 'not-allowed' : 'pointer',
              opacity: !playerName.trim() ? 0.5 : 1,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Share2 className="w-5 h-5" />
            Copy Text
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onContinue}
            style={{
              background: 'linear-gradient(to right, #f97316, #ef4444)',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
          >
            Continue to Leaderboard
          </motion.button>
        </motion.div>

        {/* Preview Card (Visual only) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              border: '4px solid #fb923c',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Header with gradient */}
            <div 
              style={{
                background: 'linear-gradient(to bottom right, #fb923c, #f87171, #f472b6)',
                padding: '2rem',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', inset: 0, opacity: 0.2 }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '16rem',
                  height: '16rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transform: 'translate(8rem, -8rem)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '12rem',
                  height: '12rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '50%',
                  transform: 'translate(-6rem, 6rem)'
                }}></div>
              </div>
              
              <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
                <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                    display: 'inline-flex'
                  }}>
                    <Trophy className="w-16 h-16" style={{ color: '#ffffff' }} />
                  </div>
                </div>
                
                <h1 style={{ color: '#ffffff', marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 'bold' }}>
                  Quest Completed!
                </h1>
                <h2 style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.5rem' }}>
                  {hunt.title}
                </h2>
              </div>
            </div>

            {/* Player Info */}
            <div style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(to right, #fed7aa, #fecaca)',
                  borderRadius: '9999px',
                  border: '2px solid #fdba74',
                  marginBottom: '1rem'
                }}>
                  <p style={{ color: '#9a3412', fontWeight: 'bold', margin: 0 }}>
                    {playerName || 'Enter your name above'}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)',
                  borderRadius: '1rem',
                  border: '2px solid #fde68a'
                }}>
                  <Trophy className="w-8 h-8" style={{ color: '#ca8a04', margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '1.5rem', color: '#ca8a04', margin: '0 0 0.25rem' }}>{score}</p>
                  <p style={{ fontSize: '0.875rem', color: '#a16207', margin: 0 }}>Points</p>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'linear-gradient(to bottom right, #dbeafe, #c7d2fe)',
                  borderRadius: '1rem',
                  border: '2px solid #93c5fd'
                }}>
                  <Clock className="w-8 h-8" style={{ color: '#2563eb', margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '1.5rem', color: '#2563eb', margin: '0 0 0.25rem' }}>{formatTime(completionTime)}</p>
                  <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>Time</p>
                </div>
                
                <div style={{
                  textAlign: 'center',
                  padding: '1rem',
                  background: 'linear-gradient(to bottom right, #d1fae5, #a7f3d0)',
                  borderRadius: '1rem',
                  border: '2px solid #6ee7b7'
                }}>
                  <Target className="w-8 h-8" style={{ color: '#059669', margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '1.5rem', color: '#059669', margin: '0 0 0.25rem' }}>{answers.length}</p>
                  <p style={{ fontSize: '0.875rem', color: '#047857', margin: 0 }}>Locations</p>
                </div>
              </div>

              {/* Answers List */}
              <div>
                <h3 style={{ color: '#ea580c', marginBottom: '1rem', fontSize: '1.25rem' }}>My Journey:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '16rem', overflowY: 'auto' }}>
                  {answers.map((answer, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: 'linear-gradient(to right, #fff7ed, transparent)',
                        borderRadius: '0.75rem',
                        border: '2px solid #fed7aa'
                      }}
                    >
                      <div style={{
                        flexShrink: 0,
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: '#fb923c',
                        color: '#ffffff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ color: '#1f2937', marginBottom: '0.25rem', fontSize: '1rem' }}>{answer.locationName}</h4>
                        <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
                          Answer: <span style={{ fontStyle: 'italic' }}>"{answer.answer}"</span>
                        </p>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {answer.correct ? (
                          <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                        ) : (
                          <div style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            borderRadius: '50%',
                            border: '2px solid #ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>✗</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                marginTop: '2rem',
                paddingTop: '1.5rem',
                borderTop: '2px solid #fed7aa',
                textAlign: 'center'
              }}>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                  Quest Finder • {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}