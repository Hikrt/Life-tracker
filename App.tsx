
import React, { useState, useEffect, useCallback } from 'react';
import { Theme, ActiveSection, SetActiveSection, ScheduleActivity, WorkoutLog, CardioLog, CFAQuestion, GymDayType, MealAnalysis, Objective, KeyResult, StudySessionLog, DetailedWorkoutPlan } from './types';
import { APP_NAME, DAILY_SCHEDULE, CFA_TARGET_HOURS, CFA_DEADLINE_DATE, GYM_DAY_ROTATION, QUICK_HIT_EXERCISES, QUICK_HIT_TARGET_REPS, MOCK_CFA_QUESTIONS, CFA_TOPICS, DEFAULT_SPOTIFY_PLAYLIST_URL, WORKOUT_PLANS_DB } from './constants';
import Header from './components/core/Header';
import Dashboard from './components/core/Dashboard';
import GymHome from './components/gym/GymHome';
import StudySessionManager from './components/study/StudySessionManager';
import MeditationPlayer from './components/meditation/MeditationPlayer';
import VoiceAssistant from './components/voice_qa/VoiceAssistant';
import QuickHit from './components/home_workout/QuickHit';
import GlobalAnalyticsDashboard from './components/analytics/GlobalAnalyticsDashboard';
import SettingsPage from './components/settings/SettingsPage';
import NutritionTracker from './components/nutrition/NutritionTracker';
import VisionBoard from './components/vision/VisionBoard';
import VisualDashboard from './components/visuals/VisualDashboard';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { requestNotificationPermission, getNotificationPermission, NotificationPermission } from './services/notificationService';

// Attempt to read API_KEY from process.env.
// Note: For client-side JS without a build process that handles .env files (e.g. Vite, Webpack),
// process.env.API_KEY might not be directly available.
// The .env.example file guides the user. For pure local HTML, they might need to hardcode it here temporarily.
const API_KEY_FROM_ENV = process.env.API_KEY;
if (!API_KEY_FROM_ENV || API_KEY_FROM_ENV === "YOUR_API_KEY") {
  console.warn("Life Architect: Gemini API Key not found or is placeholder in process.env. AI features may be limited. Refer to .env.example for setup.");
}


