
import React from 'react';
import { ScheduleActivity, ActivityType, CFAQuestion, GymDayType, DetailedWorkoutPlan, DetailedExerciseType, Exercise } from './types'; // Added DetailedWorkoutPlan, DetailedExerciseType

export const APP_NAME = "Life Architect";
export const CFA_TARGET_HOURS = 500;
export const CFA_DEADLINE_DATE = new Date(2025, 7, 1); // Month is 0-indexed, so 7 is August

export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';

export const DEFAULT_SPOTIFY_PLAYLIST_URL = "https://open.spotify.com/playlist/5gR4gv2XglaEFg2D2zbd8A?si=s6R_uG4gTVWte2iOtmDMHg&pt=29335fd9b1d524567ff327a26c5805b1&pi=3tqG1rdkQwajP";


// Helper to create Date objects for today with specific times
const createTodayDate = (hours: number, minutes: number): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
};

export const DAILY_SCHEDULE: ScheduleActivity[] = [
  { id: 'home_workout_am', time: '4:00 AM', startTime: createTodayDate(4,0), endTime: createTodayDate(4,30), name: 'Wake, shower, Quick-Hit', type: ActivityType.HOME_WORKOUT, durationMinutes: 30, details: '30 push-ups, 30 crunches, 30 squats' },
  { id: 'study1', time: '4:30 AM - 7:00 AM', startTime: createTodayDate(4,30), endTime: createTodayDate(7,0), name: 'Study Session 1 (CFA L1)', type: ActivityType.STUDY, durationMinutes: 150 },
  { id: 'gym1_prep', time: '7:00 AM - 7:30 AM', startTime: createTodayDate(7,0), endTime: createTodayDate(7,30), name: 'Travel to Gym/Prep', type: ActivityType.BREAK, durationMinutes: 30 },
  { id: 'gym1', time: '7:30 AM - 8:30 AM', startTime: createTodayDate(7,30), endTime: createTodayDate(8,30), name: 'Gym Time', type: ActivityType.GYM_WEIGHTS, durationMinutes: 60, details: 'Weight Training or Cardio choice' },
  { id: 'breakfast_prep', time: '8:30 AM - 9:30 AM', startTime: createTodayDate(8,30), endTime: createTodayDate(9,30), name: 'Breakfast, shower, get ready', type: ActivityType.MEAL, durationMinutes: 60 },
  { id: 'study2', time: '9:30 AM - 12:30 PM', startTime: createTodayDate(9,30), endTime: createTodayDate(12,30), name: 'Study Session 2 (CFA L1)', type: ActivityType.STUDY, durationMinutes: 180 },
  { id: 'lunch', time: '12:30 PM - 1:00 PM', startTime: createTodayDate(12,30), endTime: createTodayDate(13,0), name: 'Lunch', type: ActivityType.MEAL, durationMinutes: 30 },
  { id: 'driving', time: '1:00 PM - 2:00 PM', startTime: createTodayDate(13,0), endTime: createTodayDate(14,0), name: 'Driving class', type: ActivityType.DRIVING, durationMinutes: 60 },
  { id: 'study3', time: '2:00 PM - 5:00 PM', startTime: createTodayDate(14,0), endTime: createTodayDate(17,0), name: 'Study Session 3 (CFA L1 - PM Focus)', type: ActivityType.STUDY, durationMinutes: 180, isPotentiallyChallenging: true }, // Example of a challenging session
  { id: 'gym2', time: '5:00 PM - 6:00 PM', startTime: createTodayDate(17,0), endTime: createTodayDate(18,0), name: 'Gym - Cardio', type: ActivityType.GYM_CARDIO, durationMinutes: 60 },
  { id: 'dinner', time: '6:00 PM - 6:30 PM', startTime: createTodayDate(18,0), endTime: createTodayDate(18,30), name: 'Dinner', type: ActivityType.MEAL, durationMinutes: 30 },
  { id: 'study4_prep', time: '6:30 PM - 7:00 PM', startTime: createTodayDate(18,30), endTime: createTodayDate(19,0), name: 'Break/Prep', type: ActivityType.BREAK, durationMinutes: 30 },
  { id: 'study4', time: '7:00 PM - 8:30 PM', startTime: createTodayDate(19,0), endTime: createTodayDate(20,30), name: 'Study Session 4 (CFA L1 - Evening Review)', type: ActivityType.STUDY, durationMinutes: 90 },
  { id: 'meditation_pm', time: 'Before Bed (~10 PM)', startTime: createTodayDate(22,0), endTime: createTodayDate(22,15), name: 'Evening Meditation', type: ActivityType.MEDITATION, durationMinutes: 15 },
];

export const QUICK_HIT_EXERCISES: Exercise[] = [ // Keep this simple Exercise type for QuickHit
    { id: 'qh_pushups', name: 'Push-ups', cues: 'Keep core tight, full range of motion.' },
    { id: 'qh_crunches', name: 'Crunches', cues: 'Focus on abdominal contraction, avoid pulling neck.' },
    { id: 'qh_squats', name: 'Squats', cues: 'Chest up, back straight, descend to parallel or below.' },
];
export const QUICK_HIT_TARGET_REPS = 30;

export const GYM_DAY_ROTATION: GymDayType[] = [GymDayType.PUSH, GymDayType.PULL, GymDayType.LEGS];


