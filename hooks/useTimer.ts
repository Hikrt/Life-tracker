
import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerState {
  timeLeft: number; // in seconds
  elapsedTime: number; // in seconds
  isActive: boolean;
  startTimer: (durationInSeconds: number) => void;
  pauseTimer: () => void;
  resetTimer: (newDuration?: number) => void;
}

const useTimer = (initialDurationInSeconds: number): TimerState => {
  const [duration, setDuration] = useState<number>(initialDurationInSeconds);
  const [timeLeft, setTimeLeft] = useState<number>(initialDurationInSeconds);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearExistingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      clearExistingInterval(); // Clear any previous interval before starting a new one
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearExistingInterval();
            setIsActive(false);
            setElapsedTime(prevElapsed => prevElapsed + 1); // Account for the last second
            return 0;
          }
          return prevTime - 1;
        });
        setElapsedTime(prevElapsed => prevElapsed + 1);
      }, 1000);
    } else {
      clearExistingInterval();
    }
    return () => clearExistingInterval(); // Cleanup on unmount or if isActive changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, clearExistingInterval]);

  const startTimer = useCallback((newDurationInSeconds?: number) => {
    const currentDuration = newDurationInSeconds ?? timeLeft; // Use new duration or resume from timeLeft
    if (newDurationInSeconds !== undefined) { // If new duration is explicitly set (e.g. starting fresh or restarting with specific time)
        setDuration(newDurationInSeconds);
        setTimeLeft(newDurationInSeconds);
        // setElapsedTime(0); // Reset elapsed time if starting a brand new timer duration
    } else if (timeLeft === 0 && duration > 0) { // If resuming a finished timer, restart with original duration
        setTimeLeft(duration);
        // setElapsedTime(0);
    }
    // If newDurationInSeconds is undefined and timeLeft > 0, it means resume, so don't reset timeLeft or elapsedTime
    
    setIsActive(true);
  }, [timeLeft, duration]);

  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetTimer = useCallback((newDuration?: number) => {
    clearExistingInterval();
    setIsActive(false);
    const resetDuration = newDuration ?? initialDurationInSeconds;
    setDuration(resetDuration);
    setTimeLeft(resetDuration);
    setElapsedTime(0);
  }, [initialDurationInSeconds, clearExistingInterval]);

  return { timeLeft, elapsedTime, isActive, startTimer, pauseTimer, resetTimer };
};

export default useTimer;