
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DetailedWorkoutPlan, DetailedExercise, DetailedExerciseType, WorkoutLog, KeyResult, ExerciseSetEntry, Theme, GymDayType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Tooltip } from '../ui/Tooltip';
import { ClockIcon, SparklesIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon, ListBulletIcon, ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from '../../constants';
import useTimer from '../../hooks/useTimer';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { GEMINI_TEXT_MODEL } from '../../constants';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { parseJsonFromGeminiResponse } from '../../services/geminiService';

interface ExerciseTrackerProps {
  workoutPlan: DetailedWorkoutPlan;
  onComplete: (logs: WorkoutLog[], linkedKRId?: string) => void;
  onBack: () => void;
  availableEquipment: string;
  aiInstance: GoogleGenAI | null;
  currentKRs: KeyResult[];
  theme: Theme;
}

const ExerciseTracker: React.FC<ExerciseTrackerProps> = ({ 
  workoutPlan, 
  onComplete, 
  onBack,
  availableEquipment,
  aiInstance,
  currentKRs,
  theme
}) => {
  const allExercisesInPlan = useMemo(() => workoutPlan.phases.flatMap(phase => phase.exercises), [workoutPlan]);
  
  const [currentSelectedExerciseId, setCurrentSelectedExerciseId] = useState<string | null>(allExercisesInPlan.length > 0 ? allExercisesInPlan[0].id : null);
  const [sets, setSets] = useState<ExerciseSetEntry[]>([{ reps: '', weight: '' }]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  
  const { timeLeft, isActive: timerActive, startTimer, resetTimer } = useTimer(90);
  const [isLoadingAlternative, setIsLoadingAlternative] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [selectedKRforSession, setSelectedKRforSession] = useState<string>(""); // For the whole session
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    workoutPlan.phases.forEach(phase => initialState[phase.name] = true); // Default all open
    return initialState;
  });

  const currentSelectedExercise = useMemo(() => {
    return allExercisesInPlan.find(ex => ex.id === currentSelectedExerciseId);
  }, [allExercisesInPlan, currentSelectedExerciseId]);

  useEffect(() => {
    // Reset component state when workoutPlan changes
    if (allExercisesInPlan.length > 0) {
      setCurrentSelectedExerciseId(allExercisesInPlan[0].id);
    } else {
      setCurrentSelectedExerciseId(null);
    }
    setSets([{ reps: '', weight: '' }]);
    setWorkoutLogs([]);
    setCompletedExerciseIds([]);
    setSelectedKRforSession("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutPlan]); 


  const handleSetChange = (index: number, field: keyof ExerciseSetEntry, value: string) => {
    const newSets = [...sets];
    newSets[index][field] = value;
    setSets(newSets);
  };

  const addSet = () => setSets([...sets, { reps: '', weight: '' }]);
  const removeSet = (index: number) => { if (sets.length > 1) setSets(sets.filter((_, i) => i !== index)); };

  const logAndMarkDone = (exercise: DetailedExercise, isWarmupOrCooldown: boolean = false) => {
    let newLogs: WorkoutLog[] = [];
    if (isWarmupOrCooldown) {
      newLogs.push({
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: 1, reps: 1, weight: 0, // Simplified logging for non-set/rep exercises
        date: new Date().toISOString().split('T')[0],
        muscleGroup: exercise.muscleGroup || 'N/A',
        dayType: workoutPlan.id,
        linkedKRId: selectedKRforSession || undefined,
        exerciseType: exercise.type,
        targetSetsReps: exercise.setsReps
      });
    } else {
      newLogs = sets
        .filter(s => parseInt(s.reps) > 0 || parseFloat(s.weight) >= 0) // Allow logging 0 weight
        .map(s => ({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          sets: 1, 
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
          date: new Date().toISOString().split('T')[0],
          muscleGroup: exercise.muscleGroup || 'Unknown',
          dayType: workoutPlan.id, 
          linkedKRId: selectedKRforSession || undefined,
          exerciseType: exercise.type,
          targetSetsReps: exercise.setsReps
        }));
    }
    
    setWorkoutLogs(prev => [...prev, ...newLogs]);
    if (!completedExerciseIds.includes(exercise.id)) {
      setCompletedExerciseIds(prev => [...prev, exercise.id]);
    }
    setSets([{ reps: '', weight: '' }]); // Reset sets for next selected exercise
    resetTimer();
    return newLogs;
  };

  const handleSelectExercise = (exerciseId: string) => {
    setCurrentSelectedExerciseId(exerciseId);
    setSets([{ reps: '', weight: '' }]); // Reset sets when selecting a new exercise
    setAiError(null); // Clear AI error from previous exercise
  };

  const handleLogAndNextUnfinished = () => {
    if (!currentSelectedExercise) return;
    const isWarmCool = currentSelectedExercise.type.startsWith("WARMUP_") || currentSelectedExercise.type.startsWith("COOLDOWN_");
    const loggedNow = logAndMarkDone(currentSelectedExercise, isWarmCool);
    
    // Find next unfinished exercise
    let nextIndex = -1;
    for (let i = 0; i < allExercisesInPlan.length; i++) {
        if (!completedExerciseIds.includes(allExercisesInPlan[i].id) || allExercisesInPlan[i].id === currentSelectedExercise.id /* If re-logging */) {
            // Find the one AFTER currentSelectedExercise that is not completed
            const currentActualIndex = allExercisesInPlan.findIndex(ex => ex.id === currentSelectedExercise.id);
            if (i > currentActualIndex && !completedExerciseIds.includes(allExercisesInPlan[i].id)) {
                 nextIndex = i;
                 break;
            }
        }
    }
     if (nextIndex !== -1) {
        handleSelectExercise(allExercisesInPlan[nextIndex].id);
    } else { // If no more unfinished AFTER current, try from start
        const firstUnfinished = allExercisesInPlan.find(ex => !completedExerciseIds.includes(ex.id));
        if (firstUnfinished) {
            handleSelectExercise(firstUnfinished.id);
        } else {
            // All done, or only current was left
            // No specific "next" - user might click "Complete Workout" or select another manually
        }
    }
  };
  
  const handleCompleteCurrentExercise = () => {
    if(!currentSelectedExercise) return;
    const isWarmCool = currentSelectedExercise.type.startsWith("WARMUP_") || currentSelectedExercise.type.startsWith("COOLDOWN_");
    logAndMarkDone(currentSelectedExercise, isWarmCool);
  }


  const handleCompleteWorkout = () => {
    // Ensure the currently active exercise (if any sets entered) is logged before finishing
    if (currentSelectedExercise && sets.some(s => s.reps || s.weight)) {
      const isWarmCool = currentSelectedExercise.type.startsWith("WARMUP_") || currentSelectedExercise.type.startsWith("COOLDOWN_");
      const finalLogs = logAndMarkDone(currentSelectedExercise, isWarmCool);
      onComplete([...workoutLogs, ...finalLogs], selectedKRforSession || undefined);
    } else if (currentSelectedExercise && !completedExerciseIds.includes(currentSelectedExercise.id)) {
      // If current exercise has no sets entered but is not marked done (e.g. a warmup never marked)
      const isWarmCool = currentSelectedExercise.type.startsWith("WARMUP_") || currentSelectedExercise.type.startsWith("COOLDOWN_");
      const finalLogs = logAndMarkDone(currentSelectedExercise, isWarmCool);
       onComplete([...workoutLogs, ...finalLogs], selectedKRforSession || undefined);
    }
    else {
      onComplete(workoutLogs, selectedKRforSession || undefined);
    }
  };

  const getAiAlternativeExercise = async () => {
    if (!aiInstance || !currentSelectedExercise) {
      setAiError("AI service not available or no current exercise selected.");
      return;
    }
    if (currentSelectedExercise.type.startsWith("WARMUP_") || currentSelectedExercise.type.startsWith("COOLDOWN_")){
        setAiError("AI Alternatives not applicable for warm-up/cool-down activities.");
        return;
    }

    setIsLoadingAlternative(true);
    setAiError(null);
    const existingExerciseNames = allExercisesInPlan.map(ex => ex.name).join(', ');

    const prompt = `The user cannot perform or wants an alternative for the exercise: "${currentSelectedExercise.name}" (Type: ${currentSelectedExercise.type}, Segment: ${currentSelectedExercise.segment}).
This exercise is part of a "${workoutPlan.name}".
The user has the following equipment: "${availableEquipment}".
Suggest ONE distinct alternative exercise suitable for this workout type, segment, and equipment. The alternative should be different from these exercises already in the plan: ${existingExerciseNames}.
Provide its name, very brief cues (1-2 short sentences), its type (e.g., MainCompound, MainIsolation), and primary muscle group (e.g., Chest, Back, Legs, Shoulders).
Return the response as a SINGLE JSON object with keys: "id" (unique string like "ai_alt_uuid"), "name", "cues", "type" (from DetailedExerciseType enum values), "segment", "muscleGroup", "equipment" (what it uses from available).
Example: {"id": "ai_alt_db_row", "name": "Dumbbell Row", "cues": "Support body. Pull to hip.", "type": "MainCompound", "segment": "Back Thickness", "muscleGroup": "Back", "equipment": "Dumbbell + bench"}
Ensure the response is ONLY the single JSON object.`;

    try {
      const response: GenerateContentResponse = await aiInstance.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: [{text: prompt}],
        config: { responseMimeType: "application/json" }
      });
      const parsedAlternative = parseJsonFromGeminiResponse(response.text);

      if (parsedAlternative && parsedAlternative.name && parsedAlternative.cues) {
        const newExercise: DetailedExercise = {
          id: parsedAlternative.id || `ai_alt_${Date.now()}`,
          name: parsedAlternative.name,
          type: parsedAlternative.type || DetailedExerciseType.MAIN_ISOLATION, // Default if not provided
          segment: parsedAlternative.segment || currentSelectedExercise.segment,
          setsReps: currentSelectedExercise.setsReps, // Keep original setsReps or adjust if AI suggests
          equipment: parsedAlternative.equipment || currentSelectedExercise.equipment,
          whyAndCitation: "AI Suggested Alternative",
          imageUrl: `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(parsedAlternative.name)}`, // Placeholder for AI suggestions
          muscleGroup: parsedAlternative.muscleGroup || currentSelectedExercise.muscleGroup,
        };
        // Replace current exercise in the plan display (this change is local to tracker state)
        // This is tricky; for now, we'll just update the currentSelectedExercise object.
        // A more robust solution would update the allExercisesInPlan state if we want this to persist in the list visually.
        // For now, let's just make currentSelectedExercise this new one.
        const newAllExercises = allExercisesInPlan.map(ex => ex.id === currentSelectedExerciseId ? newExercise : ex);
        // This won't work as allExercisesInPlan is memoized.
        // Instead, we'll have to manage a local version of current selected if it's AI replaced.
        // Or, simpler for now: just change the *displayed* details, and if logged, log with new name/ID.
        // This is the most complex part. For now, let's assume we replace it in a local state for rendering
        // and handle logging correctly. The `allExercisesInPlan` is a prop from `GymHome`.
        // A better approach might be to have `currentDisplayedExercise` state.
        // For this iteration, let's make it simple: AI suggestions are for immediate use and don't alter the plan list.
        // So, we'll show its details, and if logged, log it.
        // This is a philosophical choice: does AI alt change the plan, or just the current action? Assuming current action.
        
        // Create a temporary state for the AI alternative if we don't want to modify allExercisesInPlan
        // For simplicity, let's just update the display and if logged, that's what gets logged.
        // A truly dynamic list replacement is much more involved.
        // This means the list on the left won't update to show the AI alt name, but the main panel will.
        const tempUpdatedExercises = allExercisesInPlan.map(ex => {
          if (ex.id === currentSelectedExerciseId) {
            return newExercise; // Replace in the "master list" being used by the component instance
          }
          return ex;
        });
        // This change to `allExercisesInPlan` won't persist up to `GymHome` but will affect current render.
        // This is not ideal. A better way: maintain `currentExerciseForDisplay`
        // For now: I will update the state that `currentSelectedExercise` derives from.
        // This means I need `allExercisesInPlan` to be state here.
        // setCurrentExercisesState(tempUpdatedExercises); // Needs new state
        // For now, let's keep it simple: the details panel shows the AI alt, and logging uses those details. The list itself won't change.
        // This is a compromise.
        // The currentSelectedExercise is derived, so I cannot set it.
        // The most straightforward way is to introduce a new state variable:
        // `displayedExerciseDetails` which is currentSelectedExercise OR the AI suggestion.
        // Let's modify the current exercise in the list for THIS SESSION only.
        const updatedPlanExercises = allExercisesInPlan.map(ex => ex.id === currentSelectedExercise?.id ? newExercise : ex);
        // This is still tricky with memoization.
        // Simplest: store the AI exercise and use it for rendering if it exists.
        // This needs a `setCurrentlyDisplayedExercise` or similar.
        // For now, will log the AI exercise and user must manually select next from original list.
        // This means AI Alt is a one-off for the current interaction.
         alert(`AI Suggestion: ${newExercise.name}. Log this and then select your next exercise from the list.`);
         // To make this work visually, currentSelectedExercise needs to be stateful or the source list needs to be stateful.
         // Given the structure, will use a temporary display state
         setTemporaryAiExercise(newExercise);


      } else {
        setAiError("AI suggested an alternative in an unexpected format.");
        console.error("Failed to parse AI alternative:", response.text);
      }
    } catch (e: any) {
      console.error("Error fetching AI alternative exercise:", e);
      setAiError(`Error fetching AI alternative: ${e.message}`);
    } finally {
      setIsLoadingAlternative(false);
    }
  };
  const [temporaryAiExercise, setTemporaryAiExercise] = useState<DetailedExercise | null>(null);
  const exerciseToDisplay = temporaryAiExercise || currentSelectedExercise;


  if (!workoutPlan || allExercisesInPlan.length === 0) {
    return <Card title="Error"><p className="high-contrast:text-hc-text">No workout plan loaded.</p><Button onClick={onBack}>Back</Button></Card>;
  }
  
  const isExerciseLoggable = currentSelectedExercise && 
    (currentSelectedExercise.type === DetailedExerciseType.MAIN_COMPOUND || 
     currentSelectedExercise.type === DetailedExerciseType.MAIN_ISOLATION ||
     currentSelectedExercise.type === DetailedExerciseType.FINISHER);

  const isWarmupOrCooldownType = (type: DetailedExerciseType) => 
    type.startsWith("WARMUP_") || type.startsWith("COOLDOWN_");

  const togglePhaseOpen = (phaseName: string) => {
    setOpenPhases(prev => ({...prev, [phaseName]: !prev[phaseName]}));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Exercise List Panel */}
      <div className="md:w-1/3 lg:w-1/4 space-y-2 max-h-[80vh] overflow-y-auto pr-2 bg-light-card dark:bg-dark-card p-3 rounded-lg shadow-md high-contrast:bg-hc-card high-contrast:border high-contrast:border-hc-border">
        <h3 className="text-lg font-semibold mb-2 sticky top-0 bg-light-card dark:bg-dark-card py-2 z-10 high-contrast:text-hc-text high-contrast:bg-hc-card">{workoutPlan.name} - Exercises</h3>
        {workoutPlan.phases.map(phase => (
          <div key={phase.name} className="mb-3">
            <button onClick={() => togglePhaseOpen(phase.name)} className="w-full text-left flex justify-between items-center py-1 px-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 high-contrast:hover:bg-hc-secondary high-contrast:hover:text-black">
              <h4 className="font-medium text-primary dark:text-blue-400 high-contrast:text-hc-primary">{phase.name}</h4>
              {openPhases[phase.name] ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
            {openPhases[phase.name] && phase.exercises.map(ex => {
              const isSelected = ex.id === currentSelectedExerciseId;
              const isCompleted = completedExerciseIds.includes(ex.id);
              let statusClasses = "border-gray-300 dark:border-gray-600 high-contrast:border-hc-border";
              if (isSelected) statusClasses = "border-primary dark:border-accent ring-2 ring-primary dark:ring-accent high-contrast:border-hc-primary high-contrast:ring-hc-primary";
              if (isCompleted) statusClasses = "border-green-500 dark:border-green-600 opacity-70 high-contrast:border-hc-secondary";

              return (
                <div 
                  key={ex.id} 
                  onClick={() => handleSelectExercise(ex.id)}
                  className={`p-2 my-1 border-l-4 rounded-r-md cursor-pointer transition-all hover:shadow-lg ${statusClasses} bg-light-bg dark:bg-gray-800 high-contrast:bg-hc-bg`}
                >
                  <p className={`text-sm font-medium ${isSelected ? 'text-primary dark:text-accent high-contrast:text-hc-primary' : 'text-light-text dark:text-dark-text high-contrast:text-hc-text'}`}>
                    {ex.name}
                    {isCompleted && <CheckCircleIcon className="w-4 h-4 inline-block ml-2 text-green-500 dark:text-green-400 high-contrast:text-hc-secondary" />}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 high-contrast:text-gray-300">{ex.setsReps} {ex.segment ? `(${ex.segment})` : ''}</p>
                </div>
              );
            })}
          </div>
        ))}
         {currentKRs && currentKRs.filter(kr => kr.unit.toLowerCase().includes('session') || kr.unit.toLowerCase().includes('set') || kr.unit.toLowerCase().includes('exercise')).length > 0 && (
            <div className="mt-4 sticky bottom-0 bg-light-card dark:bg-dark-card py-2 z-10 border-t dark:border-gray-700 high-contrast:border-hc-border high-contrast:bg-hc-card">
              <label htmlFor="sessionKRSelect" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 high-contrast:text-hc-text">
                Link Entire Session to KR:
              </label>
              <select
                id="sessionKRSelect"
                value={selectedKRforSession}
                onChange={(e) => setSelectedKRforSession(e.target.value)}
                className="w-full p-1.5 text-xs border rounded dark:bg-gray-700 dark:border-gray-600 high-contrast:bg-hc-bg high-contrast:text-hc-text high-contrast:border-hc-border"
              >
                <option value="">None</option>
                {currentKRs.filter(kr => kr.unit.toLowerCase().includes('session') || kr.unit.toLowerCase().includes('set') || kr.unit.toLowerCase().includes('exercise')).map(kr => (
                  <option key={kr.id} value={kr.id}>
                    {kr.description.substring(0,30)}{kr.description.length > 30 ? '...' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
      </div>

      {/* Main Exercise Panel */}
      <div className="md:w-2/3 lg:w-3/4">
        {exerciseToDisplay ? (
          <Card 
            title={exerciseToDisplay.name}
            titleIcon={isFocusMode ? undefined : <ListBulletIcon />}
            actions={
              <div className="flex items-center space-x-2">
                <Tooltip text={isFocusMode ? "Disable Focus Mode" : "Enable Focus Mode"}>
                    <Button variant="ghost" size="sm" onClick={() => setIsFocusMode(!isFocusMode)} className="p-1.5 high-contrast:text-hc-primary high-contrast:border-hc-primary">
                    {isFocusMode ? <EyeSlashIcon className="w-4 h-4"/> : <EyeIcon className="w-4 h-4"/>}
                    </Button>
                </Tooltip>
                <Button variant="ghost" size="sm" onClick={onBack} className="high-contrast:text-hc-secondary high-contrast:border-hc-secondary">End Workout Early</Button>
              </div>
            }
          >
            <div className="space-y-4">
              {!isFocusMode && (
                <>
                  {exerciseToDisplay.imageUrl && (
                    <img 
                        src={exerciseToDisplay.imageUrl} 
                        alt={`${exerciseToDisplay.name} demonstration`} 
                        className="rounded-lg mb-2 w-full max-w-sm mx-auto shadow-md border dark:border-gray-700 high-contrast:border-hc-border" 
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200.png?text=${encodeURIComponent(exerciseToDisplay.name)}`; }}
                    />
                  )}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-border">
                    <p><strong className="high-contrast:text-hc-text">Target:</strong> <span className="text-primary dark:text-accent high-contrast:text-hc-accent">{exerciseToDisplay.setsReps}</span></p>
                    {exerciseToDisplay.equipment && <p><strong className="high-contrast:text-hc-text">Equipment:</strong> {exerciseToDisplay.equipment}</p>}
                    {exerciseToDisplay.segment && <p><strong className="high-contrast:text-hc-text">Segment:</strong> {exerciseToDisplay.segment}</p>}
                    {exerciseToDisplay.whyAndCitation && <p className="mt-1 italic text-xs high-contrast:text-gray-300"><strong>Why:</strong> {exerciseToDisplay.whyAndCitation}</p>}
                    {exerciseToDisplay.citationLink && <a href={exerciseToDisplay.citationLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-400 high-contrast:text-hc-primary high-contrast:hover:text-yellow-400 inline-flex items-center">Source <ExternalLinkIcon className="w-3 h-3 ml-1"/></a>}
                    {exerciseToDisplay.notes && <p className="mt-1 text-xs high-contrast:text-gray-300"><strong>Notes:</strong> {exerciseToDisplay.notes}</p>}
                  </div>
                  {aiError && <p className="text-red-500 text-xs bg-red-100 dark:bg-red-900 p-1 rounded-md my-1 high-contrast:text-red-300 high-contrast:bg-red-800">{aiError}</p>}
                  {aiInstance && !isFocusMode && !isWarmupOrCooldownType(exerciseToDisplay.type) && (
                    <Button 
                        onClick={getAiAlternativeExercise} 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs mt-1"
                        isLoading={isLoadingAlternative}
                        disabled={isLoadingAlternative}
                        leftIcon={isLoadingAlternative ? null : <SparklesIcon className="w-3 h-3"/>}
                    >
                        {isLoadingAlternative ? 'Getting Alternative...' : 'Get AI Alternative'}
                    </Button>
                  )}
                </>
              )}

              { isExerciseLoggable && !completedExerciseIds.includes(exerciseToDisplay.id) ? (
                <div className="space-y-3 mt-3">
                  {sets.map((set, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-light-bg dark:bg-gray-700 p-2 rounded high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-border">
                      <span className="font-medium text-gray-700 dark:text-gray-300 high-contrast:text-hc-text">Set {index + 1}:</span>
                      <Input type="number" placeholder="Reps" value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} className="w-20 appearance-none" />
                      <Input type="number" placeholder="Weight" value={set.weight} onChange={(e) => handleSetChange(index, 'weight', e.target.value)} className="w-20" />
                      <span className="text-gray-500 dark:text-gray-400 high-contrast:text-hc-text">kg</span>
                      {sets.length > 1 && (
                        <Button size="sm" variant="danger" onClick={() => removeSet(index)} className="p-1 text-xs">X</Button>
                      )}
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" onClick={addSet}>Add Set</Button>
                </div>
              ) : completedExerciseIds.includes(exerciseToDisplay.id) ? (
                 <p className="text-center text-green-600 dark:text-green-400 font-semibold p-3 bg-green-50 dark:bg-green-900/30 rounded-md high-contrast:text-hc-secondary high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-secondary">
                    <CheckCircleIcon className="w-5 h-5 inline mr-2"/> Exercise Completed!
                 </p>
              ) : null }

              {isWarmupOrCooldownType(exerciseToDisplay.type) && !completedExerciseIds.includes(exerciseToDisplay.id) && (
                <Button onClick={() => handleCompleteCurrentExercise()} variant="secondary" className="w-full mt-3">Mark as Done</Button>
              )}

              {!isFocusMode && isExerciseLoggable && (
                <div className="border-t pt-4 mt-4 dark:border-gray-600 high-contrast:border-hc-border">
                  <h4 className="text-md font-semibold mb-2 high-contrast:text-hc-text">Rest Timer</h4>
                  <div className="flex items-center space-x-3">
                    <Button onClick={() => startTimer(90)} disabled={timerActive} leftIcon={<ClockIcon className="w-4 h-4"/>}>Start 90s</Button>
                    <Button onClick={() => startTimer(60)} disabled={timerActive} leftIcon={<ClockIcon className="w-4 h-4"/>}>Start 60s</Button>
                    <Button variant="ghost" onClick={() => resetTimer()} disabled={!timerActive}>Reset</Button>
                    {timerActive && <p className="text-2xl font-bold text-accent high-contrast:text-hc-accent">{timeLeft}s</p>}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-2 sm:space-y-0 sm:space-x-2">
                {(!isWarmupOrCooldownType(exerciseToDisplay.type) || (isWarmupOrCooldownType(exerciseToDisplay.type) && !completedExerciseIds.includes(exerciseToDisplay.id))) && (
                    <Button onClick={handleLogAndNextUnfinished} variant="primary" disabled={isLoadingAlternative || (isExerciseLoggable && sets.every(s => !s.reps && !s.weight) && !completedExerciseIds.includes(exerciseToDisplay.id) )}>
                        {isExerciseLoggable && !completedExerciseIds.includes(exerciseToDisplay.id) ? 'Log Sets & Select Next Unfinished' : 'Select Next Unfinished'}
                    </Button>
                )}
                <Button onClick={handleCompleteWorkout} variant="accent">Complete Entire Workout</Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card title="Select an Exercise">
            <p className="text-center text-gray-500 dark:text-gray-400 high-contrast:text-hc-text">Choose an exercise from the list on the left to begin.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExerciseTracker;
