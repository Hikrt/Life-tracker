
import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { TrendingUpIcon, BookIcon, DumbbellIcon, PlateIcon, FireIcon } from '../../constants';
import { WorkoutLog, CardioLog, MealAnalysis, StudySessionLog, Theme, DetailedExercise } from '../../types'; // Changed Exercise to DetailedExercise
import { WORKOUT_PLANS_DB } from '../../constants'; // Changed import
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

interface VisualDashboardProps {
  studySessionLogs: StudySessionLog[];
  workoutLogs: WorkoutLog[];
  cardioLogs: CardioLog[];
  dailyNutritionLog: MealAnalysis[];
  quickHitStreak: number;
  lastQuickHitDate: string | null;
  theme: Theme;
}

// Helper function to get dates for the last N days
const getLastNDates = (n: number): string[] => {
    const dates = [];
    for (let i = 0; i < n; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates.reverse(); // Oldest to newest
};

const VisualDashboard: React.FC<VisualDashboardProps> = ({
  studySessionLogs,
  workoutLogs,
  cardioLogs,
  dailyNutritionLog,
  quickHitStreak,
  lastQuickHitDate,
  theme
}) => {

  const chartTextColor = theme === 'light' ? '#1F2937' : theme === 'dark' ? '#F3F4F6' : '#FFFFFF';
  const chartGridColor = theme === 'light' ? '#e5e7eb' : theme === 'dark' ? '#374151' : '#4A5568';
  const chartTooltipBg = theme === 'light' ? '#FFFFFF' : theme === 'dark' ? '#1F2937' : '#000000';
  const chartTooltipBorder = theme === 'light' ? '#E5E7EB' : theme === 'dark' ? '#374151' : '#FFFFFF';

  const studyHeatmapData = useMemo(() => {
    const dailyTotals: { [date: string]: number } = {};
    studySessionLogs.forEach(log => {
        dailyTotals[log.date] = (dailyTotals[log.date] || 0) + (log.durationMinutes / 60);
    });
    const last30Days = getLastNDates(30);
    return last30Days.map(date => ({
        date: date.substring(5), // MM-DD
        hours: dailyTotals[date] || 0
    }));
  }, [studySessionLogs]);

  const prTrackableExercises: DetailedExercise[] = useMemo(() => {
    return WORKOUT_PLANS_DB.flatMap(plan => 
      plan.phases.flatMap(phase => phase.exercises)
    ).filter(ex => ex.isPRTrackable);
  }, []);


  const prTimelineData = useMemo(() => {
    const exercisePRs: { [exerciseName: string]: { date: string, weight: number }[] } = {};

    prTrackableExercises.forEach(ex => {
        if(ex) exercisePRs[ex.name] = [];
    });
    
    workoutLogs.forEach(log => {
        const exerciseConfig = prTrackableExercises.find(ex => ex?.id === log.exerciseId || ex?.name === log.exerciseName);
        if (exerciseConfig && log.weight > 0) {
            // Find if there's already an entry for this date or if this is a new PR for the date
            const existingEntryIndex = exercisePRs[exerciseConfig.name].findIndex(pr => pr.date === log.date);
            if (existingEntryIndex !== -1) {
                if (log.weight > exercisePRs[exerciseConfig.name][existingEntryIndex].weight) {
                    exercisePRs[exerciseConfig.name][existingEntryIndex].weight = log.weight;
                }
            } else {
                 exercisePRs[exerciseConfig.name].push({ date: log.date, weight: log.weight });
            }
        }
    });

    // Consolidate: ensure one PR per day by taking max, and then sort by date
    // And merge into a format suitable for Recharts (all series on same x-axis dates)
    const allDates = [...new Set(Object.values(exercisePRs).flat().map(pr => pr.date))].sort();
    
    const chartData = allDates.map(date => {
        const entry: any = { date: date.substring(5) }; // MM-DD
        prTrackableExercises.forEach(ex => {
            if(ex){
                const prForDate = exercisePRs[ex.name]?.find(pr => pr.date === date); // Added null check for exercisePRs[ex.name]
                entry[ex.name] = prForDate ? prForDate.weight : null; // Use null for Recharts to break line
            }
        });
        return entry;
    });

    return chartData;

  }, [workoutLogs, prTrackableExercises]);


  const nutritionTrendData = useMemo(() => {
    const dailyTotals: { [date: string]: { calories: number, protein: number, carbs: number, fat: number } } = {};
    dailyNutritionLog.forEach(meal => {
        if (!meal.date) return;
        if (!dailyTotals[meal.date]) {
            dailyTotals[meal.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        dailyTotals[meal.date].calories += meal.calories || 0;
        dailyTotals[meal.date].protein += meal.proteinGrams || 0;
        dailyTotals[meal.date].carbs += meal.carbGrams || 0;
        dailyTotals[meal.date].fat += meal.fatGrams || 0;
    });
    const last30Days = getLastNDates(30);
    return last30Days.map(date => ({
        date: date.substring(5), // MM-DD
        Calories: dailyTotals[date]?.calories || 0,
        Protein: dailyTotals[date]?.protein || 0,
        // Carbs: dailyTotals[date]?.carbs || 0,
        // Fat: dailyTotals[date]?.fat || 0,
    })).filter(d => d.Calories > 0 || d.Protein > 0); // Only show if some data logged
  }, [dailyNutritionLog]);

  const averageMacroPieData = useMemo(() => {
    if (dailyNutritionLog.length === 0) return [];
    const totals = dailyNutritionLog.reduce((acc, meal) => {
        acc.protein += meal.proteinGrams || 0;
        acc.carbs += meal.carbGrams || 0;
        acc.fat += meal.fatGrams || 0;
        return acc;
    }, { protein: 0, carbs: 0, fat: 0 });

    const totalMacros = totals.protein + totals.carbs + totals.fat;
    if (totalMacros === 0) return [];

    return [
        { name: 'Protein', value: parseFloat(((totals.protein / totalMacros) * 100).toFixed(1)) },
        { name: 'Carbs', value: parseFloat(((totals.carbs / totalMacros) * 100).toFixed(1)) },
        { name: 'Fat', value: parseFloat(((totals.fat / totalMacros) * 100).toFixed(1)) },
    ].filter(m => m.value > 0);
  }, [dailyNutritionLog]);

  const MACRO_PIE_COLORS = theme === 'high-contrast' 
    ? ['#FFFF00', '#00FFFF', '#FF00FF'] 
    : ['#1E88E5', '#43A047', '#FDD835'];
  
  const PR_LINE_COLORS = theme === 'high-contrast'
    ? ['#FFFF00', '#00FFFF', '#FF00FF', '#FFFFFF', '#FFA500'] // HC Yellow, Cyan, Magenta, White, Orange
    : ['#1E88E5', '#43A047', '#FDD835', '#EF4444', '#8A2BE2']; // Blue, Green, Yellow, Red, BlueViolet

  // Streak Calendar simple display
  const studyStreak = useMemo(() => {
    if (studySessionLogs.length === 0) return 0;
    const uniqueStudyDays = [...new Set(studySessionLogs.map(log => log.date))].sort().reverse();
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];

    if (uniqueStudyDays[0] === today || uniqueStudyDays[0] === yesterday) {
        currentStreak = 1;
        for (let i = 0; i < uniqueStudyDays.length - 1; i++) {
            const day1 = new Date(uniqueStudyDays[i]);
            const day2 = new Date(uniqueStudyDays[i+1]);
            const diffTime = day1.getTime() - day2.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
         // If the most recent study day is yesterday, and today no study, streak is still valid but doesn't increment for today.
        if(uniqueStudyDays[0] === yesterday && !studySessionLogs.find(log => log.date === today)) {
           // no change to currentStreak, it counts up to yesterday.
        } else if (uniqueStudyDays[0] !== today && uniqueStudyDays[0] !== yesterday) {
            currentStreak = 0; // If most recent day is not today or yesterday, streak broken.
        }


    }
    return currentStreak;
  }, [studySessionLogs]);


  return (
    <div className="space-y-6">
      <Card title="Goal Visualizations" titleIcon={<TrendingUpIcon className="high-contrast:text-hc-primary"/>}>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6 high-contrast:text-gray-300">
          See your progress at a glance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Daily Study Hours (Last 30 Days)" titleIcon={<BookIcon className="text-blue-500 high-contrast:text-hc-primary"/>}>
            <div className="h-64">
              {studyHeatmapData.some(d => d.hours > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyHeatmapData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="date" stroke={chartTextColor} tick={{fontSize: 10}} />
                    <YAxis stroke={chartTextColor} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: chartTextColor, fontSize: 12 }} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}}
                        itemStyle={{ color: chartTextColor }}
                        labelStyle={{ color: chartTextColor }}
                        wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                    />
                    <Bar dataKey="hours" fill={theme === 'high-contrast' ? '#FFFF00' : '#1E88E5'} name="Study Hours" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-10 text-center">Log study sessions to see data.</p>
              )}
            </div>
          </Card>

          <Card title="Workout PR Timeline (Max Weight Kg)" titleIcon={<DumbbellIcon className="text-green-500 high-contrast:text-hc-secondary"/>}>
            <div className="h-64">
              {prTimelineData.length > 0 && prTrackableExercises.some(ex => ex && prTimelineData.some(d => d[ex.name])) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prTimelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="date" stroke={chartTextColor} tick={{fontSize: 10}} />
                    <YAxis stroke={chartTextColor} label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', fill: chartTextColor, fontSize: 12 }} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}}
                        itemStyle={{ color: chartTextColor }}
                        labelStyle={{ color: chartTextColor }}
                        wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                    />
                    <Legend wrapperStyle={{ color: chartTextColor, fontSize: 10 }} />
                    {prTrackableExercises.map((ex, index) => (
                      ex && prTimelineData.some(d => d[ex.name] != null) && // Check if data exists for this exercise
                      <Line key={ex.id} type="monotone" dataKey={ex.name} stroke={PR_LINE_COLORS[index % PR_LINE_COLORS.length]} name={ex.name} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                 <p className="text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-10 text-center">Log PR-trackable workouts (e.g., Bench, Squat) to see data.</p>
              )}
            </div>
          </Card>

          <Card title="Nutrition Insights (Avg. Macros & Calorie Trend)" titleIcon={<PlateIcon className="text-red-500 high-contrast:text-red-400"/>}>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-72">
                <div className="h-full min-h-[200px]">
                    <h4 className="text-xs font-semibold text-center mb-1 high-contrast:text-hc-text">Avg. Macronutrient Split (%)</h4>
                    {averageMacroPieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie data={averageMacroPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="70%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                    {averageMacroPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={MACRO_PIE_COLORS[index % MACRO_PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}}
                                    itemStyle={{ color: chartTextColor }}
                                    wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                                />
                                <Legend wrapperStyle={{ color: chartTextColor, fontSize: '10px', marginTop: '5px' }} layout="horizontal" verticalAlign="bottom" align="center"/>
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-5 text-center">Log meals for macro split.</p>
                    )}
                </div>
                 <div className="h-full min-h-[200px]">
                    <h4 className="text-xs font-semibold text-center mb-1 high-contrast:text-hc-text">Daily Calorie Intake Trend</h4>
                    {nutritionTrendData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={nutritionTrendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                                <XAxis dataKey="date" stroke={chartTextColor} tick={{fontSize: 10}} />
                                <YAxis stroke={chartTextColor} label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: chartTextColor, fontSize: 10 }} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}}
                                    itemStyle={{ color: chartTextColor }}
                                    labelStyle={{ color: chartTextColor }}
                                    wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                                />
                                <Line type="monotone" dataKey="Calories" stroke={theme === 'high-contrast' ? '#FF00FF' : '#FDD835'} name="Calories" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-5 text-center">Log meals for calorie trend.</p>
                    )}
                </div>
             </div>
          </Card>

          <Card title="Current Streaks" titleIcon={<FireIcon className="text-orange-500 high-contrast:text-hc-accent"/>}>
            <div className="h-64 bg-gray-50 dark:bg-gray-700/30 flex flex-col items-center justify-center rounded p-4 high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-border space-y-4">
              <div className="text-center">
                <p className="text-lg font-semibold high-contrast:text-hc-text">Quick Hit Streak:</p>
                <p className="text-3xl font-bold text-red-500 dark:text-red-400 high-contrast:text-hc-accent">{quickHitStreak} Days</p>
                {lastQuickHitDate && <p className="text-xs text-gray-500 dark:text-gray-400 high-contrast:text-gray-300">Last on: {new Date(lastQuickHitDate).toLocaleDateString()}</p>}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold high-contrast:text-hc-text">Study Session Streak:</p>
                <p className="text-3xl font-bold text-blue-500 dark:text-blue-400 high-contrast:text-hc-primary">{studyStreak} Days</p>
                 {studySessionLogs.length > 0 && studySessionLogs[studySessionLogs.length-1] &&
                    <p className="text-xs text-gray-500 dark:text-gray-400 high-contrast:text-gray-300">
                        Last study on: {new Date(studySessionLogs[studySessionLogs.length-1].date).toLocaleDateString()}
                    </p>
                 }
              </div>
               <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 high-contrast:text-gray-300">
                (Streak calendar grid visualization would be an advanced feature)
              </p>
            </div>
          </Card>
        </div>
        
      </Card>
    </div>
  );
};

export default VisualDashboard;
