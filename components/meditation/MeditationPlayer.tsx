
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MeditationIcon, PlayIcon, PauseIcon } from '../../constants';
import useTimer from '../../hooks/useTimer';
import { showNotification } from '../../services/notificationService';

interface MeditationPlayerProps {
  onSessionComplete: () => void;
  defaultDurationSeconds?: number;
  spotifyPlaylistUrl: string;
}

const BreathingGuide: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const animationClass = isActive ? 'animate-pulse-size-slow' : '';

  return (
    <div className="flex flex-col items-center justify-center my-8">
      <style>
        {`
          @keyframes pulse-size-slow {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.15); opacity: 1; }
          }
          .animate-pulse-size-slow {
            animation: pulse-size-slow 8s infinite ease-in-out;
          }
        `}
      </style>
      <div className={`w-40 h-40 md:w-48 md:h-48 rounded-full bg-blue-500 dark:bg-blue-400 flex items-center justify-center shadow-2xl ${animationClass}`}>
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-blue-400 dark:bg-blue-300 flex items-center justify-center">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-blue-300 dark:bg-blue-200"></div>
        </div>
      </div>
      <p className={`mt-6 text-lg text-gray-600 dark:text-gray-300 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        {isActive ? 'Breathe in... and out...' : 'Prepare to meditate'}
      </p>
    </div>
  );
};


const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ 
  onSessionComplete, 
  defaultDurationSeconds = 15 * 60,
  spotifyPlaylistUrl 
}) => {
  const { timeLeft, isActive: timerActive, startTimer, pauseTimer, resetTimer } = useTimer(defaultDurationSeconds);
  const [sessionStarted, setSessionStarted] = useState(false);

  const timerDisplay = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;

  const handleStartSession = () => {
    startTimer(defaultDurationSeconds);
    setSessionStarted(true);
    console.log("Mock: Playing Spotify meditation playlist...");
  };

  const handlePauseSession = () => {
    pauseTimer();
    console.log("Mock: Pausing Spotify meditation playlist...");
  };
  
  const handleEndSession = () => {
    onSessionComplete();
    resetTimer();
    setSessionStarted(false);
    console.log("Mock: Pausing Spotify meditation playlist after session end.");
    showNotification("Meditation Complete", { 
      body: "Your mind is clearer. Well done!",
      tag: `meditation-complete-${Date.now()}`
    });
  };

  useEffect(() => {
    if (timerActive && timeLeft <= 0) {
      handleEndSession();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerActive]);

  return (
    <Card title="Meditation Session" titleIcon={<MeditationIcon className="text-purple-500" />}>
      <div className="text-center">
        <BreathingGuide isActive={timerActive} />
        
        <p className="text-4xl font-mono font-bold my-6 text-primary dark:text-accent">{timerDisplay}</p>

        {!sessionStarted ? (
          <Button size="lg" onClick={handleStartSession} leftIcon={<PlayIcon />} variant="primary">
            Start {defaultDurationSeconds/60}-Min Meditation
          </Button>
        ) : (
          <div className="flex justify-center space-x-4">
            {timerActive ? (
              <Button size="lg" onClick={handlePauseSession} leftIcon={<PauseIcon />} variant="accent">Pause</Button>
            ) : (
              <Button size="lg" onClick={() => startTimer(timeLeft)} leftIcon={<PlayIcon />} variant="primary">Resume</Button>
            )}
            <Button size="lg" onClick={handleEndSession} variant="secondary">End Session</Button>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold text-center mb-2">Spotify Integration (Mock)</h4>
          <p className="text-xs text-center text-gray-600 dark:text-gray-400 mb-2">
            This would auto-play/pause your configured "Meditation" playlist.
          </p>
          <div className="flex justify-center space-x-2">
            <Button size="sm" variant="secondary" onClick={() => window.open(spotifyPlaylistUrl, '_blank')}>Open Playlist</Button>
            <Button size="sm" variant="ghost" onClick={() => console.log("Mock: Toggle Play/Pause")}>Toggle Music</Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MeditationPlayer;