// Old EXERCISES_DB is deprecated, replaced by WORKOUT_PLANS_DB
// Still useful for PR tracking mapping if IDs are consistent or mapped.
export const EXERCISES_DB_OLD_FOR_PR_TRACKING: { [key: string]: Exercise } = {
    'bench_press': { id: 'bench_press', name: 'Bench Press', isPRTrackable: true, muscleGroup: 'Chest' },
    'overhead_press': { id: 'overhead_press', name: 'Overhead Press', isPRTrackable: true, muscleGroup: 'Shoulders' },
    'pull_ups': { id: 'pull_ups', name: 'Pull-ups/Lat Pulldowns', isPRTrackable: true, muscleGroup: 'Back' },
    'barbell_row': { id: 'barbell_row', name: 'Barbell Row', isPRTrackable: true, muscleGroup: 'Back' },
    'squats': { id: 'squats', name: 'Barbell Squats', isPRTrackable: true, muscleGroup: 'Legs' },
    'romanian_deadlifts': { id: 'romanian_deadlifts', name: 'Romanian Deadlifts', isPRTrackable: true, muscleGroup: 'Hamstrings' },
    'deadlifts': { id: 'deadlifts', name: 'Deadlifts (Conventional)', isPRTrackable: true, muscleGroup: 'Full Body'}
};


