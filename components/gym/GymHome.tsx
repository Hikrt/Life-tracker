
import React, { useState, useEffect, useCallback } from 'react';
import { GymDayType, WorkoutLog, CardioLog, KeyResult, Theme, DetailedWorkoutPlan } from '../../types'; 
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import ExerciseTracker from './ExerciseTracker';
import { DumbbellIcon, FireIcon } from '../../constants'; // Removed SparklesIcon
import { WORKOUT_PLANS_DB, GEMINI_TEXT_MODEL, GYM_DAY_ROTATION } from '../../constants'; // Use WORKOUT_PLANS_DB
import GymAnalytics from './GymAnalytics';
import { GoogleGenAI } from '@google/genai';
// import { LoadingSpinner } from '../ui/LoadingSpinner'; // Not used for AI plan generation now
// import { parseJsonFromGeminiResponse } from '../../services/geminiService'; // Not used for AI plan generation now

interface GymHomeProps {
  currentGymDayType: GymDayType; // This will determine which default plan is highlighted
  onSessionComplete: (isWeightTraining: boolean, dayType: GymDayType, linkedKRId?: string) => void;
  addWorkoutLog: (log: WorkoutLog) => void;
  addCardioLog: (log: CardioLog) => void;
  availableEquipment: string; // Still useful for AI alternative within ExerciseTracker
  workoutLogs: WorkoutLog[];
  cardioLogs: CardioLog[];
  currentKRs: KeyResult[];
  theme: Theme; 
}

const API_KEY = process.env.API_KEY;

