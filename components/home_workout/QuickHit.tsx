
import React, { useState, useEffect } from 'react';
import { Exercise, KeyResult } from '../../types'; // Added KeyResult
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FireIcon } from '../../constants'; // Removed ClockIcon as it's not used here
import useTimer from '../../hooks/useTimer';

interface QuickHitProps {
  exercises: Exercise[]; 
  targetReps: number;
  onComplete: (linkedKRId?: string) => void; // Modified to accept linkedKRId
  streak: number;
  currentKRs: KeyResult[];
}

const QuickHit: React.FC<QuickHitProps> = ({ exercises, targetReps, onComplete, streak, currentKRs }) => {
  const circuitDuration = 5 * 60; 
  const { timeLeft, isActive: timerActive, startTimer, resetTimer } = useTimer(circuitDuration); // Removed elapsedTime
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedKR, setSelectedKR] = useState<string>("");

  const timerDisplay = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`;

  const handleStart = () => {
    startTimer(circuitDuration);
    setIsCompleted(false);
    setSelectedKR(""); // Reset KR on new start
  };

  const handleCompleteEarly = () => {
    if (!isCompleted) {
      onComplete(selectedKR || undefined);
      setIsCompleted(true);
    }
    resetTimer();
  };

  useEffect(() => {
    if (timerActive && timeLeft <= 0 && !isCompleted) {
      onComplete(selectedKR || undefined); 
      setIsCompleted(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, timerActive, isCompleted, onComplete, selectedKR]);

  const relevantKRs = currentKRs.filter(kr => 
    kr.unit.toLowerCase().includes('session') || 
    kr.unit.toLowerCase().includes('streak') ||
    kr.unit.toLowerCase().includes('hit')
  );

  return (
    <Card title="4 AM Quick-Hit Circuit" titleIcon={<FireIcon className="text-red-500" />}>
      <div className="text-center">
        {!timerActive && !isCompleted && (
          <>
            <p className="mb-4 text-lg">Get ready for your morning boost!</p>
            <Button size="lg" onClick={handleStart} variant="accent">Start Circuit ({circuitDuration/60} min)</Button>
          </>
        )}

        {timerActive && !isCompleted && (
          <>
            <p className="text-5xl font-mono font-bold text-accent mb-6">{timerDisplay}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {exercises.map(ex => (
                <div key={ex.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-semibold text-lg">{ex.name}</h4>
                  <p className="text-2xl text-primary dark:text-blue-400">{targetReps} reps</p>
                  {ex.cues && <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">{ex.cues}</p>}
                </div>
              ))}
            </div>
            {relevantKRs.length > 0 && (
                 <div className="my-4 max-w-sm mx-auto">
                    <label htmlFor="quickHitKRSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 high-contrast:text-hc-text">
                        Link to Key Result (Optional):
                    </label>
                    <select
                        id="quickHitKRSelect"
                        value={selectedKR}
                        onChange={(e) => setSelectedKR(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border"
                    >
                        <option value="">None</option>
                        {relevantKRs.map(kr => (
                        <option key={kr.id} value={kr.id}>
                            {kr.description} (Target: {kr.targetValue} {kr.unit})
                        </option>
                        ))}
                    </select>
                </div>
            )}
            <Button onClick={handleCompleteEarly} variant="secondary">I'm Done!</Button>
          </>
        )}
        
        {isCompleted && (
            <div className="my-6">
                <p className="text-2xl text-green-500 font-semibold">Circuit Complete! Great job!</p>
                <p className="text-lg mt-2">Your streak is now: <span className="font-bold text-accent">{streak}</span> days!</p>
                <Button onClick={handleStart} variant="primary" className="mt-4">Do Another Round?</Button>
            </div>
        )}

        <div className="mt-8 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
          <div className="flex items-center justify-center">
            <FireIcon className="w-6 h-6 text-red-500 mr-2" />
            <p className="text-xl font-semibold">Current Streak: <span className="text-accent">{streak}</span> days</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default QuickHit;