const getCurrentQuarter = (): string => {
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month < 3) return `Q1 ${year}`;
  if (month < 6) return `Q2 ${year}`;
  if (month < 9) return `Q3 ${year}`;
  return `Q4 ${year}`;
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeSection, setActiveSectionState] = useState<ActiveSection>('dashboard');
  const [points, setPoints] = useState<number>(0);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [totalStudyHours, setTotalStudyHours] = useState<number>(0);
  const [studySessionLogs, setStudySessionLogs] = useState<StudySessionLog[]>([]); // For charting
  const [currentGymDayIndex, setCurrentGymDayIndex] = useState<number>(0); // Index for GYM_DAY_ROTATION
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [cardioLogs, setCardioLogs] = useState<CardioLog[]>([]);
  const [quickHitStreak, setQuickHitStreak] = useState<number>(0);
  const [lastQuickHitDate, setLastQuickHitDate] = useState<string | null>(null);
  const [spotifyPlaylistUrl, setSpotifyPlaylistUrl] = useState<string>(DEFAULT_SPOTIFY_PLAYLIST_URL);
  const [availableEquipment, setAvailableEquipment] = useState<string>('Standard gym equipment (barbells, dumbbells, machines, cables, pull-up bar)');
  const [dailyNutrition, setDailyNutrition] = useState<MealAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [_notificationPermissionStatus, setNotificationPermissionStatus] = useState<NotificationPermission>('default');

  // OKR State
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [currentQuarterView, setCurrentQuarterView] = useState<string>(getCurrentQuarter());


  useEffect(() => {
    // Load existing data from localStorage
    const savedTheme = localStorage.getItem('lifeArchitectTheme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    else localStorage.setItem('lifeArchitectTheme', 'dark');

    const savedPoints = localStorage.getItem('lifeArchitectPoints');
    if (savedPoints) setPoints(parseInt(savedPoints, 10));

    const savedStudyHours = localStorage.getItem('lifeArchitectStudyHours');
    if (savedStudyHours) setTotalStudyHours(parseFloat(savedStudyHours));

    const savedStudyLogs = localStorage.getItem('lifeArchitectStudySessionLogs');
    if (savedStudyLogs) setStudySessionLogs(JSON.parse(savedStudyLogs));
    
    const savedCompleted = localStorage.getItem('lifeArchitectCompletedActivities');
    if (savedCompleted) setCompletedActivities(JSON.parse(savedCompleted));
    
    // For gym day rotation based on PPL
    const savedGymDayIndex = localStorage.getItem('lifeArchitectGymDayIndex');
    if (savedGymDayIndex) setCurrentGymDayIndex(parseInt(savedGymDayIndex, 10) % GYM_DAY_ROTATION.length);


    const savedWorkoutLogs = localStorage.getItem('lifeArchitectWorkoutLogs');
    if (savedWorkoutLogs) setWorkoutLogs(JSON.parse(savedWorkoutLogs));

    const savedCardioLogs = localStorage.getItem('lifeArchitectCardioLogs');
    if (savedCardioLogs) setCardioLogs(JSON.parse(savedCardioLogs));

    const savedQuickHitStreak = localStorage.getItem('lifeArchitectQuickHitStreak');
    if (savedQuickHitStreak) setQuickHitStreak(parseInt(savedQuickHitStreak, 10));
    
    const savedLastQuickHitDate = localStorage.getItem('lifeArchitectLastQuickHitDate');
    if (savedLastQuickHitDate) setLastQuickHitDate(savedLastQuickHitDate);

    const savedPlaylistUrl = localStorage.getItem('lifeArchitectSpotifyPlaylistUrl');
    if (savedPlaylistUrl) setSpotifyPlaylistUrl(savedPlaylistUrl);

    const savedEquipment = localStorage.getItem('lifeArchitectAvailableEquipment');
    if (savedEquipment) setAvailableEquipment(savedEquipment);
    
    const savedDailyNutrition = localStorage.getItem('lifeArchitectDailyNutrition');
    if (savedDailyNutrition) {
        const parsedNutrition = JSON.parse(savedDailyNutrition);
        // Ensure logs have dates, filter out old logs (e.g., older than 30 days for performance)
        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
        setDailyNutrition(parsedNutrition.filter((meal: MealAnalysis) => meal.date && meal.date >= thirtyDaysAgo));
    }


    const savedObjectives = localStorage.getItem('lifeArchitectObjectives');
    if (savedObjectives) setObjectives(JSON.parse(savedObjectives));
    
    const initNotifications = async () => {
      const initialPermission = getNotificationPermission();
      setNotificationPermissionStatus(initialPermission); 
      if (initialPermission === 'default') {
        const newPermission = await requestNotificationPermission();
        setNotificationPermissionStatus(newPermission);
      }
    };
    initNotifications();

    setIsLoading(false);
  }, []);

  useEffect(() => { localStorage.setItem('lifeArchitectTheme', theme); document.documentElement.classList.remove('dark', 'light', 'high-contrast'); document.body.classList.remove('dark', 'light', 'high-contrast'); document.documentElement.classList.add(theme); document.body.classList.add(theme); }, [theme]);
  useEffect(() => { localStorage.setItem('lifeArchitectPoints', points.toString()); }, [points]);
  useEffect(() => { localStorage.setItem('lifeArchitectStudyHours', totalStudyHours.toString()); }, [totalStudyHours]);
  useEffect(() => { localStorage.setItem('lifeArchitectStudySessionLogs', JSON.stringify(studySessionLogs)); }, [studySessionLogs]);
  useEffect(() => { localStorage.setItem('lifeArchitectCompletedActivities', JSON.stringify(completedActivities)); }, [completedActivities]);
  useEffect(() => { localStorage.setItem('lifeArchitectGymDayIndex', currentGymDayIndex.toString()); }, [currentGymDayIndex]);
  useEffect(() => { localStorage.setItem('lifeArchitectWorkoutLogs', JSON.stringify(workoutLogs)); }, [workoutLogs]);
  useEffect(() => { localStorage.setItem('lifeArchitectCardioLogs', JSON.stringify(cardioLogs)); }, [cardioLogs]);
  useEffect(() => { localStorage.setItem('lifeArchitectQuickHitStreak', quickHitStreak.toString()); }, [quickHitStreak]);
  useEffect(() => { if(lastQuickHitDate) localStorage.setItem('lifeArchitectLastQuickHitDate', lastQuickHitDate); }, [lastQuickHitDate]);
  useEffect(() => { localStorage.setItem('lifeArchitectSpotifyPlaylistUrl', spotifyPlaylistUrl); }, [spotifyPlaylistUrl]);
  useEffect(() => { localStorage.setItem('lifeArchitectAvailableEquipment', availableEquipment); }, [availableEquipment]);
  useEffect(() => { localStorage.setItem('lifeArchitectDailyNutrition', JSON.stringify(dailyNutrition)); }, [dailyNutrition]);
  useEffect(() => { localStorage.setItem('lifeArchitectObjectives', JSON.stringify(objectives)); }, [objectives]);


  const addPoints = useCallback((amount: number) => {
    setPoints(prev => prev + amount);
  }, []);

  const markActivityCompleted = useCallback((activityId: string, pointsEarned: number = 10) => {
    if (!completedActivities.includes(activityId)) {
      setCompletedActivities(prev => [...prev, activityId]);
      addPoints(pointsEarned);
    }
  }, [completedActivities, addPoints]);
  
  const updateKeyResultProgress = useCallback((krId: string, valueToAdd: number, absoluteValue?: number) => {
    setObjectives(prevObjectives => 
      prevObjectives.map(obj => ({
        ...obj,
        keyResults: obj.keyResults.map(kr => {
          if (kr.id === krId) {
            let newCurrentValue;
            if (absoluteValue !== undefined) {
              newCurrentValue = absoluteValue;
            } else {
              newCurrentValue = kr.currentValue + valueToAdd;
            }
            return { ...kr, currentValue: Math.min(Math.max(0, newCurrentValue), kr.targetValue) }; // Cap between 0 and targetValue
          }
          return kr;
        })
      }))
    );
  }, []);

 const handleStudySessionComplete = useCallback((minutesStudied: number, topic: string, linkedKRId?: string) => {
    const hoursStudied = minutesStudied / 60;
    setTotalStudyHours(prev => prev + hoursStudied);
    
    const newLogEntry: StudySessionLog = {
      date: new Date().toISOString().split('T')[0],
      durationMinutes: minutesStudied,
      topic: topic,
      linkedKRId: linkedKRId
    };
    setStudySessionLogs(prevLogs => {
        // Keep logs for e.g., last 90 days for performance
        const ninetyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 90)).toISOString().split('T')[0];
        const recentLogs = prevLogs.filter(log => log.date >= ninetyDaysAgo);
        return [...recentLogs, newLogEntry];
    });

    addPoints(Math.floor(hoursStudied * 5)); 
    markActivityCompleted(`study_session_${Date.now()}`, Math.floor(hoursStudied * 10));

    if (linkedKRId) {
      const krToUpdate = objectives.flatMap(o => o.keyResults).find(kr => kr.id === linkedKRId);
      if (krToUpdate?.unit.toLowerCase().includes('hour')) {
        updateKeyResultProgress(linkedKRId, hoursStudied);
      } else if (krToUpdate?.unit.toLowerCase().includes('min')) {
        updateKeyResultProgress(linkedKRId, minutesStudied);
      } else { // Assume it's sessions or modules
        updateKeyResultProgress(linkedKRId, 1);
      }
    }
  }, [addPoints, markActivityCompleted, updateKeyResultProgress, objectives]);
  
  const completeGymSession = useCallback((isWeightTraining: boolean, dayType: GymDayType, linkedKRId?: string) => {
    if (isWeightTraining && dayType !== GymDayType.CARDIO) { // CARDIO day type is for generic cardio sessions, not P/P/L rotation
        setCurrentGymDayIndex(prev => (prev + 1) % GYM_DAY_ROTATION.length);
    }
    addPoints(isWeightTraining ? 30 : 15); // Increased points for structured workouts
    if(linkedKRId){
        updateKeyResultProgress(linkedKRId, 1); // +1 session
    }
  }, [addPoints, updateKeyResultProgress]);

  const completeQuickHit = useCallback((linkedKRId?: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (lastQuickHitDate !== todayStr) {
        setQuickHitStreak(prev => prev + 1);
    }
    setLastQuickHitDate(todayStr);
    addPoints(15);
    markActivityCompleted('home_workout_am', 0); 
    if(linkedKRId){
        updateKeyResultProgress(linkedKRId, 1); // +1 session
    }
  }, [addPoints, markActivityCompleted, lastQuickHitDate, updateKeyResultProgress]);

  const addMealToNutritionLog = useCallback((meal: Omit<MealAnalysis, 'date'>) => {
    const mealWithDate: MealAnalysis = {
      ...meal,
      date: new Date().toISOString().split('T')[0]
    };
    setDailyNutrition(prev => {
        const today = new Date().toISOString().split('T')[0];
        // Filter out meals not from today before adding the new one
        const todaysMeals = prev.filter(m => m.date === today);
        return [...todaysMeals, mealWithDate];
    });
    addPoints(5);
    if(meal.linkedKRId){
        const krToUpdate = objectives.flatMap(o => o.keyResults).find(kr => kr.id === meal.linkedKRId);
        if(krToUpdate?.unit.toLowerCase().includes('cal')) {
            updateKeyResultProgress(meal.linkedKRId, meal.calories || 0);
        } else if (krToUpdate?.unit.toLowerCase().includes('gram') && krToUpdate.description.toLowerCase().includes('protein')) {
            updateKeyResultProgress(meal.linkedKRId, meal.proteinGrams || 0);
        } else {
            updateKeyResultProgress(meal.linkedKRId, 1); // Or count as 1 meal logged
        }
    }
  }, [addPoints, updateKeyResultProgress, objectives]);

  const setActiveSection: SetActiveSection = (section) => {
    setActiveSectionState(section);
  };

  const addObjective = (objective: Objective) => {
    setObjectives(prev => [...prev, objective]);
  };

  const updateObjective = (updatedObjective: Objective) => {
    setObjectives(prev => prev.map(obj => obj.id === updatedObjective.id ? updatedObjective : obj));
  };

  const deleteObjective = (objectiveId: string) => {
    setObjectives(prev => prev.filter(obj => obj.id !== objectiveId));
  };
  
  const currentKRsForQuarter = objectives.filter(obj => obj.quarter === currentQuarterView).flatMap(obj => obj.keyResults);
  
  // This is the GymDayType for the *next* P/P/L workout in the rotation.
  const nextPPLGymDayType = GYM_DAY_ROTATION[currentGymDayIndex];


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-bg dark:bg-dark-bg high-contrast:bg-hc-bg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard
                  schedule={DAILY_SCHEDULE}
                  completedActivities={completedActivities}
                  markActivityCompleted={markActivityCompleted}
                  totalStudyHours={totalStudyHours}
                  cfaTargetHours={CFA_TARGET_HOURS}
                  cfaDeadlineDate={CFA_DEADLINE_DATE}
                  points={points}
                  quickHitStreak={quickHitStreak}
                  lastQuickHitDate={lastQuickHitDate}
                  setActiveSection={setActiveSection}
                  objectives={objectives.filter(obj => obj.quarter === currentQuarterView)}
                />;
      case 'gym':
        return <GymHome 
                  currentGymDayType={nextPPLGymDayType} // Pass the P/P/L day for plan suggestion
                  onSessionComplete={(isWeightTraining, dayTypeUsed, linkedKR) => completeGymSession(isWeightTraining, dayTypeUsed, linkedKR)}
                  addWorkoutLog={(log) => {
                      setWorkoutLogs(prev => [...prev, log]);
                      if(log.linkedKRId) {
                          const krToUpdate = currentKRsForQuarter.find(kr => kr.id === log.linkedKRId);
                           if(krToUpdate?.unit.toLowerCase().includes('volume') || krToUpdate?.unit.toLowerCase().includes('kg')) {
                                updateKeyResultProgress(log.linkedKRId, (log.reps * log.weight * log.sets));
                           } else if (krToUpdate?.unit.toLowerCase().includes('set')) {
                                updateKeyResultProgress(log.linkedKRId, log.sets);
                           } else { // 'session' or 'exercise'
                                updateKeyResultProgress(log.linkedKRId, 1); 
                           }
                      }
                  }}
                  addCardioLog={(log) => {
                      setCardioLogs(prev => [...prev, log]);
                      if(log.linkedKRId) {
                        const krToUpdate = currentKRsForQuarter.find(kr => kr.id === log.linkedKRId);
                        if (krToUpdate?.unit.toLowerCase().includes('min')) {
                            updateKeyResultProgress(log.linkedKRId, log.durationMinutes);
                        } else if (krToUpdate?.unit.toLowerCase().includes('km') || krToUpdate?.unit.toLowerCase().includes('distance')) {
                            updateKeyResultProgress(log.linkedKRId, log.distanceKm || 0);
                        } else if (krToUpdate?.unit.toLowerCase().includes('cal')) {
                            updateKeyResultProgress(log.linkedKRId, log.caloriesBurned || 0);
                        } else { // 'session'
                            updateKeyResultProgress(log.linkedKRId, 1); 
                        }
                      }
                  }}
                  availableEquipment={availableEquipment}
                  workoutLogs={workoutLogs}
                  cardioLogs={cardioLogs}
                  currentKRs={currentKRsForQuarter}
                  theme={theme}
                />;
      case 'study':
        return <StudySessionManager 
                  addStudyHours={(hours, topic, krId) => handleStudySessionComplete(hours * 60, topic, krId)} 
                  totalStudyHours={totalStudyHours}
                  cfaTargetHours={CFA_TARGET_HOURS}
                  cfaDeadlineDate={CFA_DEADLINE_DATE}
                  mockCFAQuestions={MOCK_CFA_QUESTIONS}
                  cfaTopics={CFA_TOPICS}
                  onSessionComplete={(minutes, topic, krId) => handleStudySessionComplete(minutes, topic, krId)}
                  currentKRs={currentKRsForQuarter}
                />;
      case 'meditation':
        return <MeditationPlayer 
                  onSessionComplete={() => markActivityCompleted(`meditation_${Date.now()}`, 10)} 
                  spotifyPlaylistUrl={spotifyPlaylistUrl}
                />;
      case 'voiceqa':
        return <VoiceAssistant />;
      case 'quickhit':
        return <QuickHit 
                exercises={QUICK_HIT_EXERCISES} 
                targetReps={QUICK_HIT_TARGET_REPS} 
                onComplete={(krId) => completeQuickHit(krId)}
                streak={quickHitStreak}
                currentKRs={currentKRsForQuarter}
              />;
      case 'analytics':
        return <GlobalAnalyticsDashboard 
                  studyHoursTotal={totalStudyHours}
                  studySessionLogs={studySessionLogs}
                  workoutLogs={workoutLogs} 
                  cardioLogs={cardioLogs} 
                  points={points}
                  dailyNutritionLog={dailyNutrition}
                  theme={theme}
                />;
      case 'settings':
        return <SettingsPage 
                  currentTheme={theme} 
                  setTheme={setTheme} 
                  spotifyPlaylistUrl={spotifyPlaylistUrl}
                  setSpotifyPlaylistUrl={setSpotifyPlaylistUrl}
                  availableEquipment={availableEquipment}
                  setAvailableEquipment={setAvailableEquipment}
                  clearOKRs={() => {
                    if (window.confirm("Are you sure you want to delete ALL Objectives and Key Results? This cannot be undone.")) {
                      setObjectives([]);
                    }
                  }}
                />;
      case 'nutrition':
          return <NutritionTracker 
                    onMealAnalyzed={addMealToNutritionLog} 
                    dailyLog={dailyNutrition.filter(m => m.date === new Date().toISOString().split('T')[0])} 
                    currentKRs={currentKRsForQuarter}
                  />;
      case 'visionboard':
          return <VisionBoard 
                    objectives={objectives}
                    currentQuarter={currentQuarterView}
                    setCurrentQuarter={setCurrentQuarterView}
                    onAddObjective={addObjective}
                    onUpdateObjective={updateObjective}
                    onDeleteObjective={deleteObjective}
                    onUpdateKeyResultProgress={updateKeyResultProgress}
                  />;
      case 'visuals':
          return <VisualDashboard 
                    studySessionLogs={studySessionLogs}
                    workoutLogs={workoutLogs}
                    cardioLogs={cardioLogs}
                    dailyNutritionLog={dailyNutrition}
                    quickHitStreak={quickHitStreak}
                    lastQuickHitDate={lastQuickHitDate}
                    theme={theme}
                  />;
      default:
        return <Dashboard
                  schedule={DAILY_SCHEDULE}
                  completedActivities={completedActivities}
                  markActivityCompleted={markActivityCompleted}
                  totalStudyHours={totalStudyHours}
                  cfaTargetHours={CFA_TARGET_HOURS}
                  cfaDeadlineDate={CFA_DEADLINE_DATE}
                  points={points}
                  quickHitStreak={quickHitStreak}
                  lastQuickHitDate={lastQuickHitDate}
                  setActiveSection={setActiveSection}
                  objectives={objectives.filter(obj => obj.quarter === currentQuarterView)}
                />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen font-body bg-light-bg text-light-text dark:bg-dark-bg dark:text-dark-text high-contrast:bg-hc-bg high-contrast:text-hc-text transition-colors duration-300`}>
      <Header appName={APP_NAME} onNavigate={setActiveSection} currentPoints={points} currentSection={activeSection} />
      <main className="flex-grow container mx-auto px-2 py-4 sm:px-4 md:px-6">
        {renderSection()}
      </main>
      <footer className="text-center p-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 high-contrast:border-hc-border high-contrast:text-hc-text">
        Life Architect &copy; {new Date().getFullYear()}. Conquer your goals.
      </footer>
    </div>
  );
};

export default App;
