
export enum ActivityType {
  STUDY = "Study Session",
  GYM_WEIGHTS = "Gym - Weight Training",
  GYM_CARDIO = "Gym - Cardio",
  HOME_WORKOUT = "Home Quick-Hit",
  MEAL = "Meal",
  DRIVING = "Driving Class",
  MEDITATION = "Meditation",
  BREAK = "Break/Prep"
}

export interface ScheduleActivity {
  id: string;
  time: string; // e.g., "4:00 AM" or "4:30-7:00 AM"
  startTime?: Date; // For more precise calculations
  endTime?: Date; // For more precise calculations
  name: string;
  type: ActivityType;
  durationMinutes?: number;
  details?: string;
  isPotentiallyChallenging?: boolean; // For simplified failure forecast nudge
}

// Old Exercise type - will be deprecated by DetailedExercise for structured plans
export interface Exercise {
  id: string;
  name: string;
  gifUrl?: string; 
  cues?: string;
  muscleGroup?: string; 
  isPRTrackable?: boolean; 
}

export enum DetailedExerciseType {
  WARMUP_DYNAMIC_STRETCH = "Dynamic Stretch", // e.g., PVC Pass-Throughs
  WARMUP_ACTIVATION = "Activation", // e.g., Band Pull-Aparts, Scapular Push-ups
  WARMUP_CARDIO = "Cardio Warm-up", // e.g., Jump Rope
  WARMUP_MOBILITY = "Mobility", // e.g., World's Greatest Stretch, Cat-Cow
  WARMUP_FOAM_ROLL = "Warm-up Foam Roll", // Added to fix error
  MAIN_COMPOUND = "Compound Lift",
  MAIN_ISOLATION = "Isolation Exercise",
  FINISHER = "Finisher",
  COOLDOWN_STRETCH = "Static Stretch",
  COOLDOWN_FOAM_ROLL = "Foam Roll",
  COOLDOWN_BREATHING = "Breathing Exercise",
  COOLDOWN_ACTIVITY = "Cool-down Activity" // General category if others don't fit
}

export interface DetailedExercise {
  id: string; // e.g., "push_warmup_band_pull_apart"
  name: string; // e.g., "Band-Resisted Scapular Pull-Apart"
  type: DetailedExerciseType;
  segment?: string; // e.g., "Upper Chest", "Anterior Delt", "Scapular Stabs"
  setsReps: string; // e.g., "2 × 15", "3 × 8–12", "2 min", "30 sec each side"
  equipment: string; // e.g., "Resistance Band", "Bench + dumbbells", "Bodyweight"
  whyAndCitation?: string; // e.g., "30° incline maximizes clavicular-pec activation"
  citationLink?: string; // URL
  imageUrl?: string; // URL to a GIF/image
  notes?: string; // Optional extra instructions
  muscleGroup?: string; // Broader group like "Chest", "Shoulders" - can be derived or explicit
  isPRTrackable?: boolean; // For main lifts
}

export interface WorkoutPhase {
  name: string; // e.g., "Warm-Up", "Chest Exercises", "Shoulder Cool-Down"
  exercises: DetailedExercise[];
}

export interface DetailedWorkoutPlan {
  id: GymDayType; // PUSH, PULL, LEGS
  name: string; // "Push Day Strength Plan"
  description: string;
  phases: WorkoutPhase[];
}


export interface WorkoutLog {
  exerciseId: string;
  exerciseName?: string; 
  sets: number; 
  reps: number; 
  weight: number; 
  date: string; // YYYY-MM-DD
  muscleGroup?: string; 
  dayType?: GymDayType; 
  linkedKRId?: string; 
  exerciseType?: DetailedExerciseType; // New field
  targetSetsReps?: string; // New field, primarily for non-set/rep exercises
}

export interface CardioLog {
  type?: string; 
  durationMinutes: number;
  caloriesBurned?: number;
  distanceKm?: number;
  date: string; // YYYY-MM-DD
  linkedKRId?: string; 
}

export enum GymDayType {
  PUSH = "Push Day",
  PULL = "Pull Day",
  LEGS = "Legs Day",
  CARDIO = "Cardio Day" // Keep for generic cardio
}

export interface CFAQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string; 
  topic: string;
  explanation?: string;
  difficulty?: number; 
}

export interface Flashcard {
  id: string;
  front: string; 
  back: string;  
  topic: string;
  srsEaseFactor?: number; 
  srsIntervalDays?: number; 
  srsNextReviewDate?: string; 
  lastReviewedDifficulty?: 'easy' | 'good' | 'hard';
}

export type Theme = 'light' | 'dark' | 'high-contrast';

export type ActiveSection = 
  'dashboard' | 
  'gym' | 
  'study' | 
  'meditation' | 
  'voiceqa' | 
  'quickhit' | 
  'analytics' | 
  'settings' | 
  'nutrition' |
  'visionboard' | 
  'visuals';      

export type SetActiveSection = (section: ActiveSection) => void;

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  retrievedContext?: {
    uri?: string;
    title?: string;
  };
}

export interface MealAnalysis {
  mealName?: string;
  calories?: number;
  proteinGrams?: number;
  carbGrams?: number;
  fatGrams?: number;
  notes?: string;
  linkedKRId?: string; 
  date?: string; 
}

export interface KeyResult {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string; 
  objectiveId: string;
}

export interface Objective {
  id: string;
  title: string;
  quarter: string; 
  keyResults: KeyResult[];
}

export interface ActivityKRLink {
  activityLogId: string; 
  krId: string;
  contribution: number; 
}

export interface ExerciseSetEntry {
  reps: string;
  weight: string;
  linkedKRId?: string; 
}

export interface StudySessionLog {
  date: string; 
  durationMinutes: number;
  topic: string;
  linkedKRId?: string;
}