const GymHome: React.FC<GymHomeProps> = ({ 
  currentGymDayType, 
  onSessionComplete, 
  addWorkoutLog, 
  addCardioLog, 
  availableEquipment,
  workoutLogs,
  cardioLogs,
  currentKRs,
  theme 
}) => {
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState<DetailedWorkoutPlan | null>(null);
  const [activeSessionType, setActiveSessionType] = useState<'detailed_plan' | 'cardio' | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null); // For AI alternative errors
  const [ai, setAi] = useState<GoogleGenAI | null>(null);

  // This determines which of the P/P/L plans to cycle through for the "current day" suggestion.
  // We need to ensure that the currentGymDayIndex maps correctly to Push, Pull, Legs in WORKOUT_PLANS_DB
  const currentSuggestedPlan = WORKOUT_PLANS_DB.find(p => p.id === currentGymDayType) || WORKOUT_PLANS_DB[0];


  useEffect(() => {
    if (API_KEY && API_KEY !== "YOUR_API_KEY") {
      try {
        setAi(new GoogleGenAI({ apiKey: API_KEY }));
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI in GymHome:", e);
        setAiError("Failed to initialize AI Service for Gym (alternatives). Ensure API Key is valid.");
      }
    } else {
      setAiError("Gemini API Key not configured for Gym. AI exercise alternatives disabled.");
      console.warn("Gemini API Key not configured for GymHome.");
    }
  }, []);


  const handleStartDetailedWorkout = (planId: GymDayType) => {
    const plan = WORKOUT_PLANS_DB.find(p => p.id === planId);
    if (plan) {
      setActiveWorkoutPlan(plan);
      setActiveSessionType('detailed_plan');
    } else {
      console.error(`Workout plan for ${planId} not found!`);
      // Optionally set an error state to show in UI
    }
  };

  const handleStartCardio = () => {
    setActiveSessionType('cardio');
    setActiveWorkoutPlan(null); // Ensure no detailed plan is active
  };

  const handleSessionEnd = (isWeightTraining: boolean, dayTypeUsed: GymDayType, linkedKRId?: string) => {
    onSessionComplete(isWeightTraining, dayTypeUsed, linkedKRId); // dayTypeUsed might be from activeWorkoutPlan.id
    setActiveSessionType(null);
    setActiveWorkoutPlan(null);
  };
  

  if (showAnalytics) {
    return <GymAnalytics onBack={() => setShowAnalytics(false)} workoutLogs={workoutLogs} cardioLogs={cardioLogs} theme={theme} />;
  }

  if (activeSessionType === 'detailed_plan' && activeWorkoutPlan) {
    return <ExerciseTracker 
            workoutPlan={activeWorkoutPlan}
            onComplete={(logs, linkedKRId) => { 
              logs.forEach(log => addWorkoutLog({...log, linkedKRId})); 
              handleSessionEnd(true, activeWorkoutPlan.id, linkedKRId); // True for weight training
            }} 
            onBack={() => { setActiveSessionType(null); setActiveWorkoutPlan(null); }}
            availableEquipment={availableEquipment}
            aiInstance={ai}
            currentKRs={currentKRs}
            theme={theme}
          />;
  }

  if (activeSessionType === 'cardio') {
    const [duration, setDuration] = useState("30");
    const [calories, setCalories] = useState("");
    const [distance, setDistance] = useState("");
    const [cardioTypeInput, setCardioTypeInput] = useState("Running"); // Renamed from cardioType to avoid conflict
    const [selectedKR, setSelectedKR] = useState<string>("");

    return (
      <Card title="Cardio Session" titleIcon={<FireIcon className="text-red-500 high-contrast:text-hc-accent" />}>
        <div className="space-y-4 p-4">
          <select value={cardioTypeInput} onChange={(e)=>setCardioTypeInput(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border">
            <option>Running</option> <option>Cycling</option> <option>Elliptical</option>
            <option>Stairmaster</option> <option>Rowing</option> <option>Other</option>
          </select>
          <input type="number" value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="Duration (minutes)" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border" />
          <input type="number" value={calories} onChange={(e)=>setCalories(e.target.value)} placeholder="Calories Burned (optional)" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border" />
          <input type="number" value={distance} onChange={(e)=>setDistance(e.target.value)} placeholder="Distance (km, optional)" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border" />
          
          {currentKRs && currentKRs.filter(kr => kr.unit.toLowerCase().includes('session') || kr.unit.toLowerCase().includes('min') || kr.unit.toLowerCase().includes('km') || kr.unit.toLowerCase().includes('cal')).length > 0 && (
            <div>
              <label htmlFor="cardioKRSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 high-contrast:text-hc-text">
                Link to Key Result (Optional):
              </label>
              <select
                id="cardioKRSelect"
                value={selectedKR}
                onChange={(e) => setSelectedKR(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border"
              >
                <option value="">None</option>
                {currentKRs.filter(kr => kr.unit.toLowerCase().includes('session') || kr.unit.toLowerCase().includes('min') || kr.unit.toLowerCase().includes('km') || kr.unit.toLowerCase().includes('cal')).map(kr => (
                  <option key={kr.id} value={kr.id}>
                    {kr.description} (Target: {kr.targetValue} {kr.unit})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button onClick={() => {
            const dur = parseInt(duration, 10);
            if (dur > 0) {
              addCardioLog({ 
                type: cardioTypeInput,
                durationMinutes: dur, 
                caloriesBurned: calories ? parseInt(calories, 10) : undefined,
                distanceKm: distance ? parseFloat(distance) : undefined,
                date: new Date().toISOString().split('T')[0],
                linkedKRId: selectedKR || undefined
              });
              handleSessionEnd(false, GymDayType.CARDIO, selectedKR || undefined); // False for weight training
            } else {
              alert("Please enter a valid duration.");
            }
          }}>
            Log Cardio & Finish
          </Button>
          <Button variant="ghost" onClick={() => setActiveSessionType(null)}>Back</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="Gym Dashboard" titleIcon={<DumbbellIcon className="high-contrast:text-hc-secondary" />}>
        <p className="text-center text-lg mb-2 high-contrast:text-hc-text">
          Today's Suggested Focus: <span className="font-bold text-primary dark:text-accent high-contrast:text-hc-accent">{currentSuggestedPlan.name}</span>
        </p>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-4 high-contrast:text-gray-300">
          Equipment for AI alternatives: {availableEquipment.substring(0,50)}{availableEquipment.length > 50 ? '...' : ''}
        </p>
        
        {aiError && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900 p-2 rounded-md my-2 high-contrast:bg-red-700 high-contrast:text-white">{aiError}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Button 
            size="lg" 
            className="py-8 text-xl"
            onClick={() => handleStartDetailedWorkout(GymDayType.PUSH)}
            variant={currentSuggestedPlan.id === GymDayType.PUSH ? "primary" : "ghost"}
          >
            Start Push Day
          </Button>
          <Button 
            size="lg" 
            className="py-8 text-xl"
            onClick={() => handleStartDetailedWorkout(GymDayType.PULL)}
            variant={currentSuggestedPlan.id === GymDayType.PULL ? "primary" : "ghost"}
          >
            Start Pull Day
          </Button>
          <Button 
            size="lg" 
            className="py-8 text-xl"
            onClick={() => handleStartDetailedWorkout(GymDayType.LEGS)}
            variant={currentSuggestedPlan.id === GymDayType.LEGS ? "primary" : "ghost"}
          >
            Start Leg Day
          </Button>
        </div>
        <div className="text-center mb-6">
            <Button 
                size="lg" 
                className="py-6 text-lg w-full md:w-auto"
                onClick={handleStartCardio}
                variant="secondary" // Changed variant
                leftIcon={<FireIcon className="w-8 h-8" />}
            >
                Cardio Session
            </Button>
        </div>
         <div className="mt-6 text-center">
            <Button variant="ghost" onClick={() => setShowAnalytics(true)}>View Workout Analytics</Button>
        </div>
      </Card>
    </div>
  );
};

export default GymHome;