export const WORKOUT_PLANS_DB: DetailedWorkoutPlan[] = [
  {
    id: GymDayType.PUSH,
    name: "Push Day Strength Plan",
    description: "Focuses on chest, shoulders, and triceps with EMG-validated exercises.",
    phases: [
      {
        name: "🔥 Push-Day Dynamic Warm-Up (10 min)",
        exercises: [
          { id: "push_warmup_band_pull_apart", name: "Band-Resisted Scapular Pull-Apart", type: DetailedExerciseType.WARMUP_ACTIVATION, setsReps: "2 × 15", equipment: "Resistance Band", whyAndCitation: "Pre-activates upper back & scapular stabilizers.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzVwbnY1bGYzaXFmM3hvNnJtZ3d0ajM5cnF2eGRkcjhpYm1qenhicyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LqxyDaCjBji1O/giphy.gif" },
          { id: "push_warmup_pvc_passthroughs", name: "PVC Pass-Throughs", type: DetailedExerciseType.WARMUP_DYNAMIC_STRETCH, setsReps: "2 × 10", equipment: "PVC Pipe or Band", whyAndCitation: "Opens chest/shoulders, primes range of motion.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnF5aXUzZW1xaWJtdDhyM3ZpMnQ4ZnFub2I2dDY0azFscWt0ZWZnMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPeHLy79z8g9sM8/giphy.gif" },
          { id: "push_warmup_jump_rope", name: "Jump Rope", type: DetailedExerciseType.WARMUP_CARDIO, setsReps: "2 min", equipment: "Jump Rope", whyAndCitation: "Elevates HR, engages calves & shoulders.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejN4ZmNmaXdkaTgyc2IzeThjdzMxbmN0MHFwOGk1aG90M253czR0MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26uffzvNQR5JXCVz44/giphy.gif" },
          { id: "push_warmup_worlds_greatest", name: "World’s Greatest Stretch", type: DetailedExerciseType.WARMUP_MOBILITY, setsReps: "5 reps/side", equipment: "Bodyweight", whyAndCitation: "Full-body mobility with chest/hip opening.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmVwYnh6ZWNhMnljaXduYmdseTdhc3M1N2VvcXJ1anZxaDB2NGJmbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cPnNcles0JbnRgSl0f/giphy.gif" },
          { id: "push_warmup_scapular_pushups", name: "Scapular Push-Ups", type: DetailedExerciseType.WARMUP_ACTIVATION, setsReps: "10 slow reps", equipment: "Bodyweight", whyAndCitation: "Activates serratus anterior & warms shoulder girdle.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTY1d2l2MHJzcnQ1dG10c2p4em16MWs0dGhzNHN0cGxtNXQ0c2N5ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/brSoY3qDoeLDi/giphy.gif" },
        ]
      },
      {
        name: "1️⃣ Chest (5 Exercises)",
        exercises: [
          { id: "push_chest_incline_db_press", name: "Incline Dumbbell Press @ 30°", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Upper Chest", setsReps: "3 × 8–12", equipment: "Bench + dumbbells", whyAndCitation: "30° incline maximizes clavicular-pec activation.", citationLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7572863/", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExemk4dzI5ZGd0NWVscjFnYjJuc3M2bDY1OWVnbTlhZHQ2MDBkaGJlcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/W3a0zO28X0qfdRFYpAS/giphy.gif", isPRTrackable: true, muscleGroup: "Chest" },
          { id: "push_chest_flat_db_press", name: "Flat Dumbbell Bench Press", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Middle Chest", setsReps: "3 × 8–12", equipment: "Flat bench + dumbbells", whyAndCitation: "Comparable to barbell for mid-chest EMG.", citationLink: "https://core.ac.uk/download/pdf/83626927.pdf", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3U4ZXpnaHFsc2JsbDR0Z3RtdGc3bDl6ZWo1bzVqb2N2cDFjOTY4cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cirsqE69d1oJO/giphy.gif", isPRTrackable: true, muscleGroup: "Chest" },
          { id: "push_chest_decline_db_press", name: "Decline Dumbbell Press", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Lower Chest", setsReps: "3 × 8–12", equipment: "Decline bench + dumbbells", whyAndCitation: "Decline press elicits 93% lower-pec EMG.", citationLink: "https://pubmed.ncbi.nlm.nih.gov/17530986/", imageUrl: "https://jefit.com/images/exercises/800_600/13.gif", isPRTrackable: true, muscleGroup: "Chest" },
          { id: "push_chest_machine_press", name: "Chest Press Machine", type: DetailedExerciseType.MAIN_COMPOUND, segment: "All-Around Chest", setsReps: "3 × 10–15", equipment: "Machine", whyAndCitation: "Constant tension for full-PEC engagement.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExanJ1cjV4cHY2dGR0MnZocm1mN3R2dWUwYnpiaHMwZnE0bDBtaWZuZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gTurZQe2xS3f2/giphy.gif", muscleGroup: "Chest" },
          { id: "push_chest_pec_deck_fly", name: "Pec-Deck Fly (or Cable Fly @ mid-height)", type: DetailedExerciseType.FINISHER, segment: "Chest Finisher", setsReps: "3 × 12–15", equipment: "Machine or cables", whyAndCitation: "Peak inner-chest peak contraction and striation.", citationLink: "https://www.jefit.com/exercises/17/Pec-Deck-Fly", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnBrcTN4cHh0N3VkbTByM3B6ZHMzbjc2ZzZ1cnMyZnZubTNpZTVpMyZlcD12MV9pbnRlcm5hbF_naWZzX2dpZklkJmN0PWc/bNvr5mf4Y382X94AhY/giphy.gif", muscleGroup: "Chest" },
        ]
      },
      {
        name: "2️⃣ Shoulders (5 Exercises)",
        exercises: [
          { id: "push_shoulder_seated_db_press", name: "Seated Dumbbell Shoulder Press", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Anterior Delt", setsReps: "3 × 8–12", equipment: "Upright bench + dumbbells", whyAndCitation: "~11% greater anterior-delt EMG vs. barbell/standing.", citationLink: "https://pubmed.ncbi.nlm.nih.gov/23096062/", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z2NnBjb3NtbDZrc2d1ajZ6cjVtbDk5aTd2MXRzcG41aXFscjB2NSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eL0YU0s9G61j9jM04w/giphy.gif", isPRTrackable: true, muscleGroup: "Shoulders" },
          { id: "push_shoulder_lateral_raise", name: "Dumbbell Lateral Raise", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Medial Delt", setsReps: "3 × 12–15", equipment: "Dumbbells", whyAndCitation: "Highest medial-delt activation (~30% MVIC).", citationLink: "https://www.researchgate.net/publication/337190533_Electromyographic_Analysis_of_the_Deltoid_Muscle_During_Various_Shoulder_Exercises", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDB5YW15em5lMHFqMzZkdDVyZHgxbmp2c2o4amFkbmN5cDVnaHc2aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QzB043hRfh9223ZXMj/giphy.gif", muscleGroup: "Shoulders" },
          { id: "push_shoulder_rear_lateral_raise", name: "Seated Rear Lateral Raise (DB)", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Posterior Delt", setsReps: "3 × 12–15", equipment: "Incline bench + dumbbells", whyAndCitation: "Top posterior-delt EMG in EMG studies.", citationLink: "https://www.acefitness.org/continuing-education/certified/september-2014/5001/dynamite-delts-ace-research-identifies-top-shoulder-exercises/", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm14cjN6OTRxcXQ4a2hzcjMydjJ3dHB5eGZkM3BwYWg0NzM0MzU3ayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kET2Gv Servj68uln6/giphy.gif", muscleGroup: "Shoulders" },
          { id: "push_shoulder_arnold_press", name: "Arnold Press", type: DetailedExerciseType.MAIN_COMPOUND, segment: "All-Around Shoulder", setsReps: "3 × 8–10", equipment: "Dumbbells", whyAndCitation: "Compound multi-head stimulus, blends press and rotation for full-deltoid engagement.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWZ0N2pwbzMwb3JkOHY3dHFyZnNoNGlpc3NpbGRzbnd0NnY0ZDJqciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/eMmHq6AD2i0m4qNZ2v/giphy.gif", isPRTrackable: true, muscleGroup: "Shoulders" },
          { id: "push_shoulder_face_pull", name: "Cable Face-Pull", type: DetailedExerciseType.FINISHER, segment: "Shoulder Finisher", setsReps: "2 × 15", equipment: "Cable machine + rope", whyAndCitation: "High rear-delt/end-range shoulder health and postural benefit.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjU1cHdya2ZlbTlreWR6NXFuazE2ajBrcDVlZmYzNGE4ZW1zZDJnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TLCm84iAuze1q3aQ25/giphy.gif", muscleGroup: "Shoulders" },
        ]
      },
      {
        name: "3️⃣ Triceps (5 Exercises)",
        exercises: [
          { id: "push_triceps_overhead_ext", name: "Overhead Cable Triceps Extension (rope, elbows in)", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Long Head Triceps", setsReps: "3 × 10–12", equipment: "Cable machine + rope", whyAndCitation: "Overhead stretch maximizes long-head EMG.", citationLink: "https://www.reddit.com/r/Fitness/comments/2u70sm/what_is_the_best_exercise_for_each_head_of_the/", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTFicXk3a3Nld29uYzZkYzd6cGhuMWh1azZ0aDZtYW90dnpwNmIxeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VbnUQpnihPSaVwdeqS/giphy.gif", muscleGroup: "Triceps" },
          { id: "push_triceps_pronated_pushdown", name: "Pronated-Bar Cable Pushdown", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Lateral Head Triceps", setsReps: "3 × 12–15", equipment: "Cable + straight bar", whyAndCitation: "Overhand pushdown yields highest lateral-head activation (general consensus).", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzhudTB2dXo5aDlsYTNkNWZ0ZjQ5Z3Q3d3N0MW53NXYweDl4dzNndCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d5pra0585affS1b2o5/giphy.gif", muscleGroup: "Triceps" },
          { id: "push_triceps_rope_pushdown", name: "Rope Triceps Pushdown", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Medial Head Triceps", setsReps: "3 × 12–15", equipment: "Cable + rope", whyAndCitation: "Rope split at bottom peaks medial-head EMG.", citationLink: "https://journal.iusca.org/index.php/Journal/article/view/112", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZW1qN3Bja3Qwa2J2OWhva2N4cmZyMm9uNDh0OW04bWVmNTcxc2M2MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zGkZ3NrXnMc3deTdNU/giphy.gif", muscleGroup: "Triceps" },
          { id: "push_triceps_weighted_dips", name: "Weighted Dips", type: DetailedExerciseType.MAIN_COMPOUND, segment: "All-Around Triceps", setsReps: "3 × 8–10", equipment: "Dip station + weight", whyAndCitation: "Highest combined triceps EMG (85–90%).", citationLink: "https://pubmed.ncbi.nlm.nih.gov/19417235/", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2cGlzbHJjcHpjc3B0ZGR2enBwN3R6aDY5MzZ5ZWZnMTBxYTlzYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kVTpHQZ1557qg/giphy.gif", isPRTrackable: true, muscleGroup: "Triceps" },
          { id: "push_triceps_diamond_pushup", name: "Diamond Push-Up", type: DetailedExerciseType.FINISHER, segment: "Triceps Finisher", setsReps: "2 × 15", equipment: "Bodyweight", whyAndCitation: "Peak contraction under body-weight load for full-head burnout.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjBwd3ZnODJ0Nmlqa3ZlZG9zMzFuc2FkYnF5YWxwZ2cyZWJ0ZzZkMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/u2R அம்2Y5f32UTn1sd/giphy.gif", muscleGroup: "Triceps" },
        ]
      },
      {
        name: "🧘‍♂️ Push-Day Cool-Down & Stretch (7 min)",
        exercises: [
          { id: "push_cooldown_doorway_pec", name: "Doorway Pec Stretch", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each side", equipment: "Doorway", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajE2bTRudmF6ZnJ3OGg1b3R0emFrZXQxZm9icjZlMTg1ZHJtMGk5OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KDRj412702hWv2gBvm/giphy.gif" },
          { id: "push_cooldown_overhead_triceps_lat", name: "Overhead Triceps & Lat Stretch", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each arm", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG13Mms0eGEzNW82NTY5eTJjMWtya3JjYjZ1cGt0dzZwMWM2eWVhYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YPysUfxYoNl5A4WJ9U/giphy.gif" },
          { id: "push_cooldown_cross_body_shoulder", name: "Cross-Body Shoulder Stretch", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each arm", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDBkZHk2NDh5dnhkYXFzYXJidmdicjZ2N2RpbjVtZW9vMmNsMnN0bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Q7YFw6s21xYtD9k7u1/giphy.gif" },
          { id: "push_cooldown_childs_pose_lat_reach", name: "Child’s Pose with Lat Reach", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "5 reps per side", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjA1dTNjY21iOHhmd2NrdWN5bGJwd2V5NmJpcnYwNjFpcXVxMThnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ckb5he57y2xjy/giphy.gif" },
          { id: "push_cooldown_foam_roll_triceps_lats", name: "Foam-Roll Triceps & Lats", type: DetailedExerciseType.COOLDOWN_FOAM_ROLL, setsReps: "1 min total", equipment: "Foam Roller", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNTN1aWJicDRtdDk2NmR3d3lpcHU2aHlvcGZzY2puaDlnMTRzMjViYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gVoa3602kAePu/giphy.gif" },
          { id: "push_cooldown_breathing", name: "Deep Diaphragmatic Breathing", type: DetailedExerciseType.COOLDOWN_BREATHING, setsReps: "1 min", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndxYmhvYnU3amc5ZXd5cnl0MDF2ZzVhaGltaWt2ajM1eGh2MGlmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKDXDbNBHGnYbPq/giphy.gif" },
        ]
      }
    ]
  },
  {
    id: GymDayType.PULL,
    name: "Pull Day Strength Plan",
    description: "Focuses on back and biceps with EMG-validated exercises.",
    phases: [
      {
        name: "🔥 Pull-Day Dynamic Warm-Up (10 min)",
        exercises: [
          { id: "pull_warmup_band_pull_apart", name: "Band-Resisted Pull-Apart", type: DetailedExerciseType.WARMUP_ACTIVATION, setsReps: "2 × 15", equipment: "Resistance Band", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzVwbnY1bGYzaXFmM3hvNnJtZ3d0ajM5cnF2eGRkcjhpYm1qenhicyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LqxyDaCjBji1O/giphy.gif" },
          { id: "pull_warmup_pvc_passthroughs", name: "PVC Pass-Throughs", type: DetailedExerciseType.WARMUP_DYNAMIC_STRETCH, setsReps: "2 × 10", equipment: "PVC Pipe or Band", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnF5aXUzZW1xaWJtdDhyM3ZpMnQ4ZnFub2I2dDY0azFscWt0ZWZnMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPeHLy79z8g9sM8/giphy.gif" },
          { id: "pull_warmup_jump_rope", name: "Jump Rope", type: DetailedExerciseType.WARMUP_CARDIO, setsReps: "2 min", equipment: "Jump Rope", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejN4ZmNmaXdkaTgyc2IzeThjdzMxbmN0MHFwOGk1aG90M253czR0MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26uffzvNQR5JXCVz44/giphy.gif" },
          { id: "pull_warmup_scapular_pullups", name: "Scapular Pull-Ups (or Scapular Retractions on Low Cable)", type: DetailedExerciseType.WARMUP_ACTIVATION, setsReps: "2 × 10", equipment: "Pull-up bar or Cable Machine", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXgyNnVuZHVzdmR5MzM4bjF0eWZvNjBrdnNzMndpMjd4dGk1eWZtaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pPhyVRs736vjHX8tB7/giphy.gif" },
          { id: "pull_warmup_cat_cow", name: "Cat–Cow Mobilization", type: DetailedExerciseType.WARMUP_MOBILITY, setsReps: "5 reps", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejNoaTRqdDJxazg5M3hvZ3B0ZWltbmV2dXg0bjBjaG15YWplOWhpciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0Cyrl7jDUSusM6A0/giphy.gif" },
        ]
      },
      {
        name: "1️⃣ Back (5 Exercises)",
        exercises: [
          { id: "pull_back_lat_pulldown", name: "Wide-Grip Lat Pulldown", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Lats Width", setsReps: "3 × 8–12", equipment: "Cable machine + bar", whyAndCitation: "Elicits ~86% MVIC in latissimus dorsi—top for width development.", citationLink: "https://www.bodybuilding.net/fun/emg-study-optimal-training-for-a-bigger-thicker-back.html", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjB3azRzYnp0bHZqZ25sNHJtY3Q5OHkya3J3Z2Q4OHR3enZwcHZxNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/oBzn0crtO2IYoNAmND/giphy.gif", isPRTrackable: true, muscleGroup: "Back" },
          { id: "pull_back_one_arm_db_row", name: "One-Arm Dumbbell Row", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Back Thickness", setsReps: "3 × 8–12 each", equipment: "Dumbbell + bench", whyAndCitation: "One-arm row hits lats and rhomboids at ~91% MVIC—prime for mid-back thickness.", citationLink: "https://www.bodybuilding.net/fun/emg-study-optimal-training-for-a-bigger-thicker-back.html", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0MnN6MG5lMnhmOWE3ZHN2NWVoemY1MDR0Z29qaXQ3ODl2ZzM4eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iAWMD0nxJw0kqFq2L8/giphy.gif", isPRTrackable: true, muscleGroup: "Back" },
          { id: "pull_back_rdl", name: "Romanian Deadlift", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Lower Back/Hams", setsReps: "3 × 8–12", equipment: "Dumbbells or Barbell", whyAndCitation: "RD variation shows highest erector spinae excitation (longissimus) among deadlift types.", citationLink: "https://www.mdpi.com/2075-4663/8/7/98", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG9xZzFqejZ2ZDN2bDZxa29wZ2pxd2oxamN5azI2eHVhM210Z3B2aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Rivc43HOL2m3dM03m9/giphy.gif", isPRTrackable: true, muscleGroup: "Back" },
          { id: "pull_back_chin_up", name: "Chin-Up (Underhand Grip)", type: DetailedExerciseType.MAIN_COMPOUND, segment: "All-Around Back", setsReps: "3 × to failure", equipment: "Pull-up bar", whyAndCitation: "BB and LD EMG > lat-pulldown; also recruits lower traps & erectors.", citationLink: "https://pubmed.ncbi.nlm.nih.gov/20543740/", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHBpY2d5dzNoN3B5bXhnbTFnZnZ6aGNyaDVuNnJ2aHF6Z2F3a3J6NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VJhY3u52E4saQ/giphy.gif", isPRTrackable: true, muscleGroup: "Back" },
          { id: "pull_back_straight_arm_pulldown", name: "Straight-Arm Cable Pulldown", type: DetailedExerciseType.FINISHER, segment: "Back Finisher", setsReps: "2 × 15", equipment: "Cable machine + bar", whyAndCitation: "Isolation stretch of lats for peak contraction and definition.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmlqYWczN2x1b2M0NnpwZzVqOWV1N201dzZtdXB4Z25xZ2F4MmdtdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sWnVtCeC4r2J0xOt8F/giphy.gif", muscleGroup: "Back" },
        ]
      },
      {
        name: "2️⃣ Biceps (5 Exercises)",
        exercises: [
          { id: "pull_biceps_incline_db_curl", name: "Incline Dumbbell Curl", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Long Head Biceps", setsReps: "3 × 10", equipment: "Incline bench + dumbbells", whyAndCitation: "IDC keeps long head under tension throughout ROM, high EMG vs. preacher & standard curls.", citationLink: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4166205/", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmN5ZDAweGllNnU0OG9qY2k4NHVjaWFyZnF0aDZ2ZXZ4MHI3cmZuNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XHx1QльшеZ4zNq97h/giphy.gif", muscleGroup: "Biceps" },
          { id: "pull_biceps_preacher_curl", name: "Dumbbell Preacher Curl", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Short Head Biceps", setsReps: "3 × 10", equipment: "Preacher bench + DB", whyAndCitation: "Preacher curl (bar) showed ~90% BB EMG, emphasizing the short head at lock-out.", citationLink: "https://www.bodybuilding.net/fun/emg-arm-blaster-biceps-training.html", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3A5eGV1ZWQzcWZsaG8xZm52dWFvb2QwbzBpdTdkMmV6aWp1cDJzYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dOlBvE5yVTeCc/giphy.gif", muscleGroup: "Biceps" },
          { id: "pull_biceps_hammer_curl", name: "Hammer Curl", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Brachialis/Brachioradialis", setsReps: "3 × 12", equipment: "Dumbbells", whyAndCitation: "Neutral grip drives brachialis & brachioradialis, adds thickness & lateral sweep.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2Vrcnl2bW9jMTdpZzJ2c3k3N3l0dHVmcHFka2h2azZkdmh4emY2eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/J6Jaz0t4G2YtnsrL8R/giphy.gif", muscleGroup: "Biceps" },
          { id: "pull_biceps_standing_db_curl", name: "Standing Dumbbell Curl", type: DetailedExerciseType.MAIN_COMPOUND, segment: "All-Around Biceps", setsReps: "3 × 8–12", equipment: "Dumbbells", whyAndCitation: "Standard curl evokes ~84% BB MVIC—excellent overall development.", citationLink: "https://www.bodybuilding.net/fun/emg-arm-blaster-biceps-training.html", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZG5yYm54eW1oa3h0OGs2enRwZ2Nqb3pxcHBwNm85OGQ1aWJ0eDN5YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1MXk4gG034wZm/giphy.gif", isPRTrackable: true, muscleGroup: "Biceps" },
          { id: "pull_biceps_cable_concentration_curl", name: "Cable Concentration Curl", type: DetailedExerciseType.FINISHER, segment: "Biceps Finisher", setsReps: "2 × 15 each", equipment: "Cable machine + handle", whyAndCitation: "Peak contraction & deep burn under constant tension.", citationLink: "https://www.bodybuilding.com/exercises/cable-concentration-curl", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3hzb3ZobHV2dTRia2J0Mmk2M2k0bmR2eW1id2gybGVsdG92cmNjaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/iJgojA2cVAi1kGYhTw/giphy.gif", muscleGroup: "Biceps" },
        ]
      },
      {
        name: "🧘‍♂️ Pull-Day Cool-Down & Stretch (7 min)",
        exercises: [
          { id: "pull_cooldown_childs_pose_lat_reach", name: "Child’s Pose with Lat Reach", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "5 reps per side", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjA1dTNjY21iOHhmd2NrdWN5bGJwd2V5NmJpcnYwNjFpcXVxMThnayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ckb5he5y2xjy/giphy.gif" },
          { id: "pull_cooldown_static_lat_stretch", name: "Static Lat Stretch on Bench/Wall", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each side", equipment: "Bench or Wall", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGs3YXp2aWxtMjk3Mmx0c3dkMTFqZ3I5NmtxN2M4a3Mwa2RvcXQ4byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jIR0fmf6xFMfC/giphy.gif" },
          { id: "pull_cooldown_seated_hamstring", name: "Seated Hamstring Stretch", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each leg", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3FqY2l6ZmQyZHR4MWQyMmszdGNsM3l1d3M4Mzk5ZWRwMW01aDByZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ieoocoo5n2n2U/giphy.gif" },
          { id: "pull_cooldown_cross_body_biceps_wall", name: "Cross-Body Biceps Wall Stretch", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each arm", equipment: "Wall", imageUrl: "https://i.makeagif.com/media/9-18-2015/N2N5H_.gif" },
          { id: "pull_cooldown_foam_roll_lats_thoracic", name: "Foam-Roll Lats & Thoracic Spine", type: DetailedExerciseType.COOLDOWN_FOAM_ROLL, setsReps: "1 min total", equipment: "Foam Roller", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmc3ZGk1NWZ0cnZ1dDJ3aDR1em9rZ2hveHUxMmZ3aXQwcml1bndubCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2zV0N5qgMYGrK/giphy.gif" },
          { id: "pull_cooldown_breathing", name: "Deep Diaphragmatic Breathing", type: DetailedExerciseType.COOLDOWN_BREATHING, setsReps: "1 min", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndxYmhvYnU3amc5ZXd5cnl0MDF2ZzVhaGltaWt2ajM1eGh2MGlmNiZlcD12MV9pbnRlcm5hbF_naWZfYnlfaWQmY3Q9Zw/3o7TKDXDbNBHGnYbPq/giphy.gif" },
        ]
      }
    ]
  },
  {
    id: GymDayType.LEGS,
    name: "Leg Day Strength Plan",
    description: "Focuses on quads, hamstrings, and glutes with EMG-validated exercises.",
    phases: [
      {
        name: "🔥 Leg-Day Dynamic Warm-Up (10 min)",
        exercises: [
          { id: "legs_warmup_foam_roll_quads_it", name: "Foam-Roll: Quads & IT Bands", type: DetailedExerciseType.WARMUP_FOAM_ROLL, setsReps: "1 min each", equipment: "Foam Roller", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNta250cWZ0YzN0cGw0dTRmNmJ5OHB6dWNmbmYwN2l0eDF2dGtrMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RltPNTzXYEwVy/giphy.gif" },
          { id: "legs_warmup_leg_swings", name: "Leg Swings (F/R & L/R)", type: DetailedExerciseType.WARMUP_DYNAMIC_STRETCH, setsReps: "10 per direction", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDJ4MzIzaHFscHljcXFpOHJ6OWQ3MTY3bW5tMnpyaTF5Z3o0cTV3MyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/R8M4p4L1K2g9i/giphy.gif" },
          { id: "legs_warmup_walking_lunges", name: "Walking Lunges", type: DetailedExerciseType.WARMUP_ACTIVATION, setsReps: "2 × 10 steps", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTZxbmZmM21pMGkzdGV3M3o5N2x1c2E5MGZkdDVpaHg1eG1xdGRzNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fA4nhJ4YQzFZu/giphy.gif" },
          { id: "legs_warmup_squat_t_push", name: "Bodyweight Squat → T-Push", type: DetailedExerciseType.WARMUP_MOBILITY, setsReps: "5 reps per side", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnFjOXdrNWlnaDB0ZTFoejIzMHQydnZ0eXp2eDJ3bzJ1ZGN5bHZzcSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TpsNO71q3Nsco/giphy.gif" }, // Placeholder for T-Push part
          { id: "legs_warmup_jump_rope", name: "Jump Rope", type: DetailedExerciseType.WARMUP_CARDIO, setsReps: "1 min", equipment: "Jump Rope", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejN4ZmNmaXdkaTgyc2IzeThjdzMxbmN0MHFwOGk1aG90M253czR0MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26uffzvNQR5JXCVz44/giphy.gif" },
        ]
      },
      {
        name: "1️⃣ Quadriceps (5 Exercises)",
        exercises: [
          { id: "legs_quads_sissy_squat", name: "Sissy Squat", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Vastus Medialis", setsReps: "3 × 12", equipment: "Bodyweight (hands support)", whyAndCitation: "Sissy squats produce ~20% greater VMO EMG vs. back squat.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnZ3aHJxOG0xNDY4dThucWpucjNnb3FqdnM1cTNnbmpxemZ0Z2FqYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UdvqB7fSg5N4ZJgqIq/giphy.gif", muscleGroup: "Quads" },
          { id: "legs_quads_narrow_leg_press", name: "Narrow-Stance Leg Press", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Vastus Lateralis", setsReps: "3 × 10–12", equipment: "Leg-press machine", whyAndCitation: "Narrow stance + high foot placement yields highest VL activation.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdm9lZjN2bTJicXFkczVzcmVpNXFkZXJjYTA5OHZzNW00dHZ5bnB6ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MSFMNZUM5ZrdS/giphy.gif", isPRTrackable: true, muscleGroup: "Quads" },
          { id: "legs_quads_bulgarian_split_squat", name: "Bulgarian Split Squat", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Rectus Femoris", setsReps: "3 × 8–10 ea.", equipment: "Dumbbells + bench", whyAndCitation: "Rear foot elevated increases RF length tension, maximizing EMG.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjIybmd4bnh1OWE3MWQxa2RtbTJoaXF2aDN4ZXJmZmhpMXM4ZWZzNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QWU0xJ7sTafGMBQroZ/giphy.gif", isPRTrackable: true, muscleGroup: "Quads" },
          { id: "legs_quads_goblet_squat", name: "Goblet Squat", type: DetailedExerciseType.MAIN_COMPOUND, segment: "All-Around Quads", setsReps: "3 × 10–12", equipment: "Dumbbell", whyAndCitation: "Front-loaded squat hits all four quad heads under full ROM.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndxYjJwaWRhZWhzNXVmcnNtd21mNXYwM2Z4MXR2cmM4NmR5eGJvMSZlcD12MV9pbnRlcm5hbF_naWZfYnlfaWQmY3Q9Zw/BQqI0jAN5n636/giphy.gif", isPRTrackable: true, muscleGroup: "Quads" },
          { id: "legs_quads_jump_squat", name: "Jump Squat", type: DetailedExerciseType.FINISHER, segment: "Quads Finisher", setsReps: "2 × 15", equipment: "Bodyweight", whyAndCitation: "Plyometric quad burst for power & extra caloric burn.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaW50ZGNlMWc3OTd1c2Q2b3M1dzd6eXpqdzd0aWoyZXJ3ejc4N3R6biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMyL44ihxAM1JGU/giphy.gif", muscleGroup: "Quads" },
        ]
      },
      {
        name: "2️⃣ Posterior Chain (Hamstrings & Glutes) (5 Exercises)",
        exercises: [
          { id: "legs_post_rdl", name: "Romanian Deadlift (Hams)", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Hamstrings (Long Head)", setsReps: "3 × 8–10", equipment: "Dumbbells or Barbell", whyAndCitation: "RDL elicits highest long-head biceps femoris EMG in posterior chain lifts.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaG9xZzFqejZ2ZDN2bDZxa29wZ2pxd2oxamN5azI2eHVhM210Z3B2aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Rivc43HOL2m3dM03m9/giphy.gif", isPRTrackable: true, muscleGroup: "Hamstrings" },
          { id: "legs_post_lying_leg_curl", name: "Lying Leg Curl", type: DetailedExerciseType.MAIN_ISOLATION, segment: "Hamstrings (Short Head)", setsReps: "3 × 12", equipment: "Leg-curl machine", whyAndCitation: "Prone leg curl strongly activates short head at lock-out.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjBrdHhlNjF0OGp0cm03aGJmcWoxOHYyYTRjcnRhMmVpOXU4MmxzNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kAUy2gDSzDB04/giphy.gif", muscleGroup: "Hamstrings" },
          { id: "legs_post_hip_thrust", name: "Dumbbell Hip Thrust", type: DetailedExerciseType.MAIN_COMPOUND, segment: "Gluteus Maximus", setsReps: "3 × 10–12", equipment: "Dumbbell + bench", whyAndCitation: "Hip thrusts activate glute max ~17% more than squat variations.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm11bzBncHlvbGR5MWF2YWw5cGZuN3Z1dDV6Nmd6ZTF4cDJuNDV6NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/AaosjR0k3jJpC/giphy.gif", isPRTrackable: true, muscleGroup: "Glutes" },
          { id: "legs_post_stiff_leg_dl", name: "Dumbbell Deadlift (Stiff-Leg)", type: DetailedExerciseType.MAIN_COMPOUND, segment: "All-Around Posterior", setsReps: "3 × 8–10", equipment: "Dumbbells", whyAndCitation: "Engages entire posterior chain under load—balance of hams, glutes.", imageUrl: "https://musclewiki.com/media/uploads/videos/branded/male-dumbbell-stiff-leg-deadlift-front.mp4#t=0.1", isPRTrackable: true, muscleGroup: "Hamstrings" }, // Using general hamstring image
          { id: "legs_post_broad_jump", name: "Broad Jump", type: DetailedExerciseType.FINISHER, segment: "Posterior Finisher", setsReps: "2 × 10", equipment: "Bodyweight", whyAndCitation: "Horizontal plyo for ham/glute power and metabolic blast.", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWtvY2hscHZlZjdsenQ0bmZ0bjc3ZmZnZzNqZ2x2dzhyMXRjbXU3byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2AskqBscYjRSE/giphy.gif", muscleGroup: "Glutes" },
        ]
      },
      {
        name: "🧘‍♂️ Leg-Day Cool-Down & Stretch (7 min)",
        exercises: [
          { id: "legs_cooldown_standing_quad_stretch", name: "Standing Quad Stretch", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each leg", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2s0ZHRkaHgybjN5MGJ3Z3NzOWt4ODV3b3QxZ2M1ZnE4bHN6eTdrNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/QMkPpxPDaWwIw/giphy.gif" },
          { id: "legs_cooldown_seated_hamstring_stretch", name: "Seated Hamstring Stretch", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each leg", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY3FqY2l6ZmQyZHR4MWQyMmszdGNsM3l1d3M4Mzk5ZWRwMW01aDByZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ieoocoo5n2n2U/giphy.gif" },
          { id: "legs_cooldown_figure_4_glute", name: "Figure-4 Glute Stretch", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each side", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcTYwM2w3emNwb2E5NnQzMHdpZ25obTV2MmRtb2YwbTFtMmtia2o2ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9KVFDYj3MoMMPAM0/giphy.gif" },
          { id: "legs_cooldown_calf_stretch_wall", name: "Calf Stretch (Wall)", type: DetailedExerciseType.COOLDOWN_STRETCH, setsReps: "30 sec each side", equipment: "Wall", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTVjZXdpODh1emJ3b2h0eHp3ajN3eDNyYWtndm55bWJqMTFqYW1xayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYDztY2Q302YffO/giphy.gif" },
          { id: "legs_cooldown_foam_roll_hams_glutes", name: "Foam-Roll Hamstrings & Glutes", type: DetailedExerciseType.COOLDOWN_FOAM_ROLL, setsReps: "1 min total", equipment: "Foam Roller", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNta250cWZ0YzN0cGw0dTRmNmJ5OHB6dWNmbmYwN2l0eDF2dGtrMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RltPNTzXYEwVy/giphy.gif" }, // general foam roll image
          { id: "legs_cooldown_breathing", name: "Deep Diaphragmatic Breathing", type: DetailedExerciseType.COOLDOWN_BREATHING, setsReps: "1 min", equipment: "Bodyweight", imageUrl: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndxYmhvYnU3amc5ZXd5cnl0MDF2ZzVhaGltaWt2ajM1eGh2MGlmNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKDXDbNBHGnYbPq/giphy.gif" },
        ]
      }
    ]
  }
];


export const MOCK_CFA_QUESTIONS: CFAQuestion[] = [
  { id: 'q1', topic: 'Ethics', question: 'What is the primary goal of GIPS standards?', options: ['Ensure fair representation', 'Guarantee investment returns', 'Standardize manager fees'], correctAnswer: 'Ensure fair representation', difficulty: 2 },
  { id: 'q2', topic: 'Quantitative Methods', question: 'A 95% confidence interval implies:', options: ['5% chance the true parameter is outside', '95% chance the sample mean is true', 'A Type I error rate of 5%'], correctAnswer: '5% chance the true parameter is outside', difficulty: 3 },
  { id: 'q3', topic: 'Economics', question: 'Which type of unemployment is associated with economic downturns?', options: ['Frictional', 'Structural', 'Cyclical'], correctAnswer: 'Cyclical', difficulty: 1 },
  { id: 'q4', topic: 'Financial Reporting', question: 'Under IFRS, inventory is valued at:', options: ['Lower of cost or net realizable value', 'FIFO only', 'Market value'], correctAnswer: 'Lower of cost or net realizable value', difficulty: 2 },
  { id: 'q5', topic: 'Corporate Finance', question: 'What does WACC stand for?', options: ['Weighted Average Cost of Capital', 'Working Asset Capital Cost', 'Weighted Asset Control Cost'], correctAnswer: 'Weighted Average Cost of Capital', difficulty: 1 },
];

export const CFA_TOPICS = ["Ethics", "Quantitative Methods", "Economics", "Financial Statement Analysis", "Corporate Issuers", "Equity Investments", "Fixed Income", "Derivatives", "Alternative Investments", "Portfolio Management"];


// SVG Icons
export const DumbbellIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m0 0A2.5 2.5 0 1012 20a2.5 2.5 0 000-2.253zM12 6.253A2.5 2.5 0 1012 4a2.5 2.5 0 000 2.253zM5.253 12H18.747m0 0A2.5 2.5 0 1021 12a2.5 2.5 0 00-2.253 0zM5.253 12A2.5 2.5 0 103 12a2.5 2.5 0 002.253 0z"></path>
  </svg>
);

export const BookIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m0 0A2.5 2.5 0 1012 20a2.5 2.5 0 000-2.253zM12 6.253A2.5 2.5 0 1012 4a2.5 2.5 0 000 2.253z" /> {/* Simplified open book */}
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19.5A2.5 2.5 0 016.5 17H20V2H6.5A2.5 2.5 0 004 4.5v15z" />
 </svg>
);


export const MeditationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17l4 4 4-4m-4-5v5m0 0V7a4 4 0 10-8 0v5a4 4 0 108 0v-5a4 4 0 10-8 0v5a4 4 0 108 0V7"></path>
    <circle cx="12" cy="5" r="1"></circle>
  </svg>
);

export const TrophyIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6.75A2.25 2.25 0 0111.25 4.5h1.5A2.25 2.25 0 0115 6.75V19M6.75 19H17.25M6 19H3.75m16.5 0H18m-12-3h12m-12 0a2.25 2.25 0 01-2.25-2.25V12a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v1.75A2.25 2.25 0 0118 16H6z"></path>
  </svg>
);

export const CogIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);

export const SunIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a4 4 0 110-8 4 4 0 010 8z"></path>
  </svg>
);

export const MoonIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
  </svg>
);

export const SpeakerWaveIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
  </svg>
);

export const MicrophoneIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

export const ClockIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const FireIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
</svg>
);

export const ChartBarIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
</svg>
);

export const SparklesIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75l-1.25-1.75L14.25 12l1.5-1.75L17 8.5l1.25 1.75L19.75 12l-1.5 1.75zM9.813 15.904L9 18.75l-.813-2.846m0 0L5.25 15l2.846-.813m0 0L9 11.25l.813 2.846m0 0L12.75 15l-2.846.813m0 0L9 18.75l.813-2.846M18.25 12l.39-.542M19.75 12l-.39.542m0 0L18.25 12m0 0L17 10.25l-1.25 1.75M17 8.5l1.25 1.75M17 13.75l1.25-1.75M17 13.75L15.75 12m1.5 1.75l1.5-1.75M14.25 12L15.75 12M17 8.5L17 5.25M17 13.75L17 10.25" />
</svg>
);

export const PlayIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);

export const PauseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);

export const ExternalLinkIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>
);

export const PlateIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12.5C3 9.46243 5.46243 7 8.5 7H15.5C18.5376 7 21 9.46243 21 12.5V12.5C21 15.5376 18.5376 18 15.5 18H8.5C5.46243 18 3 15.5376 3 12.5V12.5Z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 10V16"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 7L12 18"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 10V16"></path>
  </svg>
);

export const EyeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const EyeSlashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.57M2.25 2.25l19.5 19.5" />
 </svg>
);

export const BellIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
  </svg>
);

export const ShieldExclamationIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

export const CheckCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const TargetIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m-9-9h2m14 0h2" />
  </svg>
);

export const TrendingUpIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

export const PlusCircleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const TrashIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.24.032 3.287.082m9.273 0l-.346 9m-4.788 0L9.26 9" />
  </svg>
);

export const PencilIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const ListBulletIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export const ChevronUpIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);
// Chart related specific icons, if needed by Recharts custom components (usually not)
// For example, legend icons or custom dot icons.
// Standard Recharts usually handles these internally.
// export const LineChartIcon = ...
// export const BarChartIcon = ...
// export const PieChartIcon = ...
