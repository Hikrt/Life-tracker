
import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { ChartBarIcon, BookIcon, DumbbellIcon, TrophyIcon, PlateIcon, SparklesIcon } from '../../constants';
import { WorkoutLog, CardioLog, MealAnalysis, StudySessionLog, Theme } from '../../types';
import { PointsTracker } from '../motivation/PointsTracker'; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface GlobalAnalyticsDashboardProps {
  studyHoursTotal: number;
  studySessionLogs: StudySessionLog[];
  workoutLogs: WorkoutLog[];
  cardioLogs: CardioLog[];
  points: number;
  dailyNutritionLog: MealAnalysis[]; // Full log, not just today's
  theme: Theme;
}

const GlobalAnalyticsDashboard: React.FC<GlobalAnalyticsDashboardProps> = ({
  studyHoursTotal,
  studySessionLogs,
  workoutLogs,
  cardioLogs,
  points,
  dailyNutritionLog,
  theme,
}) => {
  const totalWorkouts = workoutLogs.length + cardioLogs.length; 
  
  const chartTextColor = theme === 'light' ? '#1F2937' : theme === 'dark' ? '#F3F4F6' : '#FFFFFF';
  const chartGridColor = theme === 'light' ? '#e5e7eb' : theme === 'dark' ? '#374151' : '#4A5568'; // Softer for HC grid
  const chartTooltipBg = theme === 'light' ? '#FFFFFF' : theme === 'dark' ? '#1F2937' : '#000000';
  const chartTooltipBorder = theme === 'light' ? '#E5E7EB' : theme === 'dark' ? '#374151' : '#FFFFFF';


  const dailyStudyData = useMemo(() => {
    const aggregated: { [date: string]: number } = {};
    studySessionLogs.forEach(log => {
      aggregated[log.date] = (aggregated[log.date] || 0) + (log.durationMinutes / 60);
    });
    // Get last 30 days for display
    const last30DaysData = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        last30DaysData.push({
            date: dateString.substring(5), // MM-DD
            hours: aggregated[dateString] || 0,
        });
    }
    return last30DaysData;
  }, [studySessionLogs]);

  const dailyCalorieData = useMemo(() => {
    const aggregated: { [date: string]: number } = {};
    dailyNutritionLog.forEach(meal => {
      if (meal.date && meal.calories) {
        aggregated[meal.date] = (aggregated[meal.date] || 0) + meal.calories;
      }
    });
    const last30DaysData = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        last30DaysData.push({
            date: dateString.substring(5), // MM-DD
            calories: aggregated[dateString] || 0,
        });
    }
    return last30DaysData.filter(d => d.calories > 0); // Only show days with logged calories
  }, [dailyNutritionLog]);

  const averageMacroData = useMemo(() => {
    if (dailyNutritionLog.length === 0) return [];
    const totals = dailyNutritionLog.reduce((acc, meal) => {
        acc.protein += meal.proteinGrams || 0;
        acc.carbs += meal.carbGrams || 0;
        acc.fat += meal.fatGrams || 0;
        acc.count +=1;
        return acc;
    }, { protein: 0, carbs: 0, fat: 0, count: 0 });

    if (totals.count === 0) return [];
    const totalMacros = totals.protein + totals.carbs + totals.fat;
    if (totalMacros === 0) return [];

    return [
        { name: 'Protein', value: parseFloat(((totals.protein / totalMacros) * 100).toFixed(1)) },
        { name: 'Carbs', value: parseFloat(((totals.carbs / totalMacros) * 100).toFixed(1)) },
        { name: 'Fat', value: parseFloat(((totals.fat / totalMacros) * 100).toFixed(1)) },
    ].filter(m => m.value > 0);
  }, [dailyNutritionLog]);
  
  const MACRO_COLORS = theme === 'high-contrast' 
    ? ['#FFFF00', '#00FFFF', '#FF00FF'] // HC Primary, Secondary, Accent
    : ['#1E88E5', '#43A047', '#FDD835']; // Primary, Secondary, Accent


  const totalCaloriesToday = dailyNutritionLog
    .filter(meal => meal.date === new Date().toISOString().split('T')[0])
    .reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProteinToday = dailyNutritionLog
    .filter(meal => meal.date === new Date().toISOString().split('T')[0])
    .reduce((sum, meal) => sum + (meal.proteinGrams || 0), 0);


  return (
    <div className="space-y-6">
      <Card title="Overall Progress Snapshot" titleIcon={<ChartBarIcon className="high-contrast:text-hc-primary"/>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-primary">
            <BookIcon className="w-8 h-8 mx-auto text-blue-500 dark:text-blue-400 high-contrast:text-hc-primary mb-2" />
            <p className="text-2xl font-bold high-contrast:text-hc-text">{studyHoursTotal.toFixed(1)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 high-contrast:text-gray-300">Total Study Hours</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-secondary">
            <DumbbellIcon className="w-8 h-8 mx-auto text-green-500 dark:text-green-400 high-contrast:text-hc-secondary mb-2" />
            <p className="text-2xl font-bold high-contrast:text-hc-text">{totalWorkouts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 high-contrast:text-gray-300">Total Workouts</p>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-accent">
            <TrophyIcon className="w-8 h-8 mx-auto text-yellow-500 dark:text-yellow-400 high-contrast:text-hc-accent mb-2" />
            <p className="text-2xl font-bold high-contrast:text-hc-text">{points}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 high-contrast:text-gray-300">Total Points</p>
          </div>
           <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg high-contrast:bg-hc-bg high-contrast:border high-contrast:border-red-500">
            <PlateIcon className="w-8 h-8 mx-auto text-red-500 dark:text-red-400 high-contrast:text-red-400 mb-2" />
            <p className="text-2xl font-bold high-contrast:text-hc-text">{totalCaloriesToday.toFixed(0)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 high-contrast:text-gray-300">Calories Today (Est.)</p>
            <p className="text-xs text-gray-500 dark:text-gray-300 high-contrast:text-gray-300">Protein: {totalProteinToday.toFixed(0)}g</p>
          </div>
        </div>
      </Card>

      <Card title="Daily Study Hours (Last 30 Days)" titleIcon={<BookIcon className="high-contrast:text-hc-primary"/>}>
        <div className="h-72">
          {dailyStudyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStudyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="date" stroke={chartTextColor} tick={{fontSize: 10}} />
                <YAxis stroke={chartTextColor} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: chartTextColor, fontSize: 12 }} />
                <RechartsTooltip 
                    contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}} 
                    itemStyle={{ color: chartTextColor }}
                    labelStyle={{ color: chartTextColor }}
                    wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                />
                <Legend wrapperStyle={{ color: chartTextColor }} />
                <Bar dataKey="hours" fill={theme === 'high-contrast' ? '#FFFF00' : '#1E88E5'} name="Study Hours" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-10">Log study sessions to see daily trends.</p>
          )}
        </div>
      </Card>
      
      <Card title="Nutrition Overview (Last 30 Days)" titleIcon={<PlateIcon className="high-contrast:text-hc-primary"/>}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-72">
                <h4 className="text-sm font-semibold text-center mb-2 high-contrast:text-hc-text">Avg. Macronutrient Split</h4>
                {averageMacroData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={averageMacroData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                {averageMacroData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}} 
                                itemStyle={{ color: chartTextColor }}
                                wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                            />
                            <Legend wrapperStyle={{ color: chartTextColor, fontSize: '10px', marginTop: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                     <p className="text-center text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-10">Log meals to see macro split.</p>
                )}
            </div>
            <div className="h-72">
                 <h4 className="text-sm font-semibold text-center mb-2 high-contrast:text-hc-text">Daily Calorie Intake Trend</h4>
                {dailyCalorieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyCalorieData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                            <XAxis dataKey="date" stroke={chartTextColor} tick={{fontSize: 10}} />
                            <YAxis stroke={chartTextColor} label={{ value: 'Calories', angle: -90, position: 'insideLeft', fill: chartTextColor, fontSize: 12 }} />
                            <RechartsTooltip 
                                contentStyle={{ backgroundColor: chartTooltipBg, border: `1px solid ${chartTooltipBorder}`, color: chartTextColor}} 
                                itemStyle={{ color: chartTextColor }}
                                labelStyle={{ color: chartTextColor }}
                                wrapperClassName={theme === 'high-contrast' ? 'high-contrast-tooltip' : ''}
                            />
                            <Legend wrapperStyle={{ color: chartTextColor }} />
                            <Line type="monotone" dataKey="calories" stroke={theme === 'high-contrast' ? '#FF00FF' : '#FDD835'} name="Total Calories" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 high-contrast:text-hc-text p-10">Log meals to see calorie trends.</p>
                )}
            </div>
         </div>
      </Card>
      
      <Card title="Personalized Insights & Forecasts (AI Driven)" titleIcon={<SparklesIcon className="high-contrast:text-hc-primary"/>}>
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg high-contrast:bg-hc-bg high-contrast:border high-contrast:border-hc-primary high-contrast:text-hc-text">
          <li>"At your current study pace, you'll hit 500 hours by <span className="font-semibold text-primary dark:text-blue-300 high-contrast:text-hc-primary">July 20th, 2025</span>." (Dynamic forecast)</li>
          <li>"Consider adding a 5-minute mindfulness session after your Push Day workouts. It may improve recovery." (Habit-stack suggestion)</li>
          <li>"Your quiz accuracy on 'Ethics' is slightly lower. Review Chapter 3 this week." (Personalized feedback)</li>
          <li>"Based on today's logged meals, you're on track for your protein target." (Nutrition insight)</li>
        </ul>
        <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400 high-contrast:text-gray-300">
            These insights would be generated by the Gemini API based on your data.
        </p>
      </Card>
      
      <PointsTracker currentPoints={points} />

    </div>
  );
};

export default GlobalAnalyticsDashboard;
